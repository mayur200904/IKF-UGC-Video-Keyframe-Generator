import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const ACTORS_SEED = [
  {
    id: "actor_01",
    name: "Priya",
    short_description: "Cheerful late-20s woman with vibrant, talkative energy.",
    image_url: "/storage/actors/actor_01.jpg",
    reference_image_url: "/storage/actors/actor_01_reference.jpg",
    is_default: true,
  },
  {
    id: "actor_02",
    name: "Anjali",
    short_description: "Late-40s brand enthusiast with warm, experienced delivery.",
    image_url: "/storage/actors/actor_02.jpg",
    reference_image_url: "/storage/actors/actor_02_reference.jpg",
    is_default: true,
  },
  {
    id: "actor_03",
    name: "Kavita",
    short_description: "Late-40s woman in traditional saree, authentic and relatable.",
    image_url: "/storage/actors/actor_03.jpg",
    reference_image_url: "/storage/actors/actor_03_reference.jpg",
    is_default: true,
  },
  {
    id: "actor_04",
    name: "Arjun",
    short_description: "Expressive late-20s man, charming and magnetic presence.",
    image_url: "/storage/actors/actor_04.jpg",
    reference_image_url: "/storage/actors/actor_04_reference.jpg",
    is_default: true,
  },
  {
    id: "actor_05",
    name: "Ramesh",
    short_description: "Experienced early-50s uncle with trustworthy, authoritative voice.",
    image_url: "/storage/actors/actor_05.jpg",
    reference_image_url: "/storage/actors/actor_05_reference.jpg",
    is_default: true,
  },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

export class FileStore {
  constructor({ dataDir, uploadsDir, keyframesDir, exportsDir }) {
    this.dataDir = dataDir;
    this.uploadsDir = uploadsDir;
    this.keyframesDir = keyframesDir;
    this.exportsDir = exportsDir;

    ensureDir(dataDir);
    ensureDir(uploadsDir);
    ensureDir(keyframesDir);
    ensureDir(exportsDir);

    this.actorsFile = path.join(dataDir, "actors.json");
    this.projectsFile = path.join(dataDir, "projects.json");
    this.jobsFile = path.join(dataDir, "jobs.json");

    // Merge seed actors with any user-created custom actors
    const existing = readJson(this.actorsFile, []);
    const customActors = existing.filter((a) => !a.is_default);
    writeJson(this.actorsFile, [...ACTORS_SEED, ...customActors]);
    if (!fs.existsSync(this.projectsFile)) {
      writeJson(this.projectsFile, []);
    }
    if (!fs.existsSync(this.jobsFile)) {
      writeJson(this.jobsFile, []);
    }

    this.projectWriteChain = Promise.resolve();
    this.jobWriteChain = Promise.resolve();
  }

  async init() {
    return true;
  }

  async listActors() {
    return readJson(this.actorsFile, ACTORS_SEED);
  }

  async getActor(actorId) {
    const actors = await this.listActors();
    return actors.find((a) => a.id === actorId) ?? null;
  }

  async createActor({ id, name, short_description, image_url, reference_image_url }) {
    const actors = await this.listActors();
    const now = new Date().toISOString();
    const actor = {
      id,
      name,
      short_description,
      image_url,
      reference_image_url: reference_image_url ?? null,
      is_default: false,
      created_at: now,
      updated_at: now,
    };
    actors.push(actor);
    writeJson(this.actorsFile, actors);
    return actor;
  }

  async deleteActor(actorId) {
    const actors = await this.listActors();
    const actor = actors.find((a) => a.id === actorId);
    if (!actor) return false;
    if (actor.is_default) return false;
    const filtered = actors.filter((a) => a.id !== actorId);
    writeJson(this.actorsFile, filtered);
    return true;
  }

  async recentActorIds(limit = 5) {
    const projects = await this.listProjects();
    const sorted = [...projects].sort(
      (a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime(),
    );
    const seen = new Set();
    const ids = [];
    for (const p of sorted) {
      if (p.actor_id && !seen.has(p.actor_id)) {
        seen.add(p.actor_id);
        ids.push(p.actor_id);
        if (ids.length >= limit) break;
      }
    }
    return ids;
  }

  async actorExists(actorId) {
    const actors = await this.listActors();
    return actors.some((actor) => actor.id === actorId);
  }

  async listProjects() {
    return readJson(this.projectsFile, []);
  }

  async saveProjects(projects) {
    writeJson(this.projectsFile, projects);
  }

  async withProjectWriteLock(action) {
    const run = async () => action();
    const result = this.projectWriteChain.then(run, run);
    this.projectWriteChain = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async createProject({ name, actor_id, language }) {
    return this.withProjectWriteLock(async () => {
      const now = new Date().toISOString();
      const project = {
        id: randomUUID(),
        name,
        actor_id,
        language,
        product_image_path: null,
        product_image_url: null,
        brief: null,
        prompt_options: [],
        selected_option_id: null,
        keyframes: [],
        scene_plan: [],
        created_at: now,
        updated_at: now,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      const projects = await this.listProjects();
      projects.push(project);
      await this.saveProjects(projects);
      return project;
    });
  }

  async getProject(projectId) {
    const projects = await this.listProjects();
    return projects.find((project) => project.id === projectId) ?? null;
  }

  async updateProject(projectId, updater) {
    return this.withProjectWriteLock(async () => {
      const projects = await this.listProjects();
      const idx = projects.findIndex((project) => project.id === projectId);
      if (idx === -1) {
        return null;
      }

      const next = updater({ ...projects[idx] });
      next.updated_at = new Date().toISOString();
      projects[idx] = next;
      await this.saveProjects(projects);
      return next;
    });
  }

  async listJobs() {
    return readJson(this.jobsFile, []);
  }

  async saveJobs(jobs) {
    writeJson(this.jobsFile, jobs);
  }

  async withJobWriteLock(action) {
    const run = async () => action();
    const result = this.jobWriteChain.then(run, run);
    this.jobWriteChain = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async createJob({ project_id, type, idempotency_key = null }) {
    return this.withJobWriteLock(async () => {
      const now = new Date().toISOString();
      const job = {
        id: randomUUID(),
        project_id,
        type,
        idempotency_key,
        status: "queued",
        error: null,
        result: null,
        created_at: now,
        updated_at: now,
        started_at: null,
        completed_at: null,
      };
      const jobs = await this.listJobs();
      jobs.push(job);
      await this.saveJobs(jobs);
      return job;
    });
  }

  async getJob(jobId) {
    const jobs = await this.listJobs();
    return jobs.find((job) => job.id === jobId) ?? null;
  }

  async findJobByIdempotencyKey({ project_id, type, idempotency_key }) {
    if (!idempotency_key) {
      return null;
    }
    const jobs = await this.listJobs();
    const matches = jobs.filter(
      (job) =>
        job.project_id === project_id && job.type === type && job.idempotency_key === idempotency_key,
    );
    matches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return matches[0] ?? null;
  }

  async updateJob(jobId, updater) {
    return this.withJobWriteLock(async () => {
      const jobs = await this.listJobs();
      const idx = jobs.findIndex((job) => job.id === jobId);
      if (idx === -1) {
        return null;
      }

      const next = updater({ ...jobs[idx] });
      next.updated_at = new Date().toISOString();
      jobs[idx] = next;
      await this.saveJobs(jobs);
      return next;
    });
  }
}
