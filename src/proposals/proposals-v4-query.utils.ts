import { BadRequestException } from "@nestjs/common";

/**
 * Parse JSON supplied through a Proposal V4 query parameter.
 * Query-string parsing errors are client errors and must not escape as 500s.
 */
export function parseProposalV4Json<T>(
  value: string | undefined,
  fallback: T,
  parameterName: string,
): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    throw new BadRequestException(
      `Invalid JSON supplied for query parameter '${parameterName}'`,
    );
  }
}
