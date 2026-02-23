import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URI_PREFIX = "supabase://";

function trimSlashes(value) {
  return String(value || "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export function isSupabaseUri(value) {
  return typeof value === "string" && value.startsWith(SUPABASE_URI_PREFIX);
}

function parseSupabaseUri(uri) {
  if (!isSupabaseUri(uri)) {
    return null;
  }
  const raw = uri.slice(SUPABASE_URI_PREFIX.length);
  const slashIdx = raw.indexOf("/");
  if (slashIdx <= 0) {
    return null;
  }
  return {
    bucket: raw.slice(0, slashIdx),
    objectPath: trimSlashes(raw.slice(slashIdx + 1)),
  };
}

export class SupabaseMediaStore {
  constructor({ url, serviceRoleKey, bucket }) {
    this.bucket = bucket;
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  static fromConfig(config) {
    if (!config.supabaseUrl || !config.supabaseServiceRoleKey || !config.supabaseStorageBucket) {
      return null;
    }
    return new SupabaseMediaStore({
      url: config.supabaseUrl,
      serviceRoleKey: config.supabaseServiceRoleKey,
      bucket: config.supabaseStorageBucket,
    });
  }

  toUri(objectPath) {
    return `${SUPABASE_URI_PREFIX}${this.bucket}/${trimSlashes(objectPath)}`;
  }

  async uploadBuffer({ objectPath, buffer, contentType, upsert = true }) {
    const finalPath = trimSlashes(objectPath);
    const { error } = await this.client.storage.from(this.bucket).upload(finalPath, buffer, {
      contentType,
      upsert,
    });
    if (error) {
      throw new Error(`supabase_upload_failed: ${error.message}`);
    }
    const { data } = this.client.storage.from(this.bucket).getPublicUrl(finalPath);
    return {
      uri: this.toUri(finalPath),
      publicUrl: data?.publicUrl,
      objectPath: finalPath,
    };
  }

  async uploadFile({ filePath, objectPath, contentType, upsert = true }) {
    const buffer = fs.readFileSync(filePath);
    return this.uploadBuffer({ objectPath, buffer, contentType, upsert });
  }

  async downloadBufferByUri(uri) {
    const parsed = parseSupabaseUri(uri);
    if (!parsed) {
      throw new Error("invalid_supabase_uri");
    }
    const { data, error } = await this.client.storage.from(parsed.bucket).download(parsed.objectPath);
    if (error) {
      throw new Error(`supabase_download_failed: ${error.message}`);
    }
    return Buffer.from(await data.arrayBuffer());
  }

  async readAsBase64({ pathOrUrl, storageDir = "" }) {
    if (!pathOrUrl) {
      return null;
    }

    if (isSupabaseUri(pathOrUrl)) {
      const buffer = await this.downloadBufferByUri(pathOrUrl);
      return buffer.toString("base64");
    }

    if (typeof pathOrUrl === "string" && /^https?:\/\//i.test(pathOrUrl)) {
      const response = await fetch(pathOrUrl);
      if (!response.ok) {
        throw new Error(`media_fetch_failed_${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      return buffer.toString("base64");
    }

    if (typeof pathOrUrl === "string" && pathOrUrl.startsWith("/storage/") && storageDir) {
      const relativePath = pathOrUrl.replace(/^\/storage\//, "");
      const absolutePath = path.join(storageDir, relativePath);
      if (fs.existsSync(absolutePath)) {
        return fs.readFileSync(absolutePath).toString("base64");
      }
      return null;
    }

    if (typeof pathOrUrl === "string" && fs.existsSync(pathOrUrl)) {
      return fs.readFileSync(pathOrUrl).toString("base64");
    }

    return null;
  }
}
