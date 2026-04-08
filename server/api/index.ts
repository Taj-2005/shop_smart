import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";

function applyPathToRequestUrl(req: VercelRequest): void {
  // Single-function rewrite: dest is `api/index.ts?path=$1` so the browser path
  // arrives as `query.path`. Express + swagger-ui-static need `req.url` to match
  // the real path (e.g. /api-docs/swagger-ui.css), or static assets 404-through
  // to swagger `setup()` and return HTML → MIME errors in the browser.
  const pathParam = req.query?.path;
  let pathOnly = "";
  if (typeof pathParam === "string") {
    pathOnly = pathParam.split("?")[0];
  } else if (Array.isArray(pathParam) && pathParam.length > 0) {
    pathOnly = pathParam.map((p) => String(p).split("?")[0]).join("/");
  }

  const raw = typeof req.url === "string" ? req.url : "";
  const search = raw.includes("?") ? "?" + raw.split("?").slice(1).join("?") : "";

  if (pathOnly) {
    req.url = "/" + pathOnly.replace(/^\/+/, "") + search;
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  applyPathToRequestUrl(req);
  return app(req as any, res as any);
}

