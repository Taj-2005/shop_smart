import { Request, Response } from "express";
import { AppError, errorHandler } from "../errorHandler";

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
}

describe("errorHandler", () => {
  it("sends AppError status and message", () => {
    const req = {} as Request;
    const res = mockRes() as Response;
    const next = jest.fn();
    const err = new AppError(404, "Not found", "NOT_FOUND");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Not found",
        code: "NOT_FOUND",
      })
    );
  });

  it("sends 500 for generic Error", () => {
    const req = {} as Request;
    const res = mockRes() as Response;
    const next = jest.fn();
    const err = new Error("Something broke");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      })
    );
  });

  it("treats structural errors like AppError without requiring the class", () => {
    const req = {} as Request;
    const res = mockRes() as Response;
    const next = jest.fn();
    const err = { statusCode: 418, message: "I'm a teapot", code: "TEAPOT" };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "I'm a teapot",
        code: "TEAPOT",
      })
    );
  });
});

describe("AppError", () => {
  it("creates error with statusCode and message", () => {
    const e = new AppError(400, "Bad request", "VALIDATION_ERROR");
    expect(e.statusCode).toBe(400);
    expect(e.message).toBe("Bad request");
    expect(e.code).toBe("VALIDATION_ERROR");
    expect(e.name).toBe("AppError");
  });
});
