import { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/authenticate";
import type { ReviewsService } from "./reviews.service";

export function createReviewsController(service: ReviewsService) {
  return {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const data = await service.create(req.user!.id, req.body);
        res.status(201).json({ success: true, data });
      } catch (e) {
        next(e);
      }
    },

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        await service.deleteReview(req.params.id);
        res.json({ success: true, message: "Review deleted" });
      } catch (e) {
        next(e);
      }
    },

    async patchStatus(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const { status } = req.body as { status?: string };
        const data = await service.setStatus(req.params.id, status);
        res.json({ success: true, data });
      } catch (e) {
        next(e);
      }
    },
  };
}
