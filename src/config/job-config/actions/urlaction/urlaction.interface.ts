export const actionType = "url";

export interface URLJobActionOptions {
  actionType: typeof actionType;
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
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
    (opts.headers === undefined || isStringRecord(opts.headers))
  );
}

/**
 * Type guard for Record<string, string>
 * @param obj
 * @returns
 */
function isStringRecord(obj: unknown): obj is Record<string, string> {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const rec = obj as Record<string, string>;

  return Object.keys(rec).every(
    (key) => typeof key === "string" && typeof rec[key] === "string",
  );
}
