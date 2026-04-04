import { authService } from "../auth.service";

jest.mock("../../../config/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: { findUnique: jest.fn() },
    refreshToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

jest.mock("../../../utils/email", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../utils/hash", () => ({
  hashPassword: jest.fn((p: string) => Promise.resolve(`hashed:${p}`)),
  comparePassword: jest.fn(() => Promise.resolve(true)),
  hashToken: jest.fn((t: string) => t + "-hashed"),
  generateToken: jest.fn(() => "random-token"),
}));

import { prisma } from "../../../config/prisma";

type MockPrisma = {
  user: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  role: { findUnique: jest.Mock };
  refreshToken: {
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
};
const mockPrisma = prisma as unknown as MockPrisma;

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

function resetMocks() {
  jest.clearAllMocks();
}

describe("auth.service", () => {
  describe("register", () => {
    beforeEach(resetMocks);

    it("creates user and returns tokens when email is new", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(customerRole as any);
      mockPrisma.user.create.mockResolvedValue(mockUser as any);
      mockPrisma.refreshToken.create.mockResolvedValue({} as any);

      const result = await authService.register({
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
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ email: "new@test.com" }) })
      );
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it("throws 409 when email already exists", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser as any);

      await expect(
        authService.register({
          email: "u@test.com",
          password: "Pass123!",
          fullName: "User",
        })
      ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    beforeEach(resetMocks);

    it("returns tokens for valid credentials", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser as any);
      mockPrisma.user.update.mockResolvedValue(mockUser as any);
      mockPrisma.refreshToken.create.mockResolvedValue({} as any);

      const result = await authService.login({
        email: "u@test.com",
        password: "correct-password",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user).toMatchObject({ email: mockUser.email });
    });

    it("throws 401 when user not found", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        authService.login({ email: "none@test.com", password: "any" })
      ).rejects.toMatchObject({ statusCode: 401, code: "UNAUTHORIZED" });
    });

    it("throws 423 when account is locked", async () => {
      const lockedUser = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 60000),
      };
      mockPrisma.user.findFirst.mockResolvedValue(lockedUser as any);

      await expect(
        authService.login({ email: "u@test.com", password: "any" })
      ).rejects.toMatchObject({ statusCode: 423, code: "LOCKED" });
    });
  });

  describe("refresh", () => {
    beforeEach(resetMocks);

    it("throws when refresh token is invalid JWT", async () => {
      await expect(authService.refresh("invalid-jwt")).rejects.toThrow();
    });
  });

  describe("logout", () => {
    beforeEach(resetMocks);

    it("does not throw when token is undefined", async () => {
      await expect(authService.logout(undefined)).resolves.toBeUndefined();
      expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("me", () => {
    beforeEach(resetMocks);

    it("returns user when found", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser as any);

      const result = await authService.me("user-1");

      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: "CUSTOMER",
      });
    });

    it("throws 404 when user not found", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.me("missing-id")).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
      });
    });
  });
});
