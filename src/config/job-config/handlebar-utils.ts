import * as hb from "handlebars";
import { JobClass } from "src/jobs/schemas/job.schema";

const jobTemplateOptions = {
  allowedProtoProperties: {
    id: true,
    type: true,
    statusCode: true,
    statusMessage: true,
    createdBy: true,
    jobParams: true,
    contactEmail: true,
  },
  allowProtoPropertiesByDefault: false, // limit accessible fields for security
};

export type TemplateJob = hb.TemplateDelegate<JobClass>;

export function compileJob(
  input: unknown,
  options?: CompileOptions,
): TemplateJob {
  const template: TemplateJob = hb.compile<JobClass>(input, options);
  return (context: JobClass, options?: RuntimeOptions) => {
    return template(context, {
      ...jobTemplateOptions,
      ...options,
    });
  };
}
