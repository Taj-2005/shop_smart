import { v4 as uuidv4 } from "uuid";
import { Prisma, RoleType } from "@prisma/client";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import type { IAuthNotificationSender } from "../../interfaces/IAuthNotificationSender";
import type { AuthNotificationContext } from "../../interfaces/INotificationKinds";
import type { IHashService } from "../../interfaces/IHashService";
import type { IRefreshTokenStore } from "../../interfaces/IRefreshTokenStore";
import type { IRoleReader } from "../../interfaces/IRoleReader";
import type { ITokenService } from "../../interfaces/ITokenService";
import type { IUserCredentialReader } from "../../interfaces/IUserCredentialReader";
import type { IUserCredentialWriter } from "../../interfaces/IUserCredentialWriter";

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
    private readonly notificationSenders: readonly IAuthNotificationSender[],
    private readonly tokens: ITokenService,
    private readonly hash: IHashService,
    private readonly roleReader: IRoleReader,
    private readonly userReader: IUserCredentialReader,
    private readonly userWriter: IUserCredentialWriter,
    private readonly refreshStore: IRefreshTokenStore
  ) {}

  private async dispatchNotifications(ctx: AuthNotificationContext): Promise<void> {
    await Promise.all(this.notificationSenders.map((s) => s.send(ctx)));
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    roleRequest?: "admin";
  }) {
    const email = data.email.toLowerCase().trim();
    const existing = await this.userReader.existsByEmail(email);
    if (existing) throw new AppError(409, "An account with this email already exists", "CONFLICT");

    const roleId = await this.roleReader.findRoleIdByName(RoleType.CUSTOMER);
    if (!roleId) throw new AppError(500, "Roles not seeded");

    const passwordHash = await this.hash.hashPassword(data.password);
    const verifyToken = this.hash.generateToken();
    const verifyTokenHash = this.hash.hashToken(verifyToken);

    const user = await this.userWriter.createCustomer({
      email,
      passwordHash,
      fullName: data.fullName.trim(),
      roleId,
      emailVerifyTokenHash: verifyTokenHash,
      emailVerifyExpires: new Date(Date.now() + VERIFY_EXPIRES_MS),
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
    await this.refreshStore.create({
      id: jti,
      tokenHash: this.hash.hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpires,
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
    const user = await this.userReader.findForLogin(email);
    if (!user || !user.active) {
      throw new AppError(401, "Invalid email or password", "UNAUTHORIZED");
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(423, "Account temporarily locked. Try again later.", "LOCKED");
    }

    const match = await this.hash.comparePassword(data.password, user.passwordHash);
    if (!match) {
      const failed = user.failedLogins + 1;
      const updates: Prisma.UserUpdateInput = { failedLogins: failed };
      if (failed >= env.MAX_FAILED_LOGINS) {
        updates.lockedUntil = new Date(Date.now() + env.LOCKOUT_MINUTES * 60 * 1000);
      }
      await this.userWriter.updateFailedLogin(user.id, updates);
      throw new AppError(401, "Invalid email or password", "UNAUTHORIZED");
    }

    await this.userWriter.clearFailedLoginAndLockout(user.id);

    const accessToken = this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });
    const jti = uuidv4();
    const refreshToken = this.tokens.signRefreshToken(user.id, jti);
    const refreshExpires = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
    await this.refreshStore.create({
      id: jti,
      tokenHash: this.hash.hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpires,
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
    const tokenHash = this.hash.hashToken(refreshToken);
    const stored = await this.refreshStore.findValidWithUser(payload.jti, tokenHash);
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, "Invalid or expired refresh token", "UNAUTHORIZED");
    }
    await this.refreshStore.revokeById(stored.id);

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
    await this.refreshStore.create({
      id: jti,
      tokenHash: this.hash.hashToken(newRefresh),
      userId: user.id,
      expiresAt: refreshExpires,
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
    const tokenHash = this.hash.hashToken(refreshToken);
    await this.refreshStore.revokeAllByTokenHash(tokenHash);
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hash.hashToken(token);
    const user = await this.userReader.findByEmailVerifyTokenHash(tokenHash);
    if (!user) throw new AppError(400, "Invalid or expired verification link", "BAD_REQUEST");
    await this.userWriter.markEmailVerified(user.id);
    return { user: toUserResponse({ ...user, emailVerified: true }) };
  }

  async forgotPassword(email: string) {
    const user = await this.userReader.findBasicByEmail(email.toLowerCase().trim());
    if (user) {
      const token = this.hash.generateToken();
      const tokenHash = this.hash.hashToken(token);
      await this.userWriter.setPasswordResetToken(
        user.id,
        tokenHash,
        new Date(Date.now() + RESET_EXPIRES_MS)
      );
      await this.dispatchNotifications({
        kind: "password_reset",
        email: user.email,
        token,
      });
    }
    return { message: "If an account exists with this email, you will receive a reset link." };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hash.hashToken(token);
    const user = await this.userReader.findByPasswordResetTokenHash(tokenHash);
    if (!user) throw new AppError(400, "Invalid or expired reset token", "BAD_REQUEST");
    const passwordHash = await this.hash.hashPassword(newPassword);
    await this.userWriter.applyPasswordReset(user.id, passwordHash);
    return { message: "Password has been reset." };
  }

  async me(userId: string) {
    const user = await this.userReader.findWithRoleByIdForMe(userId);
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");
    return toUserResponse(user);
  }
}
