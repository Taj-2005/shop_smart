import { Response } from "express";
import type { Request } from "express";
import type { CategoriesService } from "./categories.service";
import { BaseController } from "../../base/BaseController";

class ListCategoriesController extends BaseController {
  constructor(private service: CategoriesService) { super(); }
  protected async execute() {
    return await this.service.list();
  }
}

class CreateCategoryController extends BaseController {
  constructor(private service: CategoriesService) { super(); }
  protected async execute(req: Request, res: Response) {
    const { name, slug, description } = req.body;
    const category = await this.service.create({ name, slug, description });
    res.status(201);
    return category;
  }
}

export function createCategoriesController(service: CategoriesService) {
  return {
    list: new ListCategoriesController(service).handleRequest.bind(new ListCategoriesController(service)),
    create: new CreateCategoryController(service).handleRequest.bind(new CreateCategoryController(service)),
  };
}
