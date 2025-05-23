/**
 * Handlebar helper functions.
 *
 * Helpers should be registered in app.module.ts
 */
import { mapJobClassV4toV3 } from "src/jobs/job-v3-mappings";

/**
 * Convert json objects to HTML
 *
 * Supports:
 * - boolean, numbers, and strings without modification
 * - Arrays as <ul>
 * - Objects as key: value pairs separated by <br/>
 * - null as "Not specified"
 * @param json
 * @returns
 */
export const unwrapJSON = (json: unknown): string | number => {
  if (json === null) {
    return "Not specified";
  }
  if (typeof json === "boolean") {
    return json ? "Yes" : "No";
  }
  if (typeof json === "number" || typeof json === "string") {
    return json;
  }
  if (Array.isArray(json)) {
    return (
      "<ul style='padding-left: 1em'>" +
      json
        .map(
          (elem) =>
            "<li style='margin-bottom: 1em'>" + unwrapJSON(elem) + "</li>",
        )
        .join("") +
      "</ul>"
    );
  }
  if (typeof json === "object") {
    return Object.keys(json as Record<string, unknown>)
      .map((key) => {
        return (
          formatCamelCase(key) +
          ": " +
          unwrapJSON(json[key as keyof typeof json])
        );
      })
      .join("<br/>");
  }
  return "Not specified";
};

export const formatCamelCase = (camelCase: string): string => {
  const match = camelCase.replace(/([A-Z])/g, " $1");
  const words = match.charAt(0).toUpperCase() + match.slice(1);
  return words;
};

/**
 * Convert a handlebars context to a json string
 *
 * Useful for debugging, eg "{{{jsonify this}}}". Results contain newlines.
 * @param context Handlebars variable
 * @returns string
 */
export const jsonify = (context: unknown): string => {
  return JSON.stringify(context, null, 3);
};

/**
 * URL encode input
 * @param context Handlebars variable
 * @returns URL-encoded string
 */
export const urlencode = (context: string): string => {
  return encodeURIComponent(context);
};

/**
 * Base64 encode input
 * @param context Handlebars variable
 * @returns URL-encoded string
 */
export const base64enc = (context: string): string => {
  return btoa(context);
};

export const handlebarsHelpers = {
  unwrapJSON: unwrapJSON,
  keyToWord: formatCamelCase,
  eq: (a: unknown, b: unknown) => a === b,
  jsonify: jsonify,
  job_v3: mapJobClassV4toV3,
  urlencode: urlencode,
  base64enc: base64enc,
};
