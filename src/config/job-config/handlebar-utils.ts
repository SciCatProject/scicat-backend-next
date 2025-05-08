import * as hb from "handlebars";
import { JobTemplateContext } from "./jobconfig.interface";

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

export type TemplateJob = hb.TemplateDelegate<JobTemplateContext>;

/**
 * Standardizes compilation of handlebars templates
 *
 * This should be used by all actions rather than calling handlebars.compile directly.
 * @param input
 * @param options
 * @returns
 */
export function compileJobTemplate(
  input: unknown,
  options?: CompileOptions,
): TemplateJob {
  const template: TemplateJob = hb.compile<JobTemplateContext>(input, options);
  return (context: JobTemplateContext, options?: RuntimeOptions) => {
    return template(context, {
      ...jobTemplateOptions,
      ...options,
    });
  };
}
