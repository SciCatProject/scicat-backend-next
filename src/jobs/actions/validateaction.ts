/**
 * Validates job DTOs at runtime
 *
 * This allows validation of untyped portions of the request body to be configured
 * in the jobconfig file.
 *
 * Example config:
 * <pre>{
 *   "actionType": "validate",
 *   "required": ["jobParms.datasetIds"]
 * }</pre>
 *
 * Each element of the "required" array is a JSONPath expression that must be present in
 * the request body.
 */
import {
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { JobAction, JobDto } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";
import { JSONPath } from "jsonpath-plus";

export class ValidateAction<T extends JobDto> implements JobAction<T> {
  public static readonly actionType = "validate";
  private required: string[];

  getActionType(): string {
    return ValidateAction.actionType;
  }

  async validate(dto: T) {
    for (const path of this.required) {
      try {
        const result = JSONPath({ path: path, json: dto });
        if (result !== null && result?.length > 0) {
          continue;
        }
      } catch (e) {
        Logger.error(e);
      }

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `Invalid request. Requires '${path}'`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Does nothing (validate only)
   * @param job Ignored
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async performJob(job: JobClass) {}

  constructor(data: Record<string, unknown>) {
    if (!("required" in data)) {
      throw new NotFoundException(
        `Missing connection parameter in 'validate' action: 'required'`,
      );
    }
    this.required = data["required"] as string[];
  }
}
