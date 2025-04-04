export const actionType = "log";

export interface LogJobActionOptions {
  actionType: typeof actionType;
  init?: string;
  validate?: string;
  performJob?: string;
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

  const opts = options as LogJobActionOptions;

  return (
    opts.actionType === actionType &&
    (opts.init === undefined || typeof opts.init === "string") &&
    (opts.validate === undefined || typeof opts.validate === "string") &&
    (opts.performJob === undefined || typeof opts.performJob === "string")
  );
}
