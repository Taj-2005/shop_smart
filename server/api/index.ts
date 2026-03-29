import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // When using Vercel "routes" rewrites to a single function, the original path
  // can be passed via query params. Express routing (and swagger-ui-express asset
  // serving) depends on req.url matching the *actual* requested path.
  const pathParam = req.query?.path;
  if (typeof pathParam === "string") {
    req.url = "/" + pathParam;
  } else if (Array.isArray(pathParam) && pathParam.length > 0) {
    req.url = "/" + pathParam.join("/");
  }
  return app(req as any, res as any);
}

