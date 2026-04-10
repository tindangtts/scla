import express, { type Express, type Request, type Response, type NextFunction } from "express";
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

// Global error handler — catches any error thrown or passed to next(err) in route handlers.
// Must be the LAST app.use call (Express identifies 4-param middleware as error handlers).
// Returns consistent JSON shape: { error, message } — per QUAL-04.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any).status ?? (err as any).statusCode ?? 500;
  if (status >= 500) {
    logger.error({ err }, "Unhandled error");
  }
  res.status(status).json({
    error: "internal_server_error",
    message: status >= 500 ? "An unexpected error occurred" : err.message,
  });
});

export default app;
