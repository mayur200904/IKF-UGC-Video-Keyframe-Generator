import {
  buildFramePrompts,
  buildScenePlan,
  generatePromptOptions,
  materializeSvgKeyframes,
} from "./generators.js";

export const JOB_TYPES = {
  PROMPT_OPTIONS: "prompt_options",
  KEYFRAMES: "keyframes",
};

const CLAIM_RISK_PATTERNS = [
  /\b100%\s*(guarantee|guaranteed)\b/i,
  /\b(cure|miracle|instant results?)\b/i,
  /\bno side effects\b/i,
];

function collectPromptWarnings(promptOptions) {
  const warnings = [];
  for (const option of promptOptions) {
    for (const scene of option.ad_prompt.scenes) {
      for (const pattern of CLAIM_RISK_PATTERNS) {
        if (pattern.test(scene.dialogue)) {
          warnings.push(
            `option_${option.option_id}_scene_${scene.scene_id}: potential high-risk claim in dialogue`,
          );
          break;
        }
      }
      if (!scene.actions || scene.actions.trim().length < 5) {
        warnings.push(`option_${option.option_id}_scene_${scene.scene_id}: weak action guidance`);
      }
    }
  }
  return warnings;
}

function collectKeyframeWarnings(framePrompts, keyframes) {
  const warnings = [];
  if (keyframes.length !== 4) {
    warnings.push(`expected_4_keyframes_received_${keyframes.length}`);
  }
  for (const frame of framePrompts.slice(0, 4)) {
    if (!frame.frame_prompt_json.actions_hint || frame.frame_prompt_json.actions_hint.length < 5) {
      warnings.push(`scene_${frame.scene_id}: missing_or_weak_actions_hint`);
    }
  }
  return warnings;
}

export class JobRunner {
  constructor({ store, keyframesDir, storageDir, baseUrl, provider = null, allowMockFallback = false }) {
    this.store = store;
    this.keyframesDir = keyframesDir;
    this.storageDir = storageDir;
    this.baseUrl = baseUrl;
    this.provider = provider;
    this.allowMockFallback = allowMockFallback;
    this.running = false;
    this.queue = [];
  }

  enqueue(job) {
    this.queue.push(job);
    this.drain();
  }

  async drain() {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      while (this.queue.length > 0) {
        const current = this.queue.shift();
        if (!current) {
          break;
        }
        await this.execute(current);
      }
    } finally {
      this.running = false;
    }
  }

  async getActor(actorId) {
    const actors = await this.store.listActors();
    return actors.find((actor) => actor.id === actorId) ?? null;
  }

  async execute(job) {
    await this.store.updateJob(job.id, (state) => ({
      ...state,
      status: "running",
      started_at: new Date().toISOString(),
      error: null,
    }));

    try {
      if (job.type === JOB_TYPES.PROMPT_OPTIONS) {
        await this.handlePromptOptions(job);
      } else if (job.type === JOB_TYPES.KEYFRAMES) {
        await this.handleKeyframes(job);
      } else {
        throw new Error(`Unsupported job type: ${job.type}`);
      }
    } catch (error) {
      await this.store.updateJob(job.id, (state) => ({
        ...state,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown job failure",
        completed_at: new Date().toISOString(),
      }));
    }
  }

  async handlePromptOptions(job) {
    const project = await this.store.getProject(job.project_id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (!project.brief) {
      throw new Error("Cannot generate prompts without brief");
    }

    const scenePlan = buildScenePlan(project.brief);
    const actor = await this.getActor(project.actor_id);
    const providerEnabled = this.provider?.isEnabled() ?? false;
    const resultWarnings = [];

    if (!providerEnabled && !this.allowMockFallback) {
      throw new Error("Gemini provider is not configured and mock fallback is disabled");
    }

    let promptOptions = null;
    let generationSource = "mock";
    if (providerEnabled) {
      try {
        promptOptions = await this.provider.generatePromptOptions({
          project,
          actor,
          scenePlan,
        });
        generationSource = "gemini";
      } catch (error) {
        if (!this.allowMockFallback) {
          throw error;
        }
        resultWarnings.push(
          `gemini_prompt_generation_failed_fallback_to_mock: ${error instanceof Error ? error.message : "unknown_error"}`,
        );
      }
    }
    if (!promptOptions) {
      promptOptions = generatePromptOptions({
        brief: project.brief,
        language: project.language,
        scenePlan,
      });
    }

    const guardrailWarnings = collectPromptWarnings(promptOptions);
    resultWarnings.push(...guardrailWarnings);
    const finalStatus = resultWarnings.length > 0 ? "needs_review" : "completed";

    await this.store.updateProject(project.id, (state) => ({
      ...state,
      scene_plan: scenePlan,
      prompt_options: promptOptions,
      selected_option_id: null,
      keyframes: [],
    }));

    await this.store.updateJob(job.id, (state) => ({
      ...state,
      status: finalStatus,
      result: {
        prompt_options_generated: promptOptions.length,
        generation_source: generationSource,
        warnings: resultWarnings,
      },
      completed_at: new Date().toISOString(),
    }));
  }

  async handleKeyframes(job) {
    const project = await this.store.getProject(job.project_id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (!project.selected_option_id) {
      throw new Error("Select a prompt option before generating keyframes");
    }

    const selected = project.prompt_options.find(
      (opt) => opt.option_id === project.selected_option_id,
    );
    if (!selected) {
      throw new Error("Selected prompt option no longer exists");
    }

    const framePrompts = buildFramePrompts({ project, selectedOption: selected });
    if (framePrompts.length < 4) {
      throw new Error("Expected exactly 4 scenes for keyframe generation");
    }
    const actor = await this.getActor(project.actor_id);
    const providerEnabled = this.provider?.isEnabled() ?? false;
    const resultWarnings = [];

    if (!providerEnabled && !this.allowMockFallback) {
      throw new Error("Gemini provider is not configured and mock fallback is disabled");
    }

    let generated = null;
    let generationSource = "mock";
    if (providerEnabled) {
      try {
        generated = await this.provider.generateKeyframes({
          project,
          actor,
          selectedOption: selected,
          framePrompts,
          keyframesDir: this.keyframesDir,
          storageDir: this.storageDir,
          projectId: project.id,
          baseUrl: this.baseUrl,
        });
        generationSource = "gemini";
      } catch (error) {
        if (!this.allowMockFallback) {
          throw error;
        }
        resultWarnings.push(
          `gemini_keyframe_generation_failed_fallback_to_mock: ${error instanceof Error ? error.message : "unknown_error"}`,
        );
      }
    }
    if (!generated) {
      const fallbackKeyframes = materializeSvgKeyframes({
        keyframesDir: this.keyframesDir,
        projectId: project.id,
        framePrompts,
        baseUrl: this.baseUrl,
      });
      generated = { keyframes: fallbackKeyframes, warnings: [] };
    }

    const keyframes = generated.keyframes.slice(0, 4);
    resultWarnings.push(...(generated.warnings ?? []));
    resultWarnings.push(...collectKeyframeWarnings(framePrompts, keyframes));
    const finalStatus = resultWarnings.length > 0 ? "needs_review" : "completed";

    await this.store.updateProject(project.id, (state) => ({
      ...state,
      keyframes,
    }));

    await this.store.updateJob(job.id, (state) => ({
      ...state,
      status: finalStatus,
      result: {
        keyframes_generated: keyframes.length,
        selected_option_id: project.selected_option_id,
        generation_source: generationSource,
        warnings: resultWarnings,
      },
      completed_at: new Date().toISOString(),
    }));
  }
}
