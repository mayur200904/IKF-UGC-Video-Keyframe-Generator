import fs from "node:fs";
import path from "node:path";

const DEFAULT_OBJECTIVES = ["hook", "feature", "trust", "cta"];

function compactFeatures(features) {
  if (!features) {
    return "highlight core product benefits";
  }
  if (Array.isArray(features)) {
    return features.join(", ");
  }
  return String(features);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sceneLine({ objective, productName, featureText, ctaText }) {
  switch (objective) {
    case "hook":
      return `If you want better results with ${productName}, watch this.`;
    case "feature":
      return `${productName} helps because it offers ${featureText}.`;
    case "trust":
      return `I have tested this and it feels reliable for daily use.`;
    case "cta":
      return ctaText || `Try ${productName} if this matches your needs.`;
    default:
      return `Sharing a quick update about ${productName}.`;
  }
}

function actionLine({ objective }) {
  switch (objective) {
    case "hook":
      return "Makes direct eye contact, raises product to camera, slight forward lean.";
    case "feature":
      return "Points to product details and nods while explaining key benefit.";
    case "trust":
      return "Smiles naturally, shows product closely, calm confident hand movement.";
    case "cta":
      return "Warm smile, open palm gesture, product held visible during final line.";
    default:
      return "Natural conversational hand gestures while speaking.";
  }
}

function buildVariantTone(variant) {
  if (variant === "A") {
    return "direct testimonial style";
  }
  if (variant === "B") {
    return "problem-solution style";
  }
  return "friendly recommendation style";
}

export function buildScenePlan(brief = {}) {
  const productName = brief.product_name || "the product";
  const featureText = compactFeatures(brief.product_features);
  const ctaText = brief.cta || "";

  return DEFAULT_OBJECTIVES.map((objective, idx) => ({
    scene_id: idx + 1,
    duration_sec: 8,
    objective,
    dialogue: sceneLine({ objective, productName, featureText, ctaText }),
    actions: actionLine({ objective }),
  }));
}

export function generatePromptOptions({ brief = {}, language = "en", scenePlan }) {
  const productName = brief.product_name || "the product";
  const optionIds = ["A", "B", "C"];

  return optionIds.map((optionId) => ({
    option_id: optionId,
    title: `${buildVariantTone(optionId)} (${language})`,
    ad_prompt: {
      total_scenes: 4,
      scene_duration_sec: 8,
      language,
      notes: `Full-ad option ${optionId} for ${productName}.`,
      scenes: scenePlan.map((scene) => ({
        scene_id: scene.scene_id,
        objective: scene.objective,
        dialogue:
          optionId === "A"
            ? scene.dialogue
            : optionId === "B"
              ? `Quick issue-first line, then benefit: ${scene.dialogue}`
              : `Friendly and warm tone: ${scene.dialogue}`,
        actions:
          optionId === "C"
            ? `${scene.actions} Keep an inviting and relaxed expression.`
            : scene.actions,
      })),
    },
  }));
}

export function buildFramePrompts({ project, selectedOption }) {
  const stagingInstruction = project.brief?.user_prompt || "natural product review staging";
  const productName = project.brief?.product_name || "the product";
  const scenes = selectedOption?.ad_prompt?.scenes ?? [];

  return scenes.slice(0, 4).map((scene) => ({
    scene_id: scene.scene_id,
    frame_prompt_json: {
      actor_id: project.actor_id,
      product_name: productName,
      scene_objective: scene.objective,
      staging_instruction: stagingInstruction,
      dialogue_hint: scene.dialogue,
      actions_hint: scene.actions,
      product_visibility: "clear",
      shot_type: "medium_closeup",
      lighting: "soft_commercial",
      continuity_anchor: `option-${selectedOption.option_id}`,
    },
  }));
}

export function materializeSvgKeyframes({ keyframesDir, projectId, framePrompts, baseUrl }) {
  const created = [];
  const projectFrameDir = path.join(keyframesDir, projectId);
  fs.mkdirSync(projectFrameDir, { recursive: true });

  for (const frame of framePrompts.slice(0, 4)) {
    const fileName = `frame_scene_${frame.scene_id}.svg`;
    const absolutePath = path.join(projectFrameDir, fileName);
    const title = `Project ${projectId} | Scene ${frame.scene_id}`;
    const body = `${frame.frame_prompt_json.scene_objective.toUpperCase()} | ${frame.frame_prompt_json.dialogue_hint}`;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1080" y2="1920" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F5F8FF"/>
      <stop offset="1" stop-color="#E6F2EA"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <rect x="80" y="120" width="920" height="1680" rx="36" fill="white" stroke="#D7DFEA" stroke-width="4"/>
  <text x="120" y="220" fill="#152238" font-family="Arial, sans-serif" font-size="36" font-weight="700">${escapeXml(title)}</text>
  <text x="120" y="300" fill="#1F2D3D" font-family="Arial, sans-serif" font-size="30">${escapeXml(body)}</text>
  <text x="120" y="420" fill="#355070" font-family="Arial, sans-serif" font-size="26">Actor: ${escapeXml(frame.frame_prompt_json.actor_id)}</text>
  <text x="120" y="470" fill="#355070" font-family="Arial, sans-serif" font-size="26">Shot: ${escapeXml(frame.frame_prompt_json.shot_type)}</text>
  <text x="120" y="520" fill="#355070" font-family="Arial, sans-serif" font-size="26">Visibility: ${escapeXml(frame.frame_prompt_json.product_visibility)}</text>
</svg>`;

    fs.writeFileSync(absolutePath, svg, "utf8");
    created.push({
      scene_id: frame.scene_id,
      frame_prompt_json: frame.frame_prompt_json,
      frame_path: absolutePath,
      frame_url: `${baseUrl}/storage/keyframes/${projectId}/${fileName}`,
    });
  }

  return created;
}

