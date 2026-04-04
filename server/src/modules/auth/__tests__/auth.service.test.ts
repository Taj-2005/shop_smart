import { AuthService } from "../auth.service";
import type { IHashService } from "../../../interfaces/IHashService";
import type { IRefreshTokenStore } from "../../../interfaces/IRefreshTokenStore";
import type { IRoleReader } from "../../../interfaces/IRoleReader";
import type { ITokenService } from "../../../interfaces/ITokenService";
import type { IUserCredentialReader } from "../../../interfaces/IUserCredentialReader";
import type { IUserCredentialWriter } from "../../../interfaces/IUserCredentialWriter";

const customerRole = { id: "role-1", name: "CUSTOMER" };
const mockUser = {
  id: "user-1",
  email: "u@test.com",
  fullName: "User One",
  passwordHash: "hash",
  roleId: "role-1",
  role: customerRole,
  active: true,
  deletedAt: null,
  emailVerified: true,
  emailVerifyToken: null,
  emailVerifyExpires: null,
  failedLogins: 0,
  lockedUntil: null,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  resetTokenHash: null,
  resetTokenExpires: null,
};

function buildService(deps: {
  userReader?: Partial<IUserCredentialReader>;
  userWriter?: Partial<IUserCredentialWriter>;
  refreshStore?: Partial<IRefreshTokenStore>;
}) {
  const notificationSenders = [{ channel: "email" as const, send: jest.fn().mockResolvedValue(undefined) }];
  const hash: IHashService = {
    hashPassword: jest.fn((p: string) => Promise.resolve(`hashed:${p}`)),
    comparePassword: jest.fn(() => Promise.resolve(true)),
    hashToken: jest.fn((t: string) => t + "-hashed"),
    generateToken: jest.fn(() => "random-token"),
  };
  const tokens: ITokenService = {
    name: "test",
    signAccessToken: jest.fn(() => "access.jwt"),
    signRefreshToken: jest.fn(() => "refresh.jwt"),
    verifyRefreshToken: jest.fn(() => {
      throw new Error("invalid");
    }),
    verifyAccessToken: jest.fn(),
    getAccessTokenExpiresInSeconds: jest.fn(() => 3600),
  };
  const roleReader: IRoleReader = {
    findRoleIdByName: jest.fn().mockResolvedValue("role-1"),
  };
  const userReader: IUserCredentialReader = {
    existsByEmail: jest.fn(),
    findForLogin: jest.fn(),
    findWithRoleByIdForMe: jest.fn(),
    findByEmailVerifyTokenHash: jest.fn(),
    findByPasswordResetTokenHash: jest.fn(),
    findBasicByEmail: jest.fn(),
    ...deps.userReader,
  };
  const userWriter: IUserCredentialWriter = {
    createCustomer: jest.fn(),
    updateFailedLogin: jest.fn(),
    clearFailedLoginAndLockout: jest.fn(),
    markEmailVerified: jest.fn(),
    setPasswordResetToken: jest.fn(),
    applyPasswordReset: jest.fn(),
    ...deps.userWriter,
  };
  const refreshStore: IRefreshTokenStore = {
    create: jest.fn().mockResolvedValue(undefined),
    findValidWithUser: jest.fn(),
    revokeById: jest.fn(),
    revokeAllByTokenHash: jest.fn(),
    ...deps.refreshStore,
  };
  return new AuthService(notificationSenders, tokens, hash, roleReader, userReader, userWriter, refreshStore);
}

function resetMocks() {
  jest.clearAllMocks();
}

describe("auth.service", () => {
  describe("register", () => {
    beforeEach(resetMocks);

    it("creates user and returns tokens when email is new", async () => {
      const userReader = {
        existsByEmail: jest.fn().mockResolvedValue(false),
      };
      const userWriter = {
        createCustomer: jest.fn().mockResolvedValue(mockUser),
      };
      const svc = buildService({ userReader, userWriter });

      const result = await svc.register({
        email: "new@test.com",
        password: "Pass123!",
        fullName: "New User",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result).toHaveProperty("expiresIn", 3600);
      expect(result.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: "CUSTOMER",
      });
      expect(userReader.existsByEmail).toHaveBeenCalledWith("new@test.com");
      expect(userWriter.createCustomer).toHaveBeenCalled();
    });

    it("throws 409 when email already exists", async () => {
      const userReader = {
        existsByEmail: jest.fn().mockResolvedValue(true),
      };
      const userWriter = { createCustomer: jest.fn() };
      const svc = buildService({ userReader, userWriter });

      await expect(
        svc.register({
          email: "u@test.com",
          password: "Pass123!",
          fullName: "User",
        })
      ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });

      expect(userWriter.createCustomer).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    beforeEach(resetMocks);

    it("returns tokens for valid credentials", async () => {
      const userReader = {
        findForLogin: jest.fn().mockResolvedValue(mockUser),
      };
      const userWriter = {
        clearFailedLoginAndLockout: jest.fn().mockResolvedValue(undefined),
      };
      const svc = buildService({ userReader, userWriter });

      const result = await svc.login({
        email: "u@test.com",
        password: "correct-password",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user).toMatchObject({ email: mockUser.email });
    });

    it("throws 401 when user not found", async () => {
      const userReader = { findForLogin: jest.fn().mockResolvedValue(null) };
      const svc = buildService({ userReader });

      await expect(svc.login({ email: "none@test.com", password: "any" })).rejects.toMatchObject({
        statusCode: 401,
        code: "UNAUTHORIZED",
      });
    });

    it("throws 423 when account is locked", async () => {
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 60000),
      };
      const userReader = { findForLogin: jest.fn().mockResolvedValue(lockedUser) };
      const svc = buildService({ userReader });

      await expect(svc.login({ email: "u@test.com", password: "any" })).rejects.toMatchObject({
        statusCode: 423,
        code: "LOCKED",
      });
    });
  });

  describe("refresh", () => {
    beforeEach(resetMocks);

    it("throws when refresh token is invalid JWT", async () => {
      const svc = buildService({});
      await expect(svc.refresh("invalid-jwt")).rejects.toThrow();
    });
  });

  describe("logout", () => {
    beforeEach(resetMocks);

    it("does not throw when token is undefined", async () => {
      const refreshStore = { revokeAllByTokenHash: jest.fn() };
      const svc = buildService({ refreshStore });
      await expect(svc.logout(undefined)).resolves.toBeUndefined();
      expect(refreshStore.revokeAllByTokenHash).not.toHaveBeenCalled();
    });
  });

  describe("me", () => {
    beforeEach(resetMocks);

    it("returns user when found", async () => {
      const userReader = { findWithRoleByIdForMe: jest.fn().mockResolvedValue(mockUser) };
      const svc = buildService({ userReader });

      const result = await svc.me("user-1");

      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: "CUSTOMER",
      });
    });

    it("throws 404 when user not found", async () => {
      const userReader = { findWithRoleByIdForMe: jest.fn().mockResolvedValue(null) };
      const svc = buildService({ userReader });

      await expect(svc.me("missing-id")).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });
  });
});
