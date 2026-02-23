import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { config } from "../src/config.js";
import { SupabaseMediaStore, isSupabaseUri } from "../src/media/supabaseMediaStore.js";

const { Pool } = pg;

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function getFileNameFromValue(value) {
  if (!value) return "";
  if (isHttpUrl(value)) {
    try {
      return path.basename(new URL(value).pathname);
    } catch {
      return "";
    }
  }
  return path.basename(String(value));
}

function resolveLocalStoragePath(value, storageDir) {
  if (!value || isSupabaseUri(value)) {
    return null;
  }

  if (typeof value === "string" && value.startsWith("/storage/")) {
    const rel = value.replace(/^\/storage\//, "");
    const full = path.join(storageDir, rel);
    return fs.existsSync(full) ? full : null;
  }

  if (isHttpUrl(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.pathname.startsWith("/storage/")) {
        const rel = parsed.pathname.replace(/^\/storage\//, "");
        const full = path.join(storageDir, rel);
        return fs.existsSync(full) ? full : null;
      }
    } catch {
      return null;
    }
  }

  if (typeof value === "string" && path.isAbsolute(value) && fs.existsSync(value)) {
    return value;
  }

  return null;
}

function mimeTypeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function uploadIfLocal({ mediaStore, localPath, objectPath }) {
  const uploaded = await mediaStore.uploadFile({
    filePath: localPath,
    objectPath,
    contentType: mimeTypeFromPath(localPath),
  });
  return uploaded;
}

async function main() {
  const dryRun = String(process.env.DRY_RUN || "false").toLowerCase() === "true";

  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required for migration script.");
  }

  const mediaStore = SupabaseMediaStore.fromConfig(config);
  if (!mediaStore) {
    throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET are required.");
  }

  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseSslEnabled ? { rejectUnauthorized: config.databaseSslRejectUnauthorized } : false,
  });

  let actorUpdates = 0;
  let projectUpdates = 0;
  let frameMigrations = 0;

  try {
    const actorsRes = await pool.query(
      "SELECT id, image_url, reference_image_url FROM actors ORDER BY created_at ASC",
    );

    for (const actor of actorsRes.rows) {
      let nextImageUrl = actor.image_url;
      let nextReferenceUrl = actor.reference_image_url;

      const imagePath = resolveLocalStoragePath(actor.image_url, config.storageDir);
      if (imagePath) {
        const fileName = getFileNameFromValue(actor.image_url) || `${actor.id}${path.extname(imagePath)}`;
        const uploaded = await uploadIfLocal({
          mediaStore,
          localPath: imagePath,
          objectPath: `actors/${fileName}`,
        });
        nextImageUrl = uploaded.publicUrl;
      }

      const refPath = resolveLocalStoragePath(actor.reference_image_url, config.storageDir);
      if (refPath) {
        const fileName =
          getFileNameFromValue(actor.reference_image_url) || `${actor.id}_reference${path.extname(refPath)}`;
        const uploaded = await uploadIfLocal({
          mediaStore,
          localPath: refPath,
          objectPath: `actors/${fileName}`,
        });
        nextReferenceUrl = uploaded.publicUrl;
      }

      if (nextImageUrl !== actor.image_url || nextReferenceUrl !== actor.reference_image_url) {
        actorUpdates += 1;
        if (!dryRun) {
          await pool.query(
            `UPDATE actors
             SET image_url = $2,
                 reference_image_url = $3,
                 updated_at = NOW()
             WHERE id = $1`,
            [actor.id, nextImageUrl, nextReferenceUrl],
          );
        }
      }
    }

    const projectsRes = await pool.query(
      "SELECT id, product_image_path, product_image_url, keyframes FROM projects ORDER BY created_at ASC",
    );

    for (const project of projectsRes.rows) {
      let nextProductPath = project.product_image_path;
      let nextProductUrl = project.product_image_url;
      let nextKeyframes = Array.isArray(project.keyframes) ? [...project.keyframes] : [];
      let changed = false;

      const productPath = resolveLocalStoragePath(project.product_image_path, config.storageDir);
      if (productPath) {
        const fileName = getFileNameFromValue(project.product_image_path) || `product${path.extname(productPath)}`;
        const uploaded = await uploadIfLocal({
          mediaStore,
          localPath: productPath,
          objectPath: `uploads/${project.id}/${fileName}`,
        });
        nextProductPath = uploaded.uri;
        nextProductUrl = uploaded.publicUrl;
        changed = true;
      }

      nextKeyframes = await Promise.all(
        nextKeyframes.map(async (frame) => {
          const framePath = resolveLocalStoragePath(frame.frame_path, config.storageDir);
          if (!framePath) {
            return frame;
          }
          const fileName = getFileNameFromValue(frame.frame_path) || `frame_scene_${frame.scene_id}${path.extname(framePath) || ".jpg"}`;
          const uploaded = await uploadIfLocal({
            mediaStore,
            localPath: framePath,
            objectPath: `keyframes/${project.id}/${fileName}`,
          });
          frameMigrations += 1;
          changed = true;
          return {
            ...frame,
            frame_path: uploaded.uri,
            frame_url: uploaded.publicUrl,
          };
        }),
      );

      if (changed) {
        projectUpdates += 1;
        if (!dryRun) {
          await pool.query(
            `UPDATE projects
             SET product_image_path = $2,
                 product_image_url = $3,
                 keyframes = $4::jsonb,
                 updated_at = NOW()
             WHERE id = $1`,
            [project.id, nextProductPath, nextProductUrl, JSON.stringify(nextKeyframes)],
          );
        }
      }
    }

    console.log(
      JSON.stringify(
        {
          dryRun,
          actorUpdates,
          projectUpdates,
          frameMigrations,
          message: dryRun
            ? "Dry run complete. No DB writes were made."
            : "Migration complete. Existing media now points to Supabase storage.",
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
