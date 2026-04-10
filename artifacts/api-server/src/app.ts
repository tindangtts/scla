import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Allowed origins: local dev + optional Replit deployment URL from env (per D-08)
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.ALLOWED_ORIGIN ? [process.env.ALLOWED_ORIGIN] : []),
];

// Security headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.) — per D-09
app.use(helmet());

// Tightened CORS — reject requests from unlisted origins (per D-08)
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: false, // Bearer token SPA — no cookies required (per D-07)
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
