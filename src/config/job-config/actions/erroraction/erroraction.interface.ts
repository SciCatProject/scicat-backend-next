export const actionType = "error";

export interface ErrorJobActionOptions {
  actionType: typeof actionType;
  message: string;
  status?: number;
}

/**
 * Type guard for LogJobActionOptions
 */
export function isErrorJobActionOptions(
  options: unknown,
): options is ErrorJobActionOptions {
  if (typeof options !== "object" || options === null) {
    return false;
  }

  const opts = options as ErrorJobActionOptions;

  return (
    opts.actionType === actionType &&
    typeof opts.message === "string" &&
    (opts.status === undefined || typeof opts.status === "number")
  );
}
