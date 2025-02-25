import { HttpException, HttpStatus, Logger } from "@nestjs/common";
import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { JSONPath, JSONPathOptions } from "jsonpath-plus";
import Ajv, { ValidateFunction } from "ajv";
import {
  actionType,
  ValidateCreateJobActionOptions,
  ValidateJobActionOptions,
} from "./validateaction.interface";
import { CreateJobDto } from "src/jobs/dto/create-job.dto";
import { DatasetsService } from "src/datasets/datasets.service";
import { JobParams } from "src/jobs/types/job-types.enum";
import { DatasetListDto } from "src/jobs/dto/dataset-list.dto";
import { ModuleRef } from "@nestjs/core";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
type JSONData = JSONPathOptions["json"];

/**
 * Validates the job for the presence of required fields. Can also check types or
 * validate against a JSON Schema.
 *
 * The config file for a validate action will look like this:
 *
 * <pre>
 * actionType: validate
 * request:
 *   path: typecheck
 * </pre>
 *
 * Usually `path` will be a dot-delimited field in the DTO, eg. "jobParams.name".
 * Technically it is a JSONPath-Plus expression; see
 * https://github.com/JSONPath-Plus/JSONPath.
 *
 * Here are some example typecheck expressions:
 * <pre>
 * actionType: validate
 * request:
 *   name:
 *     type: string
 *   answers[*]:
 *     enum: ["yes", "no" ]
 *   metadata:
 *     "$ref": https://json.schemastore.org/schema-org-thing.json
 * </pre>
 *
 * This base class includes only the `request` field, which validates the request body
 * received from the client (aka the DTO). It is intended for the `update` job
 * operation.
 *
 * ValidateCreateAction extends this with an additional `datasets` field, which works
 * identically to `request` but is applied to any datasets mentioned in
 * `jobParams.datasetList`. This is used for the `create` job operation.
 */
export class ValidateJobAction<T extends JobDto> implements JobAction<T> {
  private request: Record<string, ValidateFunction>;

  getActionType(): string {
    return actionType;
  }

  constructor(options: ValidateJobActionOptions, ajv?: Ajv) {
    ajv =
      ajv ||
      new Ajv({
        strictSchema: false,
        strictTypes: false,
      });
    if ("request" in options) {
      const request = options.request || {};
      this.request = this.compileSchemas(ajv, request);
    }
  }

  /**
   * Compiles JSON schemas from the config file into Ajv validators
   *
   * @param ajv Ajv instance
   * @param schemasMap An object mapping a JSON Path (as a string) to a JSON schema (an object)
   */
  protected compileSchemas(
    ajv: Ajv,
    schemasMap: Record<string, unknown>,
  ): Record<string, ValidateFunction> {
    return Object.fromEntries(
      Object.entries(schemasMap).map(([path, schema]) => {
        if (typeof schema !== "object" || schema === null) {
          throw new Error("Schema must be a valid object.");
        }

        return [path, ajv.compile(schema)];
      }),
    );
  }

  /**
   * Validate the current request
   * @param dto Job DTO
   */
  async validate(dto: T) {
    if (this.request) {
      // validate request body
      this.validateJson(dto, this.request);
    }
  }

  /**
   * Perform the actual validation.
   *
   * This should be called by `validate` with the correct data to be validated
   * @param json object to validate against (Job, Dataset, etc)
   * @param schemaMap An object mapping a JSON Path (as a string) to a JSON schema (an object)
   */
  protected validateJson(
    json: JSONData,
    schemaMap: Record<string, ValidateFunction>,
  ) {
    // Convert Documents to plain objects if needed
    json = toObject(json);

    for (const [path, schema] of Object.entries(schemaMap)) {
      // Compile the key to a JSONPath and apply it to the json data
      const result: JSONData[] = JSONPath<JSONData[]>({ path, json });
      if (result !== null && result?.length > 0) {
        result.forEach((entry) => {
          // check each result against the Ajv schema
          if (!schema(entry)) {
            throw makeHttpException(
              `Invalid request. Invalid value for '${path}'`,
            );
          }
        });
      } else {
        throw makeHttpException(`Invalid request. Requires '${path}'`);
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

/**
 * Validates a request to create a new job for the presence of required fields. Can
 * check types or validate against a JSON Schema.
 *
 * The config file for a validate action will look like this:
 *
 * <pre>
 * actionType: validate
 * request:
 *   path: typecheck
 * datasets:
 *   path: typecheck
 * </pre>
 *
 * The constraints in the 'datasets' section are applied to all datasets listed in the
 * `jobParams.datasetList` array. Since the dataset list needs to be set at job
 * creation, this form of the action is only applicable to the `CreateJobDto` and cannot
 * be included during an update operation.
 *
 * Invalid request constraints result in a 400 error, while invalid dataset constraints
 * return a 409 error.
 *
 * See ValidateAction for more information about the form of `path` and `typecheck`.
 */
export class ValidateCreateJobAction extends ValidateJobAction<CreateJobDto> {
  private datasets?: Record<string, ValidateFunction>;

  constructor(
    private moduleRef: ModuleRef,
    options: ValidateCreateJobActionOptions,
    ajv?: Ajv,
  ) {
    ajv =
      ajv ||
      new Ajv({
        strictSchema: false,
        strictTypes: false,
      });
    super(options, ajv);
    if ("datasets" in options) {
      const datasets = options.datasets || {};
      this.datasets = this.compileSchemas(ajv, datasets);
    }
  }

  /**
   * Validate the current request
   *
   * Validates the Job request and the datasets
   * @param dto Job DTO
   */
  async validate(dto: CreateJobDto): Promise<void> {
    // Validate this.requests
    await super.validate(dto);
    if (!this.datasets) {
      return;
    }
    // Validate this.datasets
    const datasets = await this.loadDatasets(dto);
    await Promise.all(
      datasets.map((dataset) => this.validateJson(dataset, this.datasets!)),
    );
  }

  /**
   * Loads any datasets mentioned in the jobParams from the database
   * @param dto Job DTO, used to get the DatasetList
   * @returns
   */
  private async loadDatasets(dto: CreateJobDto): Promise<DatasetClass[]> {
    // Require datasetList
    if (!(JobParams.DatasetList in dto.jobParams)) {
      throw makeHttpException(
        `'jobParams.${JobParams.DatasetList}' is required.`,
      );
    }
    const datasetList = dto.jobParams[
      JobParams.DatasetList
    ] as DatasetListDto[];
    const datasetIds = datasetList.map((x) => x.pid);

    // Load linked datasets
    const filter = {
      where: {
        pid: {
          $in: datasetIds,
        },
      },
    };

    const datasetsService = await this.moduleRef.resolve(
      DatasetsService,
      undefined,
      { strict: false },
    );

    if (
      datasetsService === undefined ||
      datasetsService.findAll === undefined
    ) {
      Logger.error(
        `Unable to resolve DatasetService. This indicates an unexpected server state.`,
      );
      throw makeHttpException(
        "Unable to resolve DatasetService. This indicates an unexpected server state.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const result = await datasetsService.findAll(filter);
    if (result.length != datasetIds.length) {
      Logger.error(
        `Unable to get a dataset for job (${JSON.stringify(datasetIds)})`,
      );
      throw makeHttpException(`Unable to get a dataset.`, HttpStatus.CONFLICT);
    }
    return result;
  }
}

// Could be moved to a util module if used elsewhere.
/**
 * Helper function to generate HttpExceptions
 */
function makeHttpException(message: string, status?: number): HttpException {
  status = status || HttpStatus.BAD_REQUEST;
  return new HttpException(
    {
      status: status,
      message: message,
    },
    status,
  );
}

/**
 * Interface to duck-type Mongoose Documents
 */
interface HasToObject<T> {
  toObject(): T;
}
function isHasToObject<T>(obj: unknown): obj is HasToObject<T> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "toObject" in obj &&
    typeof obj.toObject === "function"
  );
}

/**
 * Calls .toObject() on the object if it exists
 *
 * Mongoose Documents use a Proxy mechanism which hides property names from reflection.
 * Use this method to convert them to plain objects.
 * @param json Any class
 * @returns
 */
function toObject<T>(json: T | HasToObject<T>): T {
  if (isHasToObject(json)) {
    //json = JSON.parse(JSON.stringify(json));
    return json.toObject();
  }
  return json;
}
