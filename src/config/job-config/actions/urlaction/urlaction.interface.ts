import { isStringRecord } from "src/common/utils";
export const actionType = "url";

export interface URLJobActionOptions {
  actionType: typeof actionType;
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  ignoreErrors?: boolean;
}

/**
 * Type guard for EmailJobActionOptions
 */
export function isURLJobActionOptions(
  options: unknown,
): options is URLJobActionOptions {
  if (typeof options !== "object" || options === null) {
    return false;
  }
  const opts = options as URLJobActionOptions;

  return (
    opts.actionType === actionType &&
    typeof opts.url === "string" &&
    (opts.method === undefined ||
      ["GET", "POST", "PUT", "DELETE"].includes(opts.method)) &&
    (opts.headers === undefined || isStringRecord(opts.headers)) &&
    (opts.ignoreErrors === undefined || typeof opts.ignoreErrors === "boolean")
  );
}
