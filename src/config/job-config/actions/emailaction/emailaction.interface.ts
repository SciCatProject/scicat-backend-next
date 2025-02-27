import { JobActionOptions } from "../../jobconfig.interface";

export const actionType = "email";

export interface EmailJobActionOptions extends JobActionOptions {
  actionType: typeof actionType;
  to: string;
  from?: string;
  subject: string;
  bodyTemplateFile: string;
}

/**
 * Type guard for EmailJobActionOptions
 */
export function isEmailJobActionOptions(
  options: unknown,
): options is EmailJobActionOptions {
  if (typeof options !== "object" || options === null) {
    return false;
  }

  const opts = options as EmailJobActionOptions;
  return (
    opts.actionType === actionType &&
    typeof opts.to === "string" &&
    (opts.from === undefined || typeof opts.from === "string") &&
    typeof opts.subject === "string" &&
    typeof opts.bodyTemplateFile === "string"
  );
}
