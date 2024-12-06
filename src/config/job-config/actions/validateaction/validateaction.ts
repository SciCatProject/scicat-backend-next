import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { JSONPath } from "jsonpath-plus";
import Ajv, { ValidateFunction } from "ajv";
import {
  actionType,
  ValidateJobActionOptions,
} from "./validateaction.interface";

/**
 * Validates the job DTO for the presence of required fields. Can also check types or
 * validate against a JSON Schema.
 *
 * ValidateAction is configured with a single parameter, `request`, which is checked
 * against the request body (aka the DTO). The config file will look like this:
 *
 * <pre>{
 *   "actionType": "validate",
 *   "request": {
 *     "path": typecheck,
 *     ...
 *   }
 * }</pre>
 *
 * Usually `path` will be a dot-delimited field in the DTO, eg. "jobParams.name".
 * Technically it is a JSONPath-Plus expression; see https://github.com/JSONPath-Plus/JSONPath.
 *
 * Here are some example typecheck expressions:
 * <pre>{
 *   "actionType": "validate",
 *   "request": {
 *     "name": { "type": "string"}, // match simple types
 *     "answers[*]": { "enum": ["yes","no"]}, // literal values (here applied to an array)
 *     "metadata": {"$ref": "https://json.schemastore.org/schema-org-thing.json"}, // JSON Schema
 *   }
 * }</pre>
 */
export class ValidateJobAction<T extends JobDto> implements JobAction<T> {
  private request: Record<string, ValidateFunction<T>>;

  getActionType(): string {
    return actionType;
  }

  constructor(options: ValidateJobActionOptions) {
    if (!("request" in options)) {
      throw new NotFoundException(
        `Missing connection parameter in 'validate' action: 'request'`,
      );
    }
    const request = options["request"] as Record<string, unknown>;

    const ajv = new Ajv({
      strictSchema: false,
      strictTypes: false,
    });
    this.request = Object.fromEntries(
      Object.entries(request).map(([path, schema]) => {
        if (typeof schema !== "object" || schema === null) {
          throw new Error("Schema must be a valid object.");
        }

        return [path, ajv.compile<T>(schema)];
      }),
    );
  }

  async validate(dto: T) {
    for (const [path, schema] of Object.entries(this.request)) {
      const result: unknown[] = JSONPath({ path: path, json: dto });
      if (result !== null && result?.length > 0) {
        result.forEach((entry) => {
          if (!schema(entry)) {
            throw new HttpException(
              {
                status: HttpStatus.BAD_REQUEST,
                message: `Invalid request. Invalid value for '${path}'`,
              },
              HttpStatus.BAD_REQUEST,
            );
          }
        });
      } else {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: `Invalid request. Requires '${path}'`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  /**
   * Does nothing (validate only)
   * @param job Ignored
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async performJob(job: JobClass) {}
}
