import { Response } from "express";
import type { AuthRequest } from "../../middleware/authenticate";
import { AppErrorFactory } from "../../factories/AppErrorFactory";
import { container } from "../../container";
import { BaseController } from "../../base/BaseController";

class PatchMeController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    if (!req.user) {
      res.status(401);
      throw AppErrorFactory.unauthorized("Authentication required");
    }
    const { fullName, avatarUrl } = req.body;
    return await container.currentUserProfileService.patchProfile(req.user.id, { fullName, avatarUrl });
  }
}
export const patchMe = new PatchMeController().handleRequest.bind(new PatchMeController());
