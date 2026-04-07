import { Response } from "express";
import { AuthRequest } from "../../middleware/authenticate";
import { ApiResponseFactory } from "../../factories/ApiResponseFactory";
import { container } from "../../container";
import { BaseController } from "../../base/BaseController";

class ListProductsController extends BaseController {
  protected async execute() {
    return await container.productService.listActive();
  }
}
export const list = new ListProductsController().handleRequest.bind(new ListProductsController());

class ListReviewsController extends BaseController {
  protected async execute(req: AuthRequest) {
    return await container.productService.listReviews(req.params.id);
  }
}
export const listReviews = new ListReviewsController().handleRequest.bind(new ListReviewsController());

class GetProductByIdController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    const data = await container.productService.getById(req.params.id);
    if (!data) {
      res.status(404).json(ApiResponseFactory.clientError("Product not found"));
      return;
    }
    return data;
  }
}
export const getById = new GetProductByIdController().handleRequest.bind(new GetProductByIdController());

class ProductAnalyticsController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    const data = await container.productService.getAnalytics(req.params.id);
    if (!data) {
      res.status(404).json(ApiResponseFactory.clientError("Product not found"));
      return;
    }
    return data;
  }
}
export const analytics = new ProductAnalyticsController().handleRequest.bind(new ProductAnalyticsController());

class CreateProductController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    const product = await container.productService.create(req.body);
    res.status(201);
    return product;
  }
}
export const create = new CreateProductController().handleRequest.bind(new CreateProductController());

class UpdateProductController extends BaseController {
  protected async execute(req: AuthRequest) {
    return await container.productService.update(req.params.id, req.body);
  }
}
export const update = new UpdateProductController().handleRequest.bind(new UpdateProductController());

class RemoveProductController extends BaseController {
  protected async execute(req: AuthRequest) {
    await container.productService.softDelete(req.params.id);
    return { success: true, message: "Product deleted" };
  }
}
export const remove = new RemoveProductController().handleRequest.bind(new RemoveProductController());
