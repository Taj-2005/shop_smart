import { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/authenticate";
import { container } from "../../container";

export async function patchMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const { fullName, avatarUrl } = req.body;
    const data = await container.currentUserProfileService.patchProfile(req.user.id, { fullName, avatarUrl });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
