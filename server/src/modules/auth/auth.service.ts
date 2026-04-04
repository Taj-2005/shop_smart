import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { hashPassword, comparePassword, hashToken, generateToken } from "../../utils/hash";
import { AppError } from "../../middleware/errorHandler";
import { Prisma } from "@prisma/client";
import type { IAuthProvider } from "../../interfaces/IAuthProvider";
import type { AuthNotificationContext, INotificationStrategy } from "../../interfaces/INotificationStrategy";
import { authNotificationStrategies, authProvider } from "../../services/registry";

const REFRESH_DAYS = env.JWT_REFRESH_EXPIRES_DAYS;
const VERIFY_EXPIRES_MS = 24 * 60 * 60 * 1000;
const RESET_EXPIRES_MS = 60 * 60 * 1000;

function toUserResponse(user: {
  id: string;
  email: string;
  fullName: string;
  role: { name: string };
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role.name,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

export class AuthService {
  constructor(
    private readonly notificationStrategies: readonly INotificationStrategy[],
    private readonly tokens: IAuthProvider
  ) {}

  private async dispatchNotifications(ctx: AuthNotificationContext): Promise<void> {
    await Promise.all(this.notificationStrategies.map((s) => s.send(ctx)));
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    roleRequest?: "admin";
  }) {
    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (existing) throw new AppError(409, "An account with this email already exists", "CONFLICT");

    const customerRole = await prisma.role.findUnique({ where: { name: "CUSTOMER" } });
    if (!customerRole) throw new AppError(500, "Roles not seeded");

    const passwordHash = await hashPassword(data.password);
    const verifyToken = generateToken();
    const verifyTokenHash = hashToken(verifyToken);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: data.fullName.trim(),
        roleId: customerRole.id,
        emailVerified: false,
        emailVerifyToken: verifyTokenHash,
        emailVerifyExpires: new Date(Date.now() + VERIFY_EXPIRES_MS),
      },
      include: { role: true },
    });

    this.dispatchNotifications({
      kind: "verification",
      email: user.email,
      token: verifyToken,
    }).catch(() => {});

    const accessToken = this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });
    const jti = uuidv4();
    const refreshToken = this.tokens.signRefreshToken(user.id, jti);
    const refreshExpires = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        id: jti,
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: refreshExpires,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.tokens.getAccessTokenExpiresInSeconds(),
      user: toUserResponse(user),
    };
  }

  async login(data: { email: string; password: string }, _ip?: string) {
    const email = data.email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { role: true },
    });
    if (!user || !user.active) {
      throw new AppError(401, "Invalid email or password", "UNAUTHORIZED");
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(423, "Account temporarily locked. Try again later.", "LOCKED");
    }

    const match = await comparePassword(data.password, user.passwordHash);
    if (!match) {
      const failed = user.failedLogins + 1;
      const updates: Prisma.UserUpdateInput = { failedLogins: failed };
      if (failed >= env.MAX_FAILED_LOGINS) {
        updates.lockedUntil = new Date(Date.now() + env.LOCKOUT_MINUTES * 60 * 1000);
      }
      await prisma.user.update({ where: { id: user.id }, data: updates });
      throw new AppError(401, "Invalid email or password", "UNAUTHORIZED");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null },
    });

    const accessToken = this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });
    const jti = uuidv4();
    const refreshToken = this.tokens.signRefreshToken(user.id, jti);
    const refreshExpires = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        id: jti,
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: refreshExpires,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.tokens.getAccessTokenExpiresInSeconds(),
      user: toUserResponse(user),
    };
  }

  async refresh(refreshToken: string) {
    const payload = this.tokens.verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findFirst({
      where: { id: payload.jti, tokenHash, revoked: false },
      include: { user: { include: { role: true } } },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, "Invalid or expired refresh token", "UNAUTHORIZED");
    }
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const user = stored.user;
    if (!user.active || user.deletedAt) {
      throw new AppError(401, "User inactive", "UNAUTHORIZED");
    }

    const accessToken = this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });
    const jti = uuidv4();
    const newRefresh = this.tokens.signRefreshToken(user.id, jti);
    const refreshExpires = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        id: jti,
        tokenHash: hashToken(newRefresh),
        userId: user.id,
        expiresAt: refreshExpires,
      },
    });

    return {
      accessToken,
      refreshToken: newRefresh,
      expiresIn: this.tokens.getAccessTokenExpiresInSeconds(),
      user: toUserResponse(user),
    };
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  async verifyEmail(token: string) {
    const tokenHash = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: tokenHash,
        emailVerifyExpires: { gte: new Date() },
      },
      include: { role: true },
    });
    if (!user) throw new AppError(400, "Invalid or expired verification link", "BAD_REQUEST");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });
    return { user: toUserResponse({ ...user, emailVerified: true }) };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), deletedAt: null },
    });
    if (user) {
      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: tokenHash,
          resetTokenExpires: new Date(Date.now() + RESET_EXPIRES_MS),
        },
      });
      await this.dispatchNotifications({
        kind: "password_reset",
        email: user.email,
        token,
      });
    }
    return { message: "If an account exists with this email, you will receive a reset link." };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpires: { gte: new Date() },
      },
      include: { role: true },
    });
    if (!user) throw new AppError(400, "Invalid or expired reset token", "BAD_REQUEST");
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpires: null,
        failedLogins: 0,
        lockedUntil: null,
      },
    });
    return { message: "Password has been reset." };
  }

  async me(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { role: true },
    });
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");
    return toUserResponse(user);
  }
}

export const authService = new AuthService(authNotificationStrategies, authProvider);
