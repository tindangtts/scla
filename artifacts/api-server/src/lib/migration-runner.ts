import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "@workspace/db";
import { logger } from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// From artifacts/api-server/src/lib/ → ../../../../lib/db/migrations/
const SQL_PATH = join(
  __dirname,
  "../../../../lib/db/migrations/0001_add_number_sequences.sql",
);

export async function applyMigrations(): Promise<void> {
  const sql = readFileSync(SQL_PATH, "utf-8");
  await pool.query(sql);
  logger.info("DB migration bootstrap: sequences applied");
}
