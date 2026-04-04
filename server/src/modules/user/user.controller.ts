import { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/authenticate";
import { ApiResponseFactory } from "../../factories/ApiResponseFactory";
import { container } from "../../container";

export async function patchMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json(ApiResponseFactory.clientError("Authentication required"));
      return;
    }
    const { fullName, avatarUrl } = req.body;
    const data = await container.currentUserProfileService.patchProfile(req.user.id, { fullName, avatarUrl });
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}
