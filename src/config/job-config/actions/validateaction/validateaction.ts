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
 * received from the client (aka the DTO). It is registed for the `update` job
 * operation.
 *
 * ValidateCreateAction extends this with an additional `datasets` field, which works
 * identically to `request` but is applied to any datasets mentioned in
 * `jobParams.datasetList`. This is used for the `create` job operation.
 */
export class ValidateJobAction<T extends JobDto> implements JobAction<T> {
  private request: Record<string, ValidateFunction<T>>;

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

  protected compileSchemas(
    ajv: Ajv,
    schemasMap: Record<string, unknown>,
  ): Record<string, ValidateFunction<T>> {
    return Object.fromEntries(
      Object.entries(schemasMap).map(([path, schema]) => {
        if (typeof schema !== "object" || schema === null) {
          throw new Error("Schema must be a valid object.");
        }

        return [path, ajv.compile<T>(schema)];
      }),
    );
  }

  async validate(dto: T) {
    if (this.request) {
      // validate request body
      this.validateJson(dto, this.request);
    }
  }

  protected validateJson(
    json: JSONData,
    schemaMap: Record<string, ValidateFunction<T>>,
  ) {
    for (const [path, schema] of Object.entries(schemaMap)) {
      const result: JSONData[] = JSONPath<JSONData[]>({ path, json });
      if (result !== null && result?.length > 0) {
        result.forEach((entry) => {
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
 * See ValidateAction for more information about the form of `path` and `typecheck`.
 */
export class ValidateCreateJobAction extends ValidateJobAction<CreateJobDto> {
  private datasets?: Record<string, ValidateFunction<CreateJobDto>>;

  constructor(
    private datasetsService: DatasetsService,
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

  async validate(dto: CreateJobDto): Promise<void> {
    await super.validate(dto);
    if (!this.datasets) {
      return;
    }
    const datasets = await this.loadDatasets(dto);
    await Promise.all(
      datasets.map((dataset) => this.validateJson(dataset, this.datasets!)),
    );
  }

  private async loadDatasets(dto: CreateJobDto) {
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
    if (
      this.datasetsService === undefined ||
      this.datasetsService.findAll === undefined
    ) {
      Logger.error(
        `NestJS error. Dependency injection not working in ValidateCreateAction`,
      );
      throw makeHttpException(
        "NestJS error. Dependency injection not working in ValidateCreateAction.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const result = await this.datasetsService.findAll(filter);
    if (result.length != datasetIds.length) {
      Logger.error(
        `Unable to get a dataset for job (${JSON.stringify(datasetIds)})`,
      );
      throw makeHttpException(`Unable to get a dataset.`);
    }
    return result;
  }
}

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
