import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const PROJECT_STORAGE_KEY = "ugc_frontend_project_id";
const TERMINAL_JOB_STATUSES = new Set(["completed", "failed", "needs_review"]);

function resolveMediaUrl(url) {
  if (!url) {
    return "";
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
}

const initialFormState = {
  actorId: "",
  language: "hinglish",
  userPrompt: "",
  productName: "",
  productFeatures: "",
  cta: "",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeIdempotencyKey(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  if (!response.ok) {
    const message = body?.error || body?.message || response.statusText || "request_failed";
    throw new Error(message);
  }
  return body;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function toFeaturePayload(rawFeatures) {
  const list = rawFeatures
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (list.length <= 1) {
    return list[0] ?? "";
  }
  return list;
}

function validateForm(form, hasImageOrExisting) {
  if (!form.actorId) {
    return "Select an actor.";
  }
  if (form.userPrompt.trim().length < 8) {
    return "Idea prompt must be at least 8 characters.";
  }
  if (form.productName.trim().length < 2) {
    return "Product name must be at least 2 characters.";
  }
  if (toFeaturePayload(form.productFeatures) === "") {
    return "Add at least one product feature.";
  }
  if (form.cta.trim().length < 2) {
    return "CTA must be at least 2 characters.";
  }
  if (!hasImageOrExisting) {
    return "Upload a product image.";
  }
  return null;
}

function formatPromptOptionForCopy(option) {
  const scenes = normalizeArray(option?.ad_prompt?.scenes)
    .map(
      (scene) =>
        `Scene ${scene.scene_id} (${scene.objective})\nDialogue: ${scene.dialogue}\nActions: ${scene.actions}`,
    )
    .join("\n\n");
  return `${option.title}\n\n${scenes}`;
}

function ActorCard({ actor, selected, onSelect }) {
  const [imageError, setImageError] = useState(false);
  const initials = actor.name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      className={`actor-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(actor.id)}
    >
      <div className="actor-thumb-wrap">
        {!imageError ? (
          <img
            src={resolveMediaUrl(actor.image_url)}
            alt={actor.name}
            className="actor-thumb"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="actor-fallback">{initials}</div>
        )}
      </div>
      <div className="actor-name">{actor.name}</div>
      <div className="actor-desc">{actor.short_description}</div>
    </button>
  );
}

export default function App() {
  const [actors, setActors] = useState([]);
  const [allActors, setAllActors] = useState([]);
  const [actorsLoading, setActorsLoading] = useState(true);
  const [actorsError, setActorsError] = useState("");

  const [form, setForm] = useState(initialFormState);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState("");

  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState(null);
  const [promptOptions, setPromptOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [keyframes, setKeyframes] = useState([]);

  const [promptJob, setPromptJob] = useState(null);
  const [keyframeJob, setKeyframeJob] = useState(null);

  const [busyAction, setBusyAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [copiedOptionId, setCopiedOptionId] = useState("");
  const [actorPopup, setActorPopup] = useState({ type: "", message: "" });
  const actorPopupTimerRef = useRef(null);

  const hasPromptOptions = promptOptions.length > 0;
  const hasKeyframes = keyframes.length > 0;
  const canExport = hasPromptOptions && hasKeyframes;

  const latestJobLabel = useMemo(() => {
    if (busyAction) {
      return busyAction;
    }
    if (keyframeJob && !TERMINAL_JOB_STATUSES.has(keyframeJob.status)) {
      return "Generating keyframes...";
    }
    if (promptJob && !TERMINAL_JOB_STATUSES.has(promptJob.status)) {
      return "Generating prompt options...";
    }
    return "";
  }, [busyAction, keyframeJob, promptJob]);

  const showActorPopup = useCallback((type, message) => {
    if (actorPopupTimerRef.current) {
      clearTimeout(actorPopupTimerRef.current);
    }
    setActorPopup({ type, message });
    actorPopupTimerRef.current = setTimeout(() => {
      setActorPopup({ type: "", message: "" });
      actorPopupTimerRef.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (actorPopupTimerRef.current) {
        clearTimeout(actorPopupTimerRef.current);
      }
    };
  }, []);

  const syncProjectState = useCallback((nextProject, hydrateDraft = false) => {
    setProject(nextProject);
    setPromptOptions(normalizeArray(nextProject.prompt_options));
    setSelectedOptionId(nextProject.selected_option_id ?? null);
    setKeyframes(normalizeArray(nextProject.keyframes));

    if (hydrateDraft && nextProject.brief) {
      const features = nextProject.brief.product_features;
      setForm((prev) => ({
        ...prev,
        actorId: nextProject.actor_id ?? prev.actorId,
        language: nextProject.language ?? prev.language,
        userPrompt: nextProject.brief.user_prompt ?? prev.userPrompt,
        productName: nextProject.brief.product_name ?? prev.productName,
        productFeatures: Array.isArray(features) ? features.join(", ") : features ?? prev.productFeatures,
        cta: nextProject.brief.cta ?? prev.cta,
      }));
    }

    if (!hydrateDraft) {
      setForm((prev) => ({
        ...prev,
        actorId: nextProject.actor_id ?? prev.actorId,
        language: nextProject.language ?? prev.language,
      }));
    }
  }, []);

  const refreshProject = useCallback(
    async (targetProjectId, hydrateDraft = false) => {
      const payload = await requestJson(`/v1/projects/${targetProjectId}`);
      const nextProject = payload.project;
      if (!nextProject) {
        throw new Error("project_not_found");
      }
      setProjectId(nextProject.id);
      localStorage.setItem(PROJECT_STORAGE_KEY, nextProject.id);
      syncProjectState(nextProject, hydrateDraft);
      return nextProject;
    },
    [syncProjectState],
  );

  const pollJobUntilTerminal = useCallback(async (jobId, setJobState) => {
    const maxAttempts = 240;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const payload = await requestJson(`/v1/jobs/${jobId}`);
      const job = payload.job;
      setJobState(job);
      if (job && TERMINAL_JOB_STATUSES.has(job.status)) {
        return job;
      }
      await sleep(2500);
    }
    throw new Error("job_poll_timeout");
  }, []);

  const ensureProject = useCallback(async () => {
    if (projectId) {
      return projectId;
    }
    const payload = await requestJson("/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `ugc-${Date.now()}`,
        actor_id: form.actorId,
        language: form.language,
      }),
    });
    const created = payload.project;
    if (!created?.id) {
      throw new Error("project_create_failed");
    }
    setProjectId(created.id);
    localStorage.setItem(PROJECT_STORAGE_KEY, created.id);
    syncProjectState(created, false);
    return created.id;
  }, [form.actorId, form.language, projectId, syncProjectState]);

  const uploadImageIfNeeded = useCallback(
    async (targetProjectId, existingProject) => {
      if (!productImageFile && existingProject?.product_image_url) {
        return;
      }
      if (!productImageFile) {
        throw new Error("product_image_required");
      }

      const formData = new FormData();
      formData.append("product_image", productImageFile);
      await requestJson(`/v1/projects/${targetProjectId}/product-image`, {
        method: "POST",
        body: formData,
      });
    },
    [productImageFile],
  );

  const syncProjectSettings = useCallback(async (targetProjectId) => {
    await requestJson(`/v1/projects/${targetProjectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actor_id: form.actorId,
        language: form.language,
      }),
    });
  }, [form.actorId, form.language]);

  const saveBrief = useCallback(async (targetProjectId) => {
    await requestJson(`/v1/projects/${targetProjectId}/brief`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_prompt: form.userPrompt.trim(),
        product_name: form.productName.trim(),
        product_features: toFeaturePayload(form.productFeatures),
        cta: form.cta.trim(),
      }),
    });
  }, [form.cta, form.productFeatures, form.productName, form.userPrompt]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setActorsLoading(true);
      setActorsError("");
      try {
        const actorPayload = await requestJson("/v1/actors/recent");
        if (cancelled) {
          return;
        }
        const actorList = normalizeArray(actorPayload.actors);
        setActors(actorList);
        if (actorList.length > 0) {
          setForm((prev) => (prev.actorId ? prev : { ...prev, actorId: actorList[0].id }));
        }

        const storedProjectId = localStorage.getItem(PROJECT_STORAGE_KEY);
        if (storedProjectId) {
          try {
            await refreshProject(storedProjectId, true);
          } catch {
            localStorage.removeItem(PROJECT_STORAGE_KEY);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setActorsError(error instanceof Error ? error.message : "actors_load_failed");
        }
      } finally {
        if (!cancelled) {
          setActorsLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshProject]);

  useEffect(() => {
    if (!productImageFile) {
      setProductImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(productImageFile);
    setProductImagePreview(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [productImageFile]);

  const handleGeneratePrompts = async () => {
    setErrorMessage("");
    setStatusMessage("");

    const validationError = validateForm(form, Boolean(productImageFile || project?.product_image_url));
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setBusyAction("Creating project context...");
      const targetProjectId = await ensureProject();

      setBusyAction("Syncing actor & language...");
      await syncProjectSettings(targetProjectId);
      const latestProject = await refreshProject(targetProjectId, false);

      setBusyAction("Uploading product image...");
      await uploadImageIfNeeded(targetProjectId, latestProject);

      setBusyAction("Saving brief...");
      await saveBrief(targetProjectId);

      setBusyAction("Generating prompt options...");
      const start = await requestJson(`/v1/projects/${targetProjectId}/generate-prompt-options`, {
        method: "POST",
        headers: {
          "Idempotency-Key": makeIdempotencyKey("prompts"),
        },
      });

      const job = await pollJobUntilTerminal(start.job_id, setPromptJob);
      if (job.status === "failed") {
        throw new Error(job.error || "prompt_generation_failed");
      }

      await refreshProject(targetProjectId, false);
      setStatusMessage(
        job.status === "needs_review"
          ? "Prompt generation completed with review warnings."
          : "Prompt options generated.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "prompt_generation_failed");
    } finally {
      setBusyAction("");
    }
  };

  const handleSelectOption = async (optionId) => {
    if (!projectId) {
      return;
    }
    setErrorMessage("");
    setStatusMessage("");

    try {
      setBusyAction("Selecting prompt option...");
      await requestJson(`/v1/projects/${projectId}/select-prompt-option`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selected_option_id: optionId }),
      });
      await refreshProject(projectId, false);
      setStatusMessage(`Option ${optionId} selected.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "option_select_failed");
    } finally {
      setBusyAction("");
    }
  };

  const handleGenerateKeyframes = async (path = "generate-keyframes") => {
    if (!projectId) {
      setErrorMessage("Create project and prompts first.");
      return;
    }
    setErrorMessage("");
    setStatusMessage("");

    try {
      setBusyAction(path === "generate-keyframes" ? "Generating keyframes..." : "Regenerating keyframes...");
      const start = await requestJson(`/v1/projects/${projectId}/${path}`, {
        method: "POST",
        headers: {
          "Idempotency-Key": makeIdempotencyKey("frames"),
        },
      });
      const job = await pollJobUntilTerminal(start.job_id, setKeyframeJob);
      if (job.status === "failed") {
        throw new Error(job.error || "keyframe_generation_failed");
      }
      await refreshProject(projectId, false);
      setStatusMessage(
        job.status === "needs_review"
          ? "Keyframes generated with review warnings."
          : "Keyframes generated successfully.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "keyframe_generation_failed");
    } finally {
      setBusyAction("");
    }
  };

  const handleRegeneratePrompts = async () => {
    if (!projectId) {
      return;
    }
    setErrorMessage("");
    setStatusMessage("");

    try {
      setBusyAction("Regenerating prompt options...");
      const start = await requestJson(`/v1/projects/${projectId}/regenerate-prompt-options`, {
        method: "POST",
        headers: {
          "Idempotency-Key": makeIdempotencyKey("prompts-regen"),
        },
      });
      const job = await pollJobUntilTerminal(start.job_id, setPromptJob);
      if (job.status === "failed") {
        throw new Error(job.error || "prompt_regeneration_failed");
      }
      await refreshProject(projectId, false);
      setStatusMessage(
        job.status === "needs_review"
          ? "Prompt regeneration completed with warnings."
          : "Prompt options regenerated.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "prompt_regeneration_failed");
    } finally {
      setBusyAction("");
    }
  };

  const handleCopyOption = async (option) => {
    try {
      await navigator.clipboard.writeText(formatPromptOptionForCopy(option));
      setCopiedOptionId(option.option_id);
      setTimeout(() => {
        setCopiedOptionId((current) => (current === option.option_id ? "" : current));
      }, 1600);
    } catch {
      setErrorMessage("copy_failed");
    }
  };

  const handleResetProject = () => {
    localStorage.removeItem(PROJECT_STORAGE_KEY);
    setProjectId("");
    setProject(null);
    setPromptOptions([]);
    setSelectedOptionId(null);
    setKeyframes([]);
    setPromptJob(null);
    setKeyframeJob(null);
    setErrorMessage("");
    setStatusMessage("Started a fresh project state.");
  };

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [actorsPanelOpen, setActorsPanelOpen] = useState(false);
  const [actorsPanelList, setActorsPanelList] = useState([]);
  const [actorsPanelLoading, setActorsPanelLoading] = useState(false);
  const [createActorBusy, setCreateActorBusy] = useState(false);
  const [createActorError, setCreateActorError] = useState("");
  const [newActorName, setNewActorName] = useState("");
  const [newActorDesc, setNewActorDesc] = useState("");
  const [newActorFace, setNewActorFace] = useState(null);
  const [newActorRef, setNewActorRef] = useState(null);
  const newActorFaceInputRef = useRef(null);
  const newActorRefInputRef = useRef(null);

  const handleOpenHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const payload = await requestJson("/v1/projects");
      setHistoryList(normalizeArray(payload.projects));
    } catch {
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLoadProject = async (id) => {
    try {
      await refreshProject(id, true);
      setHistoryOpen(false);
      setStatusMessage("Loaded project from history.");
    } catch {
      setErrorMessage("Failed to load project.");
    }
  };

  const handleOpenActorsPanel = async () => {
    setActorsPanelOpen(true);
    setActorsPanelLoading(true);
    try {
      const payload = await requestJson("/v1/actors");
      setActorsPanelList(normalizeArray(payload.actors));
    } catch {
      setActorsPanelList([]);
    } finally {
      setActorsPanelLoading(false);
    }
  };

  const refreshRecentActors = async () => {
    try {
      const payload = await requestJson("/v1/actors/recent");
      const list = normalizeArray(payload.actors);
      setActors(list);
    } catch {
      /* keep current */
    }
  };

  const handleCreateActor = async () => {
    setCreateActorError("");
    if (!newActorName.trim() || newActorName.trim().length < 2) {
      setCreateActorError("Name must be at least 2 characters.");
      return;
    }
    if (!newActorDesc.trim() || newActorDesc.trim().length < 5) {
      setCreateActorError("Description must be at least 5 characters.");
      return;
    }
    const faceFile = newActorFace ?? newActorFaceInputRef.current?.files?.[0] ?? null;
    const refFile = newActorRef ?? newActorRefInputRef.current?.files?.[0] ?? null;

    if (!faceFile) {
      setCreateActorError("Face image is required.");
      return;
    }
    setCreateActorBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", newActorName.trim());
      fd.append("description", newActorDesc.trim());
      fd.append("face_image", faceFile);
      if (refFile) {
        fd.append("reference_image", refFile);
      }
      await requestJson("/v1/actors", { method: "POST", body: fd });
      setNewActorName("");
      setNewActorDesc("");
      setNewActorFace(null);
      setNewActorRef(null);
      if (newActorFaceInputRef.current) {
        newActorFaceInputRef.current.value = "";
      }
      if (newActorRefInputRef.current) {
        newActorRefInputRef.current.value = "";
      }
      // refresh panel list
      const payload = await requestJson("/v1/actors");
      setActorsPanelList(normalizeArray(payload.actors));
      await refreshRecentActors();
    } catch (err) {
      setCreateActorError(err instanceof Error ? err.message : "create_failed");
    } finally {
      setCreateActorBusy(false);
    }
  };

  const handleDeleteActor = async (actorId) => {
    try {
      await requestJson(`/v1/actors/${actorId}`, { method: "DELETE" });
      setActorsPanelList((prev) => prev.filter((a) => a.id !== actorId));
      await refreshRecentActors();
      showActorPopup("success", "Actor deleted successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "actor_delete_failed";
      if (message === "actor_in_use") {
        showActorPopup(
          "error",
          "Actor cannot be deleted because it is used by one or more projects.",
        );
        return;
      }
      if (message === "cannot_delete_default_actor") {
        showActorPopup("error", "Default actors cannot be deleted.");
        return;
      }
      if (message === "actor_not_found") {
        showActorPopup("error", "Actor not found.");
        return;
      }
      showActorPopup("error", "Failed to delete actor.");
    }
  };

  const handleSelectActorFromPanel = (actorId) => {
    setForm((prev) => ({ ...prev, actorId }));
    setActorsPanelOpen(false);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      {actorPopup.message ? (
        <div className={`actor-popup ${actorPopup.type === "success" ? "success" : "error"}`}>
          <span>{actorPopup.message}</span>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setActorPopup({ type: "", message: "" })}
          >
            Close
          </button>
        </div>
      ) : null}

      <header className="topbar">
        <div>
          <p className="eyebrow">UGC Prompt Studio</p>
          <h1>AI UGC Story Builder</h1>
          <p className="subhead">
            Build 3 prompt options, pick one, and generate 4 keyframes with continuity.
          </p>
        </div>

        <div className="project-meta">
          {projectId ? <span className="meta-chip">Project: {projectId.slice(0, 8)}...</span> : null}
          <button type="button" className="ghost-btn" onClick={handleOpenActorsPanel}>
            View Actors
          </button>
          <button type="button" className="ghost-btn" onClick={handleOpenHistory}>
            History
          </button>
          <button type="button" className="ghost-btn" onClick={handleResetProject}>
            New Project
          </button>
        </div>
      </header>

      {historyOpen ? (
        <div className="history-overlay" onClick={() => setHistoryOpen(false)}>
          <div className="history-panel" onClick={(e) => e.stopPropagation()}>
            <div className="history-panel-head">
              <h2>Project History</h2>
              <button type="button" className="ghost-btn" onClick={() => setHistoryOpen(false)}>
                Close
              </button>
            </div>

            {historyLoading ? (
              <p className="muted">Loading projects...</p>
            ) : historyList.length === 0 ? (
              <p className="muted">No projects found.</p>
            ) : (
              <div className="history-list">
                {historyList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`history-item ${p.id === projectId ? "active" : ""}`}
                    onClick={() => handleLoadProject(p.id)}
                  >
                    <div className="history-item-top">
                      <span className="history-item-name">{p.name}</span>
                      <span className="history-item-date">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="history-item-meta">
                      <span>Actor: {p.actor_id}</span>
                      <span>Lang: {p.language}</span>
                      {p.prompt_options_count > 0 ? (
                        <span className="history-badge">{p.prompt_options_count} prompts</span>
                      ) : null}
                      {p.keyframes_count > 0 ? (
                        <span className="history-badge">{p.keyframes_count} frames</span>
                      ) : null}
                      {p.selected_option_id ? (
                        <span className="history-badge selected">Option {p.selected_option_id}</span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {actorsPanelOpen ? (
        <div className="history-overlay" onClick={() => setActorsPanelOpen(false)}>
          <div className="history-panel actors-panel" onClick={(e) => e.stopPropagation()}>
            <div className="history-panel-head">
              <h2>All Actors</h2>
              <button type="button" className="ghost-btn" onClick={() => setActorsPanelOpen(false)}>
                Close
              </button>
            </div>

            <div className="create-actor-section">
              <h3>Create New Actor</h3>
              <div className="create-actor-form">
                <label>
                  Name
                  <input
                    value={newActorName}
                    onChange={(e) => setNewActorName(e.target.value)}
                    placeholder="Actor name"
                  />
                </label>
                <label>
                  Description
                  <input
                    value={newActorDesc}
                    onChange={(e) => setNewActorDesc(e.target.value)}
                    placeholder="Late 20s woman, cheerful energy..."
                  />
                </label>
                <label>
                  Face Image *
                  <input
                    ref={newActorFaceInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onClick={(e) => {
                      e.currentTarget.value = "";
                    }}
                    onChange={(e) => {
                      setNewActorFace(e.target.files?.[0] ?? null);
                      setCreateActorError("");
                    }}
                  />
                </label>
                <label>
                  Reference Image (optional)
                  <input
                    ref={newActorRefInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onClick={(e) => {
                      e.currentTarget.value = "";
                    }}
                    onChange={(e) => {
                      setNewActorRef(e.target.files?.[0] ?? null);
                      setCreateActorError("");
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleCreateActor}
                  disabled={createActorBusy}
                >
                  {createActorBusy ? "Creating..." : "Create Actor"}
                </button>
                {createActorError ? <p className="error">{createActorError}</p> : null}
              </div>
            </div>

            <hr className="panel-divider" />

            {actorsPanelLoading ? (
              <p className="muted">Loading actors...</p>
            ) : actorsPanelList.length === 0 ? (
              <p className="muted">No actors found.</p>
            ) : (
              <div className="actors-panel-list">
                {actorsPanelList.map((a) => (
                  <div key={a.id} className={`actors-panel-item ${form.actorId === a.id ? "active" : ""}`}>
                    <div className="actors-panel-thumb">
                      <img
                        src={resolveMediaUrl(a.image_url)}
                        alt={a.name}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                    <div className="actors-panel-info">
                      <span className="actors-panel-name">
                        {a.name}
                        {a.is_default ? <span className="default-badge">Default</span> : null}
                      </span>
                      <span className="actors-panel-desc">{a.short_description}</span>
                    </div>
                    <div className="actors-panel-actions">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => handleSelectActorFromPanel(a.id)}
                      >
                        Use
                      </button>
                      {!a.is_default ? (
                        <button
                          type="button"
                          className="ghost-btn danger-text"
                          onClick={() => handleDeleteActor(a.id)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <section className="stage actors-stage">
        <div className="stage-head">
          <h2>1. Select Actor</h2>
          <p>Pick one AI influencer or <button type="button" className="link-btn" onClick={handleOpenActorsPanel}>create your own</button>.</p>
        </div>

        {actorsLoading ? <p className="muted">Loading actor catalog...</p> : null}
        {actorsError ? <p className="error">{actorsError}</p> : null}

        <div className="actor-grid">
          {actors.map((actor) => (
            <ActorCard
              key={actor.id}
              actor={actor}
              selected={form.actorId === actor.id}
              onSelect={(actorId) => setForm((prev) => ({ ...prev, actorId }))}
            />
          ))}
        </div>
      </section>

      <section className="stage outputs-stage">
        <div className="stage-head">
          <h2>2. Prompt Options</h2>
          <p>Review options, copy text, and lock your chosen script.</p>
        </div>

        <div className="prompt-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={handleRegeneratePrompts}
            disabled={!projectId || !!busyAction}
          >
            Regenerate Prompts
          </button>
        </div>

        {hasPromptOptions ? (
          <div className="prompt-grid">
            {promptOptions.map((option) => {
              const selected = selectedOptionId === option.option_id;
              return (
                <article className={`prompt-card ${selected ? "selected" : ""}`} key={option.option_id}>
                  <div className="prompt-card-head">
                    <h3>
                      Option {option.option_id}: {option.title}
                    </h3>
                    <div className="prompt-head-actions">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => handleCopyOption(option)}
                        disabled={!!busyAction}
                      >
                        {copiedOptionId === option.option_id ? "Copied" : "Copy"}
                      </button>
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => handleSelectOption(option.option_id)}
                        disabled={!!busyAction}
                      >
                        {selected ? "Selected" : "Use This Prompt"}
                      </button>
                    </div>
                  </div>

                  <ol className="scene-list">
                    {normalizeArray(option.ad_prompt?.scenes).map((scene) => (
                      <li key={`${option.option_id}-${scene.scene_id}`}>
                        <p>
                          <strong>
                            Scene {scene.scene_id} - {scene.objective}
                          </strong>
                        </p>
                        <p>
                          <span className="label">Dialogue:</span> {scene.dialogue}
                        </p>
                        <p>
                          <span className="label">Actions:</span> {scene.actions}
                        </p>
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">No prompt options yet. Use the composer below to generate.</p>
        )}
      </section>

      <section className="stage frame-stage">
        <div className="stage-head">
          <h2>3. Keyframes</h2>
          <p>Generate 4 frames from selected option and download each image.</p>
        </div>

        <div className="frame-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={() => handleGenerateKeyframes("generate-keyframes")}
            disabled={!projectId || !selectedOptionId || !!busyAction}
          >
            Generate Keyframes
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => handleGenerateKeyframes("regenerate-keyframes")}
            disabled={!projectId || !selectedOptionId || !!busyAction}
          >
            Regenerate Keyframes
          </button>
          <a
            href={canExport ? `${API_BASE_URL}/v1/projects/${projectId}/export` : "#"}
            className={`export-btn ${canExport ? "" : "disabled"}`}
            onClick={(event) => {
              if (!canExport) {
                event.preventDefault();
              }
            }}
          >
            Export ZIP
          </a>
        </div>

        {hasKeyframes ? (
          <div className="frame-grid">
            {keyframes.map((frame) => (
              <article className="frame-card" key={frame.scene_id}>
                <div className="frame-head">
                  <h3>Scene {frame.scene_id}</h3>
                  <a href={frame.frame_url} className="ghost-btn" download>
                    Download
                  </a>
                </div>
                <img src={frame.frame_url} alt={`Scene ${frame.scene_id}`} loading="lazy" />
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No keyframes yet. Select a prompt and generate.</p>
        )}
      </section>

      <footer className="composer-shell">
        <div className="composer">
          <div className="composer-head">
            <h2>Prompt Composer</h2>
            <p>Fixed bottom chatbox style intake for actor + idea + product image.</p>
          </div>

          <div className="composer-grid">
            <label>
              Language
              <input
                value={form.language}
                onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))}
                placeholder="hinglish"
              />
            </label>

            <label>
              Product Name
              <input
                value={form.productName}
                onChange={(event) => setForm((prev) => ({ ...prev, productName: event.target.value }))}
                placeholder="Glow Cup"
              />
            </label>

            <label className="wide">
              Product Features (comma separated)
              <input
                value={form.productFeatures}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    productFeatures: event.target.value,
                  }))
                }
                placeholder="spill proof, insulated steel"
              />
            </label>

            <label className="wide">
              Idea Prompt
              <textarea
                rows={2}
                value={form.userPrompt}
                onChange={(event) => setForm((prev) => ({ ...prev, userPrompt: event.target.value }))}
                placeholder="Actor holding product on sofa with warm light..."
              />
            </label>

            <label>
              Call to Action (CTA)
              <input
                value={form.cta}
                onChange={(event) => setForm((prev) => ({ ...prev, cta: event.target.value }))}
                placeholder="Try it today!"
              />
            </label>

            <label className="wide">
              Product Image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setProductImageFile(file);
                }}
              />
            </label>
          </div>

          {productImagePreview ? (
            <div className="preview-line">
              <img src={productImagePreview} alt="Uploaded preview" />
              <span>{productImageFile?.name}</span>
            </div>
          ) : project?.product_image_url ? (
            <div className="preview-line">
              <img src={project.product_image_url} alt="Existing product" />
              <span>Using existing product image from project.</span>
            </div>
          ) : null}

          <div className="composer-actions">
            <button type="button" className="primary-btn big" onClick={handleGeneratePrompts} disabled={!!busyAction}>
              Generate 3 Prompt Options
            </button>
            {latestJobLabel ? <span className="spinner-label">{latestJobLabel}</span> : null}
          </div>

          {statusMessage ? <p className="status">{statusMessage}</p> : null}
          {errorMessage ? <p className="error">{errorMessage}</p> : null}
        </div>
      </footer>
    </div>
  );
}
