// We use this to validate the Json schema of the provided configuration

export const JobConfigSchema = {
  type: "object",
  properties: {
    configVersion: { type: "string" },
    jobs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          jobType: { type: "string" },
          create: {
            type: "object",
            properties: {
              auth: { type: "string" },
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    actionType: { type: "string" },
                  },
                  required: ["actionType"],
                  additionalProperties: true,
                },
              },
            },
            additionalProperties: true,
          },
          update: {
            type: "object",
            properties: {
              auth: { type: "string" },
              actions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    actionType: { type: "string" },
                  },
                  required: ["actionType"],
                  additionalProperties: true,
                },
              },
            },
            additionalProperties: true,
          },
        },
        required: ["jobType"],
        additionalProperties: true,
      },
    },
  },
  required: ["configVersion", "jobs"],
  additionalProperties: true,
};
