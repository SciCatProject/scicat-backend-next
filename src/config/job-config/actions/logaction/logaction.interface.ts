export const actionType = "log";

export interface LogJobActionOptions {
  actionType: typeof actionType;
  init?: string;
  validate?: string;
  perform?: string;
}

/**
 * Type guard for LogJobActionOptions
 */
export function isLogJobActionOptions(
  options: unknown,
): options is LogJobActionOptions {
  if (typeof options !== "object" || options === null) {
    return false;
  }

  const opts = options as Record<string, unknown>;
  const allowedKeys = ["actionType", "init", "validate", "perform"];
  const optionKeys = Object.keys(opts);
  if (optionKeys.some((key) => !allowedKeys.includes(key))) {
    return false;
  }

  return (
    opts.actionType === actionType &&
    (opts.init === undefined || typeof opts.init === "string") &&
    (opts.validate === undefined || typeof opts.validate === "string") &&
    (opts.perform === undefined || typeof opts.perform === "string")
  );
}
