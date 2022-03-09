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
