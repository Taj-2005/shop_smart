import { Response, NextFunction } from "express";
import type { Request } from "express";
import type { CategoriesService } from "./categories.service";

export function createCategoriesController(service: CategoriesService) {
  return {
    async list(_req: Request, res: Response, next: NextFunction) {
      try {
        const data = await service.list();
        res.json({ success: true, data });
      } catch (e) {
        next(e);
      }
    },

    async create(req: Request, res: Response, next: NextFunction) {
      try {
        const { name, slug, description } = req.body;
        const category = await service.create({ name, slug, description });
        res.status(201).json({ success: true, data: category });
      } catch (e) {
        next(e);
      }
    },
  };
}
