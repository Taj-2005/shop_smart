import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/authenticate";
import { ApiResponseFactory } from "../../factories/ApiResponseFactory";
import { container } from "../../container";

export async function list(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.productService.listActive();
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}

export async function listReviews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.productService.listReviews(req.params.id);
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.productService.getById(req.params.id);
    if (!data) {
      res.status(404).json(ApiResponseFactory.clientError("Product not found"));
      return;
    }
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}

export async function analytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.productService.getAnalytics(req.params.id);
    if (!data) {
      res.status(404).json(ApiResponseFactory.clientError("Product not found"));
      return;
    }
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await container.productService.create(req.body);
    res.status(201).json(ApiResponseFactory.successData(product));
  } catch (e) {
    next(e);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await container.productService.update(req.params.id, req.body);
    res.json(ApiResponseFactory.successData(product));
  } catch (e) {
    next(e);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await container.productService.softDelete(req.params.id);
    res.json(ApiResponseFactory.successMessage("Product deleted"));
  } catch (e) {
    next(e);
  }
}
