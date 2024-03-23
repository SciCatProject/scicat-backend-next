import { JobsAuth } from "../types/jobs-auth.enum";


// We use this to validate the Json schema of the provided configuration
export const JobConfigSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      jobType: { type: "string" },
      configVersion: { type: "string" },
      create: {
        type: "object",
        properties: {
          auth: { type: "string", enum: Object.values(JobsAuth) },
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                actionType: { type: "string" },
              },
              required: ["actionType"],
              additionalProperties: true
            }
          }
        },
        additionalProperties: true
      },
      update: {
        type: "object",
        properties: {
          auth: { type: "string", enum: Object.values(JobsAuth) },
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                actionType: { type: "string" },
              },
              required: ["actionType"],
              additionalProperties: true
            }
          }
        },
        additionalProperties: true
      },
    },
    required: ["jobType", "configVersion"],
    additionalProperties: true
  }
};
