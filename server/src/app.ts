import path from "path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import swaggerSpec from "./config/swagger";

const SHOPSMART_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">
  <circle cx="150" cy="150" r="150" fill="#00C2B2"/>
  <circle cx="150" cy="90" r="40" fill="#fff"/>
  <circle cx="125" cy="115" r="25" fill="#00C2B2"/>
  <rect x="125" y="100" width="50" height="100" rx="25" fill="#fff" transform="rotate(-15 150 150)"/>
  <circle cx="150" cy="210" r="40" fill="#fff"/>
  <circle cx="175" cy="185" r="25" fill="#00C2B2"/>
</svg>`;

const app = express();
const publicDir = path.join(__dirname, "..", "..", "public");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Swagger UI relies on inline scripts/styles; Helmet's default CSP can blank the page.
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests" },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use("/", express.static(publicDir));
app.get("/icon.svg", (_req, res) => {
  res.type("image/svg+xml");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(SHOPSMART_ICON_SVG);
});
app.get("/api-docs/icon.svg", (_req, res) => {
  res.type("image/svg+xml");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(SHOPSMART_ICON_SVG);
});
app.get("/api-docs/architecture", (_req, res) => {
  res.set("Cache-Control", "public, max-age=3600");
  res.sendFile(path.join(publicDir, "architecture.html"));
});
const frontendUrl = env.FRONTEND_URL.replace(/\/$/, "");
app.get("/api-docs/swagger-back-link.js", (_req, res) => {
  res.type("application/javascript");
  res.set("Cache-Control", "public, max-age=300");
  res.send(`
(function() {
  function waitFor(selector, cb) {
    var el = document.querySelector(selector);
    if (el) return cb(el);
    setTimeout(function() { waitFor(selector, cb); }, 50);
  }
  waitFor(".topbar-wrapper", function(navbar) {
    if (document.querySelector(".back-to-shopsmart")) return;
    var a = document.createElement("a");
    a.href = ${JSON.stringify(frontendUrl + "/admin")};
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "back-to-shopsmart";
    a.textContent = "← Back to ShopSmart Admin";
    navbar.appendChild(a);
  });
})();
  `.trim());
});
app.use("/api", routes);
const swaggerOptions: swaggerUi.SwaggerUiOptions = {
  customSiteTitle: "ShopSmart API",
  customfavIcon: "/api-docs/icon.svg",
  customJs: "/api-docs/swagger-back-link.js",
  customCss: `
    .topbar-wrapper { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
    .back-to-shopsmart {
      margin-left: auto;
      padding: 6px 14px;
      background: #00C2B2;
      color: #fff !important;
      border-radius: 6px;
      text-decoration: none !important;
      font-weight: 600;
      font-size: 14px;
    }
    .back-to-shopsmart:hover { background: #00a396; color: #fff !important; }
    .information-container .info .description a[href="/api-docs/architecture"] {
      display: inline-block;
      margin: 0.5em 0;
      padding: 0.6em 1.2em;
      background: #00C2B2;
      color: #fff !important;
      border-radius: 8px;
      text-decoration: none !important;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,194,178,0.3);
    }
    .information-container .info .description a[href="/api-docs/architecture"]:hover {
      background: #00a396;
      color: #fff !important;
      box-shadow: 0 3px 8px rgba(0,194,178,0.4);
    }
  `,
  swaggerOptions: {
    layout: "BaseLayout",
    persistAuthorization: true,
  },
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec as swaggerUi.JsonObject, swaggerOptions));
app.use(errorHandler);

export default app;
