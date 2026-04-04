import { Response } from "express";
import type { AuthRequest } from "../../middleware/authenticate";
import type { ReviewsService } from "./reviews.service";
import { BaseController } from "../../base/BaseController";

class CreateReviewController extends BaseController {
  constructor(private service: ReviewsService) { super(); }
  protected async execute(req: AuthRequest, res: Response) {
    const data = await this.service.create(req.user!.id, req.body);
    res.status(201);
    return data;
  }
}

class DeleteReviewController extends BaseController {
  constructor(private service: ReviewsService) { super(); }
  protected async execute(req: AuthRequest) {
    await this.service.deleteReview(req.params.id);
    return { success: true, message: "Review deleted" };
  }
}

class PatchReviewStatusController extends BaseController {
  constructor(private service: ReviewsService) { super(); }
  protected async execute(req: AuthRequest) {
    const { status } = req.body as { status?: string };
    return await this.service.setStatus(req.params.id, status);
  }
}

export function createReviewsController(service: ReviewsService) {
  return {
    create: new CreateReviewController(service).handleRequest.bind(new CreateReviewController(service)),
    delete: new DeleteReviewController(service).handleRequest.bind(new DeleteReviewController(service)),
    patchStatus: new PatchReviewStatusController(service).handleRequest.bind(new PatchReviewStatusController(service)),
  };
}
