import { Request, Response } from "express";
import { errorHandler, AppError } from "../errorHandler";
import { AppErrorFactory } from "../../factories/AppErrorFactory";

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
    const err = AppErrorFactory.notFound("Not found");

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

describe("AppErrorFactory", () => {
  it("creates AppError with statusCode and message", () => {
    const e = AppErrorFactory.validation("Bad request");
    expect(e).toBeInstanceOf(AppError);
    expect(e.statusCode).toBe(400);
    expect(e.message).toBe("Bad request");
    expect(e.code).toBe("VALIDATION_ERROR");
    expect(e.name).toBe("AppError");
  });
});
