import request from "supertest";
import { AppError } from "../../src/middleware/errorHandler";

jest.mock("../../src/modules/auth/auth.service", () => {
  const actual = jest.requireActual("../../src/modules/auth/auth.service");
  const { authService } = actual;
  const loginMock = jest.fn().mockRejectedValue(new AppError(401, "Invalid email or password", "UNAUTHORIZED"));
  return {
    ...actual,
    authService: new Proxy(authService, {
      get(target, prop, receiver) {
        if (prop === "login") return loginMock;
        return Reflect.get(target, prop, receiver);
      },
    }),
  };
});

import app from "../../src/app";

describe("API integration", () => {
  describe("GET /api/health", () => {
    it("returns 200 and API message", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, message: "ShopSmart API" });
    });
  });

  describe("POST /api/auth/register", () => {
    it("returns 400 for invalid body (missing email)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ password: "Pass123!", fullName: "Test User" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for weak password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "a@b.com", password: "short", fullName: "Test" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "not-email", password: "anything" });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 for unknown credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "wrong" });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("returns 400 when no refresh token cookie", async () => {
      const res = await request(app).post("/api/auth/refresh");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("BAD_REQUEST");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("returns 200 without token", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ success: true, message: "Logged out" });
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 401 when no access token cookie", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("UNAUTHORIZED");
    });
  });
});
