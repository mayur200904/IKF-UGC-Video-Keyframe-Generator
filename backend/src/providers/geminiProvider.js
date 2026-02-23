import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { isSupabaseUri } from "../media/supabaseMediaStore.js";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const promptOptionSchema = z.object({
  option_id: z.enum(["A", "B", "C"]),
  title: z.string().min(3),
  ad_prompt: z.object({
    total_scenes: z.literal(4),
    scene_duration_sec: z.number().int().min(6).max(10),
    language: z.string().min(2),
    notes: z.string().optional().default(""),
    scenes: z
      .array(
        z.object({
          scene_id: z.number().int().min(1).max(4),
          objective: z.enum(["hook", "feature", "trust", "cta"]),
          dialogue: z.string().min(2),
          actions: z.string().min(2),
        }),
      )
      .length(4),
  }),
});

const promptOptionsResponseSchema = z.object({
  prompt_options: z.array(promptOptionSchema).length(3),
});

const continuityProfileSchema = z.object({
  actor_face_signature: z.string().min(1),
  hairstyle_signature: z.string().min(1),
  outfit_signature: z.string().min(1),
  environment_signature: z.string().min(1),
  camera_signature: z.string().min(1),
  product_signature: z.string().min(1),
});

const IMAGE_GENERATION_TIMEOUT_MS = 180000;
const IMAGE_GENERATION_REQUEST_ATTEMPTS = 2;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonObject(text) {
  if (!text) {
    throw new Error("Empty Gemini response");
  }

  const direct = text.trim();
  try {
    return JSON.parse(direct);
  } catch {
    // Continue with fenced and block extraction.
  }

  const fenced = direct.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1]);
  }

  const firstBrace = direct.indexOf("{");
  const lastBrace = direct.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(direct.slice(firstBrace, lastBrace + 1));
  }

  throw new Error("Failed to parse JSON from Gemini response");
}

function mimeTypeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") {
    return "image/png";
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    return "image/jpeg";
  }
  if (ext === ".webp") {
    return "image/webp";
  }
  return "application/octet-stream";
}

function extFromMime(mimeType) {
  if (!mimeType) {
    return "png";
  }
  if (mimeType.includes("png")) {
    return "png";
  }
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    return "jpg";
  }
  if (mimeType.includes("webp")) {
    return "webp";
  }
  return "bin";
}

function shouldRetryStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

function getCandidateParts(payload) {
  const candidates = payload?.candidates ?? [];
  return candidates.flatMap((candidate) => candidate?.content?.parts ?? []);
}

function extractText(payload) {
  const parts = getCandidateParts(payload);
  const chunks = parts.map((part) => part?.text).filter(Boolean);
  return chunks.join("\n").trim();
}

function extractInlineImage(payload) {
  const parts = getCandidateParts(payload);
  for (const part of parts) {
    const inlineData = part?.inlineData ?? part?.inline_data;
    if (inlineData?.data) {
      return {
        data: inlineData.data,
        mimeType: inlineData.mimeType ?? inlineData.mime_type ?? "image/png",
      };
    }
  }
  return null;
}

function buildLanguageGuidance(language) {
  if (!language) {
    return "Use natural conversational English.";
  }
  const normalized = String(language).trim().toLowerCase();
  if (normalized.includes("hinglish")) {
    return "Use natural Hinglish in Latin script (Hindi + English mix) for Indian audience.";
  }
  return `Use natural conversational ${language}.`;
}

function buildPromptOptionsInstruction({ project, actor, scenePlan }) {
  const featureText = Array.isArray(project.brief?.product_features)
    ? project.brief.product_features.join(", ")
    : project.brief?.product_features ?? "";
  const trustText = Array.isArray(project.brief?.trust_points)
    ? project.brief.trust_points.join(", ")
    : project.brief?.trust_points ?? "";

  return `You are a script designer for short UGC videos.
Generate exactly 3 full-ad prompt options in strict JSON only.

Focus:
- Write only scene-level dialogue and natural human actions.
- Do not describe environment, set design, wardrobe, or physical appearance.

Constraints:
- Language label: ${project.language}
- ${buildLanguageGuidance(project.language)}
- Product name: ${project.brief?.product_name ?? "product"}
- Product features: ${featureText}
- Trust points: ${trustText}
- CTA: ${project.brief?.cta ?? ""}
- Creator style context: ${actor?.name ?? project.actor_id} - ${actor?.short_description ?? ""}
- User intent: ${project.brief?.user_prompt ?? ""}
- Scenes: exactly 4 scenes
- Duration: 8 seconds per scene
- Objective order: hook, feature, trust, cta
- The first scene must be a strong hook tailored to product.
- Dialogue must be short, natural, conversational.
- Actions must be realistic and match dialogue (showing product, gestures, facial expression).
- The last scene must include subtle recommendation / CTA.
- Product image reference may be provided. Treat it as source of truth for product class/form factor.
- Do not infer product type from name alone. Product image form-factor overrides product name wording.
- Keep actions product-form neutral unless the product reference clearly supports a specific usage.
- Return JSON only, no markdown.

Output schema:
{
  "prompt_options": [
    {
      "option_id": "A|B|C",
      "title": "short title",
      "ad_prompt": {
        "total_scenes": 4,
        "scene_duration_sec": 8,
        "language": "${project.language}",
        "notes": "optional short note",
        "scenes": [
          {"scene_id":1,"objective":"hook","dialogue":"...","actions":"..."},
          {"scene_id":2,"objective":"feature","dialogue":"...","actions":"..."},
          {"scene_id":3,"objective":"trust","dialogue":"...","actions":"..."},
          {"scene_id":4,"objective":"cta","dialogue":"...","actions":"..."}
        ]
      }
    }
  ]
}

Ground truth objectives from planner:
${JSON.stringify(scenePlan.map((scene) => ({ scene_id: scene.scene_id, objective: scene.objective })), null, 2)}
`;
}

function buildStorylineSummary(selectedOption) {
  const scenes = selectedOption?.ad_prompt?.scenes ?? [];
  if (scenes.length === 0) {
    return "No scene list available.";
  }
  return scenes
    .map(
      (scene) =>
        `Scene ${scene.scene_id} (${scene.objective}): dialogue="${scene.dialogue}" | action="${scene.actions}"`,
    )
    .join("\n");
}

function buildContinuityBlock(continuityProfile) {
  if (!continuityProfile) {
    return "No anchor profile yet: establish a stable actor identity and outfit in scene 1, then keep it unchanged for scenes 2-4.";
  }
  return `Locked continuity profile (must be preserved exactly):
- Face: ${continuityProfile.actor_face_signature}
- Hair: ${continuityProfile.hairstyle_signature}
- Outfit: ${continuityProfile.outfit_signature}
- Environment: ${continuityProfile.environment_signature}
- Camera/lens: ${continuityProfile.camera_signature}
- Product identity: ${continuityProfile.product_signature}`;
}

function buildImagePrompt({
  project,
  actor,
  selectedOption,
  frame,
  continuityProfile,
  hasAnchorFrame,
  hasPreviousFrame,
  refinementNotes,
}) {
  const storyline = buildStorylineSummary(selectedOption);
  const continuityRules = buildContinuityBlock(continuityProfile);
  const referenceRules = [
    "Product reference image is ground truth for product identity and shape.",
    "Actor reference photo is provided. The generated person MUST match this reference — same face, same skin tone, same body type, same age.",
    hasAnchorFrame
      ? "Anchor frame reference is provided. Keep same actor face, same outfit, and same environment."
      : "No anchor frame available yet. Establish actor identity and wardrobe now.",
    hasPreviousFrame
      ? "Previous frame reference is provided. Keep transitions natural while preserving identity and outfit."
      : "No previous frame for this scene.",
  ].join("\n- ");

  const refinementSection = refinementNotes
    ? `Previous attempt issues to fix strictly:\n${refinementNotes}`
    : "No prior attempt issues.";

  return `Generate one photorealistic vertical UGC keyframe (9:16) for scene ${frame.scene_id} of 4.

Context:
- Language label: ${project.language}
- ${buildLanguageGuidance(project.language)}
- Actor id: ${project.actor_id}
- Actor profile: ${actor?.name ?? "actor"} | ${actor?.short_description ?? ""}
- Product: ${project.brief?.product_name ?? "product"}
- Selected option: ${selectedOption.option_id}
- Current scene objective: ${frame.frame_prompt_json.scene_objective}
- User staging instruction: ${project.brief?.user_prompt ?? ""}
- Dialogue hint: ${frame.frame_prompt_json.dialogue_hint}
- Action hint: ${frame.frame_prompt_json.actions_hint}

Storyboard (all scenes):
${storyline}

Continuity lock:
${continuityRules}

Reference rules:
- ${referenceRules}

Hard constraints:
- Keep same person identity in all scenes (no face swap).
- Keep same clothes in all scenes unless explicitly stated otherwise (not stated here).
- Keep same room/location and lighting continuity.
- Show the exact same product identity from the reference image.
- Do not replace product with any different item class (no box swap, no packet swap, no alternate brand/product).
- Show EXACTLY ONE instance of the product in every frame — never duplicate the product. Do not show two or more copies of the same product packaging in a single frame unless the user's staging instruction explicitly asks for multiple products.
- Keep product branding/colors/label layout consistent with reference image.
- Product size should remain physically plausible and consistent across scenes.
- Keep apparent product scale in a narrow band across scenes (no drastic size jumps).
- If action suggests a different usage than the reference form-factor, adapt gesture to showing/holding/pointing the reference product instead of morphing product type.
- Scene action must match current scene action hint.
- Product must be visible and readable.
- No text overlays, subtitles, logos, watermarks, UI, borders.

${refinementSection}
`;
}

function buildFallbackContinuityProfile({ actor, project, productName }) {
  return {
    actor_face_signature: `${actor?.name ?? "actor"} face shape and skin tone remain unchanged`,
    hairstyle_signature: "same hairstyle in all scenes",
    outfit_signature: "same top and bottom outfit in all scenes",
    environment_signature: project.brief?.user_prompt ?? "same living-room setup with warm light",
    camera_signature: "medium close-up, portrait 9:16, similar focal length",
    product_signature: `${productName} keeps identical identity, shape, and branding`,
  };
}

export class GeminiProvider {
  constructor({ apiKey, textModel, imageModel, apiBase = GEMINI_API_BASE, mediaStore = null, storageDir = "" }) {
    this.apiKey = apiKey;
    this.textModel = textModel;
    this.imageModel = imageModel;
    this.apiBase = apiBase;
    this.mediaStore = mediaStore;
    this.storageDir = storageDir;
  }

  isEnabled() {
    return Boolean(this.apiKey);
  }

  async requestGenerateContent({ model, body, timeoutMs = 60000, maxAttempts = 3 }) {
    if (!this.apiKey) {
      throw new Error("Gemini provider is not configured");
    }

    const url = `${this.apiBase}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const text = await response.text();
        let json = {};
        if (text) {
          try {
            json = JSON.parse(text);
          } catch {
            json = {};
          }
        }

        if (!response.ok) {
          const reason = json?.error?.message ?? text.slice(0, 300) ?? `HTTP ${response.status}`;
          const error = new Error(`Gemini API error (${response.status}): ${reason}`);
          lastError = error;
          if (shouldRetryStatus(response.status) && attempt < maxAttempts) {
            await sleep(300 * attempt);
            continue;
          }
          throw error;
        }
        if (!json || typeof json !== "object") {
          const error = new Error("Gemini API returned empty/invalid JSON payload");
          lastError = error;
          if (attempt < maxAttempts) {
            await sleep(300 * attempt);
            continue;
          }
          throw error;
        }

        return json;
      } catch (error) {
        lastError = error;
        const timedOut = error instanceof Error && error.name === "AbortError";
        if (timedOut) {
          lastError = new Error(`Gemini API request timed out after ${timeoutMs}ms (attempt ${attempt}/${maxAttempts})`);
        }
        if (attempt < maxAttempts && timedOut) {
          await sleep(300 * attempt);
          continue;
        }
        if (attempt < maxAttempts && error instanceof Error && /network|fetch|socket|econn/i.test(error.message)) {
          await sleep(300 * attempt);
          continue;
        }
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError ?? new Error("Gemini API request failed");
  }

  async inferContinuityProfile({ project, actor, productName, anchorFrame }) {
    const fallback = buildFallbackContinuityProfile({ actor, project, productName });
    try {
      const prompt = `Analyze the anchor frame and return strict JSON only.
Summarize continuity attributes that must stay constant across scene 2-4.
Return this schema:
{
  "actor_face_signature": "short visual description",
  "hairstyle_signature": "short visual description",
  "outfit_signature": "short visual description",
  "environment_signature": "short visual description",
  "camera_signature": "short visual description",
  "product_signature": "short visual description"
}`;
      const payload = await this.requestGenerateContent({
        model: this.textModel,
        body: {
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: anchorFrame.mimeType,
                    data: anchorFrame.data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        },
        timeoutMs: 30000,
        maxAttempts: 2,
      });
      const parsed = extractJsonObject(extractText(payload));
      const validated = continuityProfileSchema.parse(parsed);
      return validated;
    } catch {
      return fallback;
    }
  }

  async generatePromptOptions({ project, actor, scenePlan }) {
    const instruction = buildPromptOptionsInstruction({ project, actor, scenePlan });
    const parts = [{ text: instruction }];
    let productBase64 = null;
    let productMime = "image/png";
    if (project.product_image_path && fs.existsSync(project.product_image_path)) {
      productMime = mimeTypeFromPath(project.product_image_path);
      productBase64 = fs.readFileSync(project.product_image_path).toString("base64");
    } else if (project.product_image_path && isSupabaseUri(project.product_image_path) && this.mediaStore) {
      productBase64 = await this.mediaStore.readAsBase64({ pathOrUrl: project.product_image_path });
      if (project.product_image_url) {
        productMime = mimeTypeFromPath(project.product_image_url);
      }
    } else if (project.product_image_url) {
      const response = await fetch(project.product_image_url);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        productBase64 = buffer.toString("base64");
        productMime = mimeTypeFromPath(project.product_image_url);
      }
    }

    if (productBase64) {
      parts.push({
        text: "Product reference image: infer product form-factor from this image and align dialogue/actions.",
      });
      parts.push({
        inlineData: {
          mimeType: productMime,
          data: productBase64,
        },
      });
    }
    const payload = await this.requestGenerateContent({
      model: this.textModel,
      body: {
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.8,
        },
      },
      timeoutMs: 120000,
      maxAttempts: 3,
    });

    const parsed = extractJsonObject(extractText(payload));
    const validated = promptOptionsResponseSchema.parse(parsed);

    // Normalize order and ids to guarantee API contract.
    const byOptionId = new Map(validated.prompt_options.map((option) => [option.option_id, option]));
    return ["A", "B", "C"].map((optionId) => {
      const option = byOptionId.get(optionId);
      if (!option) {
        throw new Error(`Gemini response missing option ${optionId}`);
      }
      return option;
    });
  }

  async generateKeyframes({
    project,
    actor,
    selectedOption,
    framePrompts,
    keyframesDir,
    storageDir,
    projectId,
    baseUrl,
  }) {
    if (!project.product_image_path && !project.product_image_url) {
      throw new Error("Product image is missing for keyframe generation");
    }

    let productBase64 = null;
    let productMime = "image/png";
    if (project.product_image_path && fs.existsSync(project.product_image_path)) {
      const productData = fs.readFileSync(project.product_image_path);
      productMime = mimeTypeFromPath(project.product_image_path);
      productBase64 = productData.toString("base64");
    } else if (project.product_image_path && isSupabaseUri(project.product_image_path) && this.mediaStore) {
      productBase64 = await this.mediaStore.readAsBase64({ pathOrUrl: project.product_image_path });
      productMime = mimeTypeFromPath(project.product_image_url || project.product_image_path);
    } else if (project.product_image_url) {
      const response = await fetch(project.product_image_url);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        productBase64 = buffer.toString("base64");
        productMime = mimeTypeFromPath(project.product_image_url);
      }
    }

    if (!productBase64) {
      throw new Error("Product image is missing for keyframe generation");
    }

    const productName = project.brief?.product_name ?? "product";
    const projectFrameDir = path.join(keyframesDir, projectId);
    fs.mkdirSync(projectFrameDir, { recursive: true });

    // Load actor reference image if available
    let actorRefBase64 = null;
    let actorRefMime = null;
    if (actor?.reference_image_url) {
      if (/^https?:\/\//i.test(actor.reference_image_url)) {
        const response = await fetch(actor.reference_image_url);
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          actorRefBase64 = buffer.toString("base64");
          actorRefMime = mimeTypeFromPath(actor.reference_image_url);
        }
      } else if (storageDir) {
        const refRelPath = actor.reference_image_url.replace(/^\/storage\//, "");
        const refAbsPath = path.join(storageDir, refRelPath);
        if (fs.existsSync(refAbsPath)) {
          actorRefBase64 = fs.readFileSync(refAbsPath).toString("base64");
          actorRefMime = mimeTypeFromPath(refAbsPath);
        }
      }
    }

    const inputFrames = framePrompts.slice(0, 4).sort((a, b) => a.scene_id - b.scene_id);
    if (inputFrames.length === 0) {
      throw new Error("No frame prompts provided for keyframe generation");
    }

    const warnings = [];
    const continuityProfile = buildFallbackContinuityProfile({
      actor,
      project,
      productName,
    });

    const generateFrameImage = async ({ frame, anchorFrame = null }) => {
      const instruction = buildImagePrompt({
        project,
        actor,
        selectedOption,
        frame,
        continuityProfile,
        hasAnchorFrame: Boolean(anchorFrame),
        hasPreviousFrame: false,
        refinementNotes: "",
      });

      const parts = [
        { text: instruction },
        {
          inlineData: {
            mimeType: productMime,
            data: productBase64,
          },
        },
      ];
      if (actorRefBase64) {
        parts.push({ text: "Actor reference photo — match this person's face, body type, and appearance in the generated frame." });
        parts.push({
          inlineData: {
            mimeType: actorRefMime,
            data: actorRefBase64,
          },
        });
      }
      if (anchorFrame) {
        parts.push({ text: "Anchor scene frame reference for identity continuity." });
        parts.push({
          inlineData: {
            mimeType: anchorFrame.mimeType,
            data: anchorFrame.data,
          },
        });
      }

      const payload = await this.requestGenerateContent({
        model: this.imageModel,
        body: {
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: "9:16",
            },
          },
        },
        timeoutMs: IMAGE_GENERATION_TIMEOUT_MS,
        maxAttempts: IMAGE_GENERATION_REQUEST_ATTEMPTS,
      });
      const image = extractInlineImage(payload);
      if (!image?.data) {
        throw new Error(
          `Gemini image output missing for scene ${frame.scene_id}. Verify model supports IMAGE output.`,
        );
      }
      return image;
    };

    const frameToResult = ({ frame, image, anchorUsed }) => {
      const extension = extFromMime(image.mimeType);
      const fileName = `frame_scene_${frame.scene_id}.${extension}`;
      const absolutePath = path.join(projectFrameDir, fileName);
      const imageBuffer = Buffer.from(image.data, "base64");

      if (this.mediaStore) {
        const objectPath = `keyframes/${projectId}/${fileName}`;
        return this.mediaStore
          .uploadBuffer({
            objectPath,
            buffer: imageBuffer,
            contentType: image.mimeType || "image/png",
          })
          .then((uploaded) => ({
            scene_id: frame.scene_id,
            frame_prompt_json: frame.frame_prompt_json,
            frame_path: uploaded.uri,
            frame_url: uploaded.publicUrl,
            source_model: this.imageModel,
            used_product_image_reference: true,
            continuity_score: anchorUsed ? 70 : 75,
          }));
      }

      fs.writeFileSync(absolutePath, imageBuffer);

      return {
        scene_id: frame.scene_id,
        frame_prompt_json: frame.frame_prompt_json,
        frame_path: absolutePath,
        frame_url: `${baseUrl}/storage/keyframes/${projectId}/${fileName}`,
        source_model: this.imageModel,
        used_product_image_reference: true,
        continuity_score: anchorUsed ? 70 : 75,
      };
    };

    const firstScene = inputFrames.find((frame) => frame.scene_id === 1) ?? inputFrames[0];
    if (firstScene.scene_id !== 1) {
      warnings.push("scene_1_missing_in_frame_prompts_using_first_scene_as_anchor");
    }

    const anchorImage = await generateFrameImage({ frame: firstScene, anchorFrame: null });
    const anchorFrame = { data: anchorImage.data, mimeType: anchorImage.mimeType };
    const remainingFrames = inputFrames.filter((frame) => frame.scene_id !== firstScene.scene_id);

    // Generate scene 2-4 in parallel while locking visual identity to scene 1.
    const remainingResults = await Promise.all(
      remainingFrames.map(async (frame) => {
        const image = await generateFrameImage({ frame, anchorFrame });
        return frameToResult({ frame, image, anchorUsed: true });
      }),
    );
    const anchorResult = await frameToResult({ frame: firstScene, image: anchorImage, anchorUsed: false });
    const resolvedRemaining = await Promise.all(remainingResults);
    const allResults = [anchorResult, ...resolvedRemaining].sort((a, b) => a.scene_id - b.scene_id);

    return {
      keyframes: allResults,
      warnings,
    };
  }
}
