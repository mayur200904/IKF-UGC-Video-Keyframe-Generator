import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function parseBool(value, defaultValue) {
  if (value == null) {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

export const config = {
  port: Number.parseInt(process.env.PORT ?? "4000", 10),
  rootDir,
  dataDir: path.join(rootDir, "data"),
  storageDir: path.join(rootDir, "storage"),
  uploadsDir: path.join(rootDir, "storage", "uploads"),
  keyframesDir: path.join(rootDir, "storage", "keyframes"),
  exportsDir: path.join(rootDir, "storage", "exports"),
  baseUrl: process.env.BASE_URL ?? "http://localhost:4000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  databaseSslEnabled: parseBool(process.env.DATABASE_SSL_ENABLED, true),
  databaseSslRejectUnauthorized: parseBool(
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
    false,
  ),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiTextModel: process.env.GEMINI_TEXT_MODEL ?? "gemini-2.5-flash",
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image",
  allowMockFallback: parseBool(process.env.ALLOW_MOCK_FALLBACK, false),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "",
};
