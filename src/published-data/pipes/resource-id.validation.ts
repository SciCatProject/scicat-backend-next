export interface ResourceIdFields {
  datasetPids?: unknown;
  proposalIds?: unknown;
  sampleIds?: unknown;
  instrumentIds?: unknown;
}

export const RESOURCE_ID_FIELD_NAMES = [
  "datasetPids",
  "proposalIds",
  "sampleIds",
  "instrumentIds",
] as const;

export function normalizeResourceIdArrays<T extends ResourceIdFields>(
  value: T,
): T {
  const normalized = { ...value };

  for (const field of RESOURCE_ID_FIELD_NAMES) {
    if (normalized[field] === null) {
      normalized[field] = [];
    }
  }

  return normalized;
}

export function hasAtLeastOneResourceId(value: ResourceIdFields): boolean {
  return RESOURCE_ID_FIELD_NAMES.some((field) => {
    const ids = value?.[field];
    return (
      Array.isArray(ids) &&
      ids.some((id) => typeof id === "string" && id.trim() !== "")
    );
  });
}

export function providedResourceIdFields(value: ResourceIdFields): string[] {
  return RESOURCE_ID_FIELD_NAMES.filter((field) => {
    const ids = value?.[field];
    return Array.isArray(ids) && ids.length > 0;
  });
}
