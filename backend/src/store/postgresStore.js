import { randomUUID } from "node:crypto";
import pg from "pg";
import { ACTORS_SEED } from "./fileStore.js";
import { POSTGRES_SCHEMA_SQL } from "./postgresSchema.js";

const { Pool } = pg;

function toIso(value) {
  if (!value) {
    return value;
  }
  return value instanceof Date ? value.toISOString() : value;
}

function toJsonbParam(value) {
  if (value == null) {
    return null;
  }
  return JSON.stringify(value);
}

function normalizeJsonArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapProjectRow(row) {
  if (!row) {
    return null;
  }
  return {
    ...row,
    brief: row.brief ?? null,
    prompt_options: normalizeJsonArray(row.prompt_options),
    keyframes: normalizeJsonArray(row.keyframes),
    scene_plan: normalizeJsonArray(row.scene_plan),
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    expires_at: toIso(row.expires_at),
  };
}

function mapJobRow(row) {
  if (!row) {
    return null;
  }
  return {
    ...row,
    result: row.result ?? null,
    idempotency_key: row.idempotency_key ?? null,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    started_at: toIso(row.started_at),
    completed_at: toIso(row.completed_at),
  };
}

export class PostgresStore {
  constructor({ databaseUrl, sslEnabled, sslRejectUnauthorized }) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized } : false,
    });
  }

  async init() {
    await this.pool.query(POSTGRES_SCHEMA_SQL);
    await this.seedActors();
  }

  async seedActors() {
    for (const actor of ACTORS_SEED) {
      await this.pool.query(
        `
          INSERT INTO actors (id, name, short_description, image_url, reference_image_url, is_default)
          VALUES ($1, $2, $3, $4, $5, TRUE)
          ON CONFLICT (id) DO UPDATE
          SET
            name = EXCLUDED.name,
            short_description = EXCLUDED.short_description,
            is_default = TRUE,
            updated_at = NOW()
        `,
        [actor.id, actor.name, actor.short_description, actor.image_url, actor.reference_image_url ?? null],
      );
    }
  }

  async listActors() {
    const result = await this.pool.query(
      `SELECT id, name, short_description, image_url, reference_image_url, is_default, created_at FROM actors ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  async getActor(actorId) {
    const result = await this.pool.query(
      `SELECT id, name, short_description, image_url, reference_image_url, is_default FROM actors WHERE id = $1 LIMIT 1`,
      [actorId],
    );
    return result.rows[0] ?? null;
  }

  async createActor({ id, name, short_description, image_url, reference_image_url }) {
    const result = await this.pool.query(
      `
        INSERT INTO actors (id, name, short_description, image_url, reference_image_url, is_default)
        VALUES ($1, $2, $3, $4, $5, FALSE)
        RETURNING *
      `,
      [id, name, short_description, image_url, reference_image_url ?? null],
    );
    return result.rows[0];
  }

  async deleteActor(actorId) {
    const result = await this.pool.query(
      `DELETE FROM actors WHERE id = $1 AND is_default = FALSE RETURNING id`,
      [actorId],
    );
    return result.rowCount > 0;
  }

  async recentActorIds(limit = 5) {
    const result = await this.pool.query(
      `SELECT DISTINCT ON (actor_id) actor_id, MAX(updated_at) AS last_used
       FROM projects GROUP BY actor_id ORDER BY actor_id, last_used DESC LIMIT $1`,
      [limit],
    );
    // re-sort by last_used desc
    const rows = result.rows.sort((a, b) => new Date(b.last_used) - new Date(a.last_used));
    return rows.map((r) => r.actor_id);
  }

  async actorExists(actorId) {
    const result = await this.pool.query(`SELECT 1 FROM actors WHERE id = $1 LIMIT 1`, [actorId]);
    return result.rowCount > 0;
  }

  async listProjects() {
    const result = await this.pool.query(`SELECT * FROM projects ORDER BY created_at DESC`);
    return result.rows.map((row) => mapProjectRow(row));
  }

  async createProject({ name, actor_id, language }) {
    const projectId = randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const result = await this.pool.query(
      `
        INSERT INTO projects (
          id,
          name,
          actor_id,
          language,
          brief,
          prompt_options,
          selected_option_id,
          keyframes,
          scene_plan,
          created_at,
          updated_at,
          expires_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8::jsonb, $9::jsonb, $10, $11, $12)
        RETURNING *
      `,
      [
        projectId,
        name,
        actor_id,
        language,
        toJsonbParam(null),
        toJsonbParam([]),
        null,
        toJsonbParam([]),
        toJsonbParam([]),
        now,
        now,
        expiresAt,
      ],
    );

    return mapProjectRow(result.rows[0]);
  }

  async getProject(projectId) {
    const result = await this.pool.query(`SELECT * FROM projects WHERE id = $1 LIMIT 1`, [projectId]);
    return mapProjectRow(result.rows[0]);
  }

  async updateProject(projectId, updater) {
    const current = await this.getProject(projectId);
    if (!current) {
      return null;
    }

    const next = updater({ ...current });
    next.updated_at = new Date().toISOString();

    const result = await this.pool.query(
      `
        UPDATE projects
        SET
          name = $2,
          actor_id = $3,
          language = $4,
          product_image_path = $5,
          product_image_url = $6,
          brief = $7::jsonb,
          prompt_options = $8::jsonb,
          selected_option_id = $9,
          keyframes = $10::jsonb,
          scene_plan = $11::jsonb,
          updated_at = $12,
          expires_at = $13
        WHERE id = $1
        RETURNING *
      `,
      [
        projectId,
        next.name,
        next.actor_id,
        next.language,
        next.product_image_path,
        next.product_image_url,
        toJsonbParam(next.brief),
        toJsonbParam(next.prompt_options ?? []),
        next.selected_option_id,
        toJsonbParam(next.keyframes ?? []),
        toJsonbParam(next.scene_plan ?? []),
        next.updated_at,
        next.expires_at,
      ],
    );

    return mapProjectRow(result.rows[0]);
  }

  async createJob({ project_id, type, idempotency_key = null }) {
    const jobId = randomUUID();
    const now = new Date().toISOString();

    const result = await this.pool.query(
      `
        INSERT INTO jobs (
          id,
          project_id,
          type,
          idempotency_key,
          status,
          error,
          result,
          created_at,
          updated_at,
          started_at,
          completed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
        RETURNING *
      `,
      [
        jobId,
        project_id,
        type,
        idempotency_key,
        "queued",
        null,
        toJsonbParam(null),
        now,
        now,
        null,
        null,
      ],
    );

    return mapJobRow(result.rows[0]);
  }

  async getJob(jobId) {
    const result = await this.pool.query(`SELECT * FROM jobs WHERE id = $1 LIMIT 1`, [jobId]);
    return mapJobRow(result.rows[0]);
  }

  async findJobByIdempotencyKey({ project_id, type, idempotency_key }) {
    if (!idempotency_key) {
      return null;
    }
    const result = await this.pool.query(
      `
        SELECT *
        FROM jobs
        WHERE project_id = $1
          AND type = $2
          AND idempotency_key = $3
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [project_id, type, idempotency_key],
    );
    return mapJobRow(result.rows[0]);
  }

  async updateJob(jobId, updater) {
    const current = await this.getJob(jobId);
    if (!current) {
      return null;
    }

    const next = updater({ ...current });
    next.updated_at = new Date().toISOString();

    const result = await this.pool.query(
      `
        UPDATE jobs
        SET
          project_id = $2,
          type = $3,
          idempotency_key = $4,
          status = $5,
          error = $6,
          result = $7::jsonb,
          updated_at = $8,
          started_at = $9,
          completed_at = $10
        WHERE id = $1
        RETURNING *
      `,
      [
        jobId,
        next.project_id,
        next.type,
        next.idempotency_key,
        next.status,
        next.error,
        toJsonbParam(next.result),
        next.updated_at,
        next.started_at,
        next.completed_at,
      ],
    );

    return mapJobRow(result.rows[0]);
  }
}
