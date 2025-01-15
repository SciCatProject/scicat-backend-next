import { JobActionOptions } from "../../jobconfig.interface";

export const actionType = "validate";

export interface ValidateJobActionOptions extends JobActionOptions {
  actionType: typeof actionType;
  request: Record<string, unknown>;
}

/**
 * Type guard for EmailJobActionOptions
 */
export function isValidateJobActionOptions(
  options: unknown,
): options is ValidateJobActionOptions {
  if (typeof options === "object" && options !== null) {
    const opts = options as ValidateJobActionOptions;
    return opts.actionType === actionType && typeof opts.request === "object";
  }
  return false;
}
