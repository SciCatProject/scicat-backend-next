import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from "@nestjs/common";

/**
 * Validation pipe that ensures at least one of the resource ID fields
 * (datasetPids, proposalIds, sampleIds, instrumentIds) contains at least one non-empty element.
 * 
 * This pipe is used for API v4 endpoints to enforce the business rule that
 * PublishedData must be associated with at least one resource type.
 */
@Injectable()
export class AtLeastOneResourcePipe implements PipeTransform {
  /**
   * Transforms and validates the input value.
   * 
   * @param value - The DTO object containing resource ID fields
   * @returns The validated value if at least one ID field has elements
   * @throws BadRequestException if no valid ID fields are provided
   */
  transform(value: any) {
    // Handle various input scenarios by providing defaults for missing fields
    const datasetPids = value.datasetPids || [];
    const proposalIds = value.proposalIds || [];
    const sampleIds = value.sampleIds || [];
    const instrumentIds = value.instrumentIds || [];

    // Check if any array has at least one non-empty string element
    // This prevents arrays like ["", "", ""] from being considered valid
    const hasDatasets = datasetPids.length > 0 && datasetPids.some((id: string) => id.trim() !== "");
    const hasProposals = proposalIds.length > 0 && proposalIds.some((id: string) => id.trim() !== "");
    const hasSamples = sampleIds.length > 0 && sampleIds.some((id: string) => id.trim() !== "");
    const hasInstruments = instrumentIds.length > 0 && instrumentIds.some((id: string) => id.trim() !== "");

    // If at least one field has valid non-empty elements, allow the request
    if (hasDatasets || hasProposals || hasSamples || hasInstruments) {
      return value;
    }

    // Otherwise, throw a detailed error with helpful information
    throw new BadRequestException({
      message: "At least one of datasetPids, proposalIds, sampleIds, or instrumentIds must contain at least one non-empty element",
      code: "NO_RESOURCE_IDS_PROVIDED",
      requiredFields: ["datasetPids", "proposalIds", "sampleIds", "instrumentIds"],
      providedFields: Object.entries(value)
        .filter(([key, val]) => 
          ["datasetPids", "proposalIds", "sampleIds", "instrumentIds"].includes(key) &&
          val?.length > 0
        )
        .map(([key]) => key),
      documentation: "Please provide at least one non-empty array of resource IDs. Each ID must be a non-empty string.",
    });
  }
}
