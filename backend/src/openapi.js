import { config } from "./config.js";

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "UGC Prompt Studio API",
    version: "0.2.0",
    description:
      "MVP backend for prompt-first UGC workflow: generate 3 full-ad prompt options, select one, then generate 4 keyframes.",
  },
  servers: [
    {
      url: config.baseUrl,
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Actors" },
    { name: "Projects" },
    { name: "Prompts" },
    { name: "Keyframes" },
    { name: "Jobs" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: { description: "Service is healthy" },
        },
      },
    },
    "/v1/actors": {
      get: {
        tags: ["Actors"],
        summary: "List fixed actors",
        responses: {
          200: { description: "Actor list" },
        },
      },
    },
    "/v1/projects": {
      post: {
        tags: ["Projects"],
        summary: "Create project",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "actor_id", "language"],
                properties: {
                  name: { type: "string" },
                  actor_id: { type: "string", example: "actor_01" },
                  language: { type: "string", example: "en" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Project created" },
        },
      },
    },
    "/v1/projects/{projectId}": {
      get: {
        tags: ["Projects"],
        summary: "Get project",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Project details" },
          404: { description: "Project not found" },
        },
      },
    },
    "/v1/projects/{projectId}/product-image": {
      post: {
        tags: ["Projects"],
        summary: "Upload product image",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["product_image"],
                properties: {
                  product_image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Product image uploaded" },
        },
      },
    },
    "/v1/projects/{projectId}/brief": {
      post: {
        tags: ["Projects"],
        summary: "Save structured brief",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["user_prompt", "product_name", "product_features", "cta"],
                properties: {
                  user_prompt: { type: "string" },
                  product_name: { type: "string" },
                  product_features: {
                    oneOf: [
                      { type: "string" },
                      {
                        type: "array",
                        items: { type: "string" },
                      },
                    ],
                  },
                  cta: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Brief saved" },
        },
      },
    },
    "/v1/projects/{projectId}/generate-prompt-options": {
      post: {
        tags: ["Prompts"],
        summary: "Generate 3 full-ad prompt options",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          202: { description: "Prompt generation job accepted" },
        },
      },
    },
    "/v1/projects/{projectId}/prompt-options": {
      get: {
        tags: ["Prompts"],
        summary: "Fetch generated prompt options",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Prompt options returned" },
        },
      },
    },
    "/v1/projects/{projectId}/select-prompt-option": {
      post: {
        tags: ["Prompts"],
        summary: "Select one prompt option (A/B/C)",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["selected_option_id"],
                properties: {
                  selected_option_id: {
                    type: "string",
                    enum: ["A", "B", "C"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Prompt option selected" },
        },
      },
    },
    "/v1/projects/{projectId}/generate-keyframes": {
      post: {
        tags: ["Keyframes"],
        summary: "Generate exactly 4 keyframes from selected prompt",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          202: { description: "Keyframe generation job accepted" },
        },
      },
    },
    "/v1/projects/{projectId}/keyframes": {
      get: {
        tags: ["Keyframes"],
        summary: "Fetch generated keyframes",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Keyframes returned" },
        },
      },
    },
    "/v1/jobs/{jobId}": {
      get: {
        tags: ["Jobs"],
        summary: "Get job status",
        parameters: [
          {
            in: "path",
            name: "jobId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Job status returned" },
          404: { description: "Job not found" },
        },
      },
    },
  },
};

