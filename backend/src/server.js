import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import multer from "multer";
import archiver from "archiver";
import { z } from "zod";
import { config } from "./config.js";
import { createStore } from "./store/index.js";
import { JOB_TYPES, JobRunner } from "./jobs.js";
import { GeminiProvider } from "./providers/geminiProvider.js";

const ALLOWED_UPLOAD_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function detectImageType(filePath) {
  const fd = fs.openSync(filePath, "r");
  const header = Buffer.alloc(16);
  try {
    fs.readSync(fd, header, 0, 16, 0);
  } finally {
    fs.closeSync(fd);
  }

  const isPng =
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a;
  if (isPng) {
    return { mime: "image/png", extension: ".png" };
  }

  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  if (isJpeg) {
    return { mime: "image/jpeg", extension: ".jpg" };
  }

  const isWebp =
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50;
  if (isWebp) {
    return { mime: "image/webp", extension: ".webp" };
  }

  return null;
}

function readIdempotencyKey(req) {
  const key = req.get("Idempotency-Key");
  if (!key) {
    return null;
  }
  const normalized = String(key).trim();
  if (!normalized || normalized.length > 128) {
    return null;
  }
  return normalized;
}

const upload = multer({
  dest: config.uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("unsupported_file_type"));
      return;
    }
    cb(null, true);
  },
});

const actorUpload = multer({
  dest: config.uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("unsupported_file_type"));
      return;
    }
    cb(null, true);
  },
});

const createProjectSchema = z.object({
  name: z.string().min(1),
  actor_id: z.string().min(1),
  language: z.string().min(2).max(16).default("en"),
});

const updateProjectSchema = z.object({
  actor_id: z.string().min(1).optional(),
  language: z.string().min(2).max(16).optional(),
});

const saveBriefSchema = z.object({
  user_prompt: z.string().min(8),
  hook: z.string().min(2).optional(),
  product_name: z.string().min(2),
  product_features: z.union([z.array(z.string().min(1)), z.string().min(1)]),
  trust_points: z.union([z.array(z.string().min(1)), z.string().min(1)]).optional(),
  cta: z.string().min(2),
});

const selectPromptSchema = z.object({
  selected_option_id: z.enum(["A", "B", "C"]),
});

function parseOr400(schema, body, res) {
  const parsed = schema.safeParse(body);
  if (parsed.success) {
    return parsed.data;
  }
  res.status(400).json({
    error: "validation_failed",
    details: parsed.error.flatten(),
  });
  return null;
}

async function startServer() {
  const app = express();

  const store = await createStore({
    dataDir: config.dataDir,
    uploadsDir: config.uploadsDir,
    keyframesDir: config.keyframesDir,
    exportsDir: config.exportsDir,
    databaseUrl: config.databaseUrl,
    databaseSslEnabled: config.databaseSslEnabled,
    databaseSslRejectUnauthorized: config.databaseSslRejectUnauthorized,
  });

  const geminiProvider = new GeminiProvider({
    apiKey: config.geminiApiKey,
    textModel: config.geminiTextModel,
    imageModel: config.geminiImageModel,
  });

  const jobs = new JobRunner({
    store,
    keyframesDir: config.keyframesDir,
    storageDir: config.storageDir,
    baseUrl: config.baseUrl,
    provider: geminiProvider,
    allowMockFallback: config.allowMockFallback,
  });

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(
    "/storage",
    express.static(config.storageDir, {
      setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    }),
  );

  async function findProjectOr404(projectId, res) {
    const project = await store.getProject(projectId);
    if (!project) {
      res.status(404).json({ error: "project_not_found" });
      return null;
    }
    return project;
  }

  async function queueProjectJob({ projectId, jobType, idempotencyKey }) {
    if (idempotencyKey) {
      const existing = await store.findJobByIdempotencyKey({
        project_id: projectId,
        type: jobType,
        idempotency_key: idempotencyKey,
      });
      if (existing) {
        return { job: existing, deduped: true };
      }
    }

    const job = await store.createJob({
      project_id: projectId,
      type: jobType,
      idempotency_key: idempotencyKey,
    });
    jobs.enqueue(job);
    return { job, deduped: false };
  }

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/v1/actors", async (_req, res, next) => {
    try {
      res.json({ actors: await store.listActors() });
    } catch (error) {
      next(error);
    }
  });

  app.get("/v1/actors/recent", async (_req, res, next) => {
    try {
      const recentIds = await store.recentActorIds(5);
      const allActors = await store.listActors();
      const actorMap = new Map(allActors.map((a) => [a.id, a]));
      const recent = recentIds.map((id) => actorMap.get(id)).filter(Boolean);
      // Fill remaining slots with default actors not already in recent
      if (recent.length < 5) {
        const recentIdSet = new Set(recentIds);
        const defaults = allActors.filter((a) => a.is_default && !recentIdSet.has(a.id));
        for (const d of defaults) {
          if (recent.length >= 5) break;
          recent.push(d);
        }
      }
      res.json({ actors: recent });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/v1/actors",
    actorUpload.fields([
      { name: "face_image", maxCount: 1 },
      { name: "reference_image", maxCount: 1 },
    ]),
    async (req, res, next) => {
      try {
        const name = req.body?.name?.trim();
        const description = req.body?.description?.trim();
        if (!name || name.length < 2) {
          res.status(400).json({ error: "name_required_min_2_chars" });
          return;
        }
        if (!description || description.length < 5) {
          res.status(400).json({ error: "description_required_min_5_chars" });
          return;
        }

        const faceFile = req.files?.face_image?.[0];
        if (!faceFile) {
          res.status(400).json({ error: "face_image_required" });
          return;
        }
        const faceType = detectImageType(faceFile.path);
        if (!faceType) {
          fs.rmSync(faceFile.path, { force: true });
          res.status(400).json({ error: "invalid_face_image" });
          return;
        }

        const actorId = `actor_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
        const actorsDir = path.join(config.storageDir, "actors");
        fs.mkdirSync(actorsDir, { recursive: true });

        const faceName = `${actorId}${faceType.extension}`;
        const faceDest = path.join(actorsDir, faceName);
        fs.renameSync(faceFile.path, faceDest);
        const faceUrl = `/storage/actors/${faceName}`;

        let refUrl = null;
        const refFile = req.files?.reference_image?.[0];
        if (refFile) {
          const refType = detectImageType(refFile.path);
          if (!refType) {
            fs.rmSync(refFile.path, { force: true });
          } else {
            const refName = `${actorId}_reference${refType.extension}`;
            const refDest = path.join(actorsDir, refName);
            fs.renameSync(refFile.path, refDest);
            refUrl = `/storage/actors/${refName}`;
          }
        }

        const actor = await store.createActor({
          id: actorId,
          name,
          short_description: description,
          image_url: faceUrl,
          reference_image_url: refUrl,
        });
        res.status(201).json({ actor });
      } catch (error) {
        next(error);
      }
    },
  );

  app.delete("/v1/actors/:actorId", async (req, res, next) => {
    try {
      const deleted = await store.deleteActor(req.params.actorId);
      if (!deleted) {
        res.status(400).json({ error: "cannot_delete_actor" });
        return;
      }
      res.json({ deleted: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/v1/projects", async (req, res, next) => {
    try {
      const payload = parseOr400(createProjectSchema, req.body, res);
      if (!payload) {
        return;
      }
      if (!(await store.actorExists(payload.actor_id))) {
        res.status(400).json({ error: "invalid_actor_id" });
        return;
      }
      const project = await store.createProject(payload);
      res.status(201).json({ project });
    } catch (error) {
      next(error);
    }
  });

  app.get("/v1/projects", async (_req, res, next) => {
    try {
      const projects = await store.listProjects();
      const summary = projects.map((p) => ({
        id: p.id,
        name: p.name,
        actor_id: p.actor_id,
        language: p.language,
        has_brief: Boolean(p.brief),
        prompt_options_count: Array.isArray(p.prompt_options) ? p.prompt_options.length : 0,
        selected_option_id: p.selected_option_id ?? null,
        keyframes_count: Array.isArray(p.keyframes) ? p.keyframes.length : 0,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));
      res.json({ projects: summary });
    } catch (error) {
      next(error);
    }
  });

  app.get("/v1/projects/:projectId", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      res.json({ project });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/v1/projects/:projectId", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      const payload = parseOr400(updateProjectSchema, req.body, res);
      if (!payload) {
        return;
      }
      if (payload.actor_id && !(await store.actorExists(payload.actor_id))) {
        res.status(400).json({ error: "invalid_actor_id" });
        return;
      }
      const updated = await store.updateProject(project.id, (state) => ({
        ...state,
        ...(payload.actor_id && { actor_id: payload.actor_id }),
        ...(payload.language && { language: payload.language }),
      }));
      res.json({ project: updated });
    } catch (error) {
      next(error);
    }
  });

  app.post("/v1/projects/:projectId/product-image/upload-url", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      res.json({
        method: "POST",
        upload_url: `${config.baseUrl}/v1/projects/${project.id}/product-image`,
        form_field: "product_image",
      });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/v1/projects/:projectId/product-image",
    upload.single("product_image"),
    async (req, res, next) => {
      try {
        const project = await findProjectOr404(req.params.projectId, res);
        if (!project) {
          return;
        }
        if (!req.file) {
          res.status(400).json({ error: "product_image_file_required" });
          return;
        }

        const detectedType = detectImageType(req.file.path);
        if (!detectedType) {
          fs.rmSync(req.file.path, { force: true });
          res.status(400).json({ error: "invalid_image_content" });
          return;
        }

        const extension = detectedType.extension;
        const fileName = `product${extension}`;
        const projectDir = path.join(config.uploadsDir, project.id);
        fs.mkdirSync(projectDir, { recursive: true });
        const nextPath = path.join(projectDir, fileName);
        fs.renameSync(req.file.path, nextPath);

        const relativePath = path.relative(config.storageDir, nextPath).split(path.sep).join("/");
        const imageUrl = `${config.baseUrl}/storage/${relativePath}`;

        const updated = await store.updateProject(project.id, (state) => ({
          ...state,
          product_image_path: nextPath,
          product_image_url: imageUrl,
        }));

        res.status(201).json({
          product_image_url: updated?.product_image_url,
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.post("/v1/projects/:projectId/brief", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      const payload = parseOr400(saveBriefSchema, req.body, res);
      if (!payload) {
        return;
      }
      const updated = await store.updateProject(project.id, (state) => ({
        ...state,
        brief: payload,
      }));
      res.json({ brief: updated?.brief });
    } catch (error) {
      next(error);
    }
  });

  app.post("/v1/projects/:projectId/generate-prompt-options", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      if (!project.brief) {
        res.status(400).json({ error: "brief_required" });
        return;
      }
      if (!project.product_image_path) {
        res.status(400).json({ error: "product_image_required" });
        return;
      }
      const { job, deduped } = await queueProjectJob({
        projectId: project.id,
        jobType: JOB_TYPES.PROMPT_OPTIONS,
        idempotencyKey: readIdempotencyKey(req),
      });
      res.status(202).json({
        job_id: job.id,
        status: job.status,
        deduped,
        job_status_url: `${config.baseUrl}/v1/jobs/${job.id}`,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/v1/projects/:projectId/prompt-options", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      res.json({
        selected_option_id: project.selected_option_id,
        prompt_options: project.prompt_options,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/v1/projects/:projectId/select-prompt-option", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      const payload = parseOr400(selectPromptSchema, req.body, res);
      if (!payload) {
        return;
      }
      const hasOption = project.prompt_options.some(
        (opt) => opt.option_id === payload.selected_option_id,
      );
      if (!hasOption) {
        res.status(400).json({ error: "prompt_option_not_found" });
        return;
      }

      const updated = await store.updateProject(project.id, (state) => ({
        ...state,
        selected_option_id: payload.selected_option_id,
      }));
      res.json({
        selected_option_id: updated?.selected_option_id,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/v1/projects/:projectId/generate-keyframes", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      if (!project.selected_option_id) {
        res.status(400).json({ error: "prompt_selection_required" });
        return;
      }
      const { job, deduped } = await queueProjectJob({
        projectId: project.id,
        jobType: JOB_TYPES.KEYFRAMES,
        idempotencyKey: readIdempotencyKey(req),
      });
      res.status(202).json({
        job_id: job.id,
        status: job.status,
        deduped,
        job_status_url: `${config.baseUrl}/v1/jobs/${job.id}`,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/v1/projects/:projectId/keyframes", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      res.json({
        selected_option_id: project.selected_option_id,
        keyframes: project.keyframes,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/v1/projects/:projectId/regenerate-prompt-options", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      if (!project.brief) {
        res.status(400).json({ error: "brief_required" });
        return;
      }
      const { job, deduped } = await queueProjectJob({
        projectId: project.id,
        jobType: JOB_TYPES.PROMPT_OPTIONS,
        idempotencyKey: readIdempotencyKey(req),
      });
      res.status(202).json({ job_id: job.id, status: job.status, deduped });
    } catch (error) {
      next(error);
    }
  });

  app.post("/v1/projects/:projectId/regenerate-keyframes", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      if (!project.selected_option_id) {
        res.status(400).json({ error: "prompt_selection_required" });
        return;
      }
      const { job, deduped } = await queueProjectJob({
        projectId: project.id,
        jobType: JOB_TYPES.KEYFRAMES,
        idempotencyKey: readIdempotencyKey(req),
      });
      res.status(202).json({ job_id: job.id, status: job.status, deduped });
    } catch (error) {
      next(error);
    }
  });

  app.get("/v1/jobs/:jobId", async (req, res, next) => {
    try {
      const job = await store.getJob(req.params.jobId);
      if (!job) {
        res.status(404).json({ error: "job_not_found" });
        return;
      }
      res.json({ job });
    } catch (error) {
      next(error);
    }
  });

  app.get("/v1/projects/:projectId/export", async (req, res, next) => {
    try {
      const project = await findProjectOr404(req.params.projectId, res);
      if (!project) {
        return;
      }
      if (!project.prompt_options?.length) {
        res.status(400).json({ error: "prompt_options_required" });
        return;
      }
      if (!project.keyframes?.length) {
        res.status(400).json({ error: "keyframes_required" });
        return;
      }

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=\"${project.id}-outputs.zip\"`);

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.on("error", (error) => next(error));
      archive.pipe(res);

      archive.append(JSON.stringify(project.prompt_options, null, 2), {
        name: "prompt_options.json",
      });
      archive.append(
        JSON.stringify(
          {
            selected_option_id: project.selected_option_id,
          },
          null,
          2,
        ),
        { name: "selection.json" },
      );
      archive.append(JSON.stringify(project.scene_plan ?? [], null, 2), {
        name: "scene_plan.json",
      });

      for (const frame of project.keyframes) {
        if (frame.frame_path && fs.existsSync(frame.frame_path)) {
          const extension = path.extname(frame.frame_path) || ".png";
          archive.file(frame.frame_path, {
            name: `keyframes/frame_scene_${frame.scene_id}${extension}`,
          });
        }
      }

      archive.finalize().catch((error) => next(error));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "file_too_large", max_size_mb: 10 });
        return;
      }
      res.status(400).json({ error: "upload_failed", code: error.code });
      return;
    }
    if (error instanceof Error && error.message === "unsupported_file_type") {
      res.status(400).json({ error: "unsupported_file_type" });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "internal_server_error" });
  });

  app.listen(config.port, () => {
    const mode = config.databaseUrl ? "postgres" : "file";
    console.log(`UGC backend listening on port ${config.port} (${mode} store)`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
