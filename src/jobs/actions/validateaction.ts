import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { JobAction, JobDto } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";
import { JSONPath, JSONPathOptions } from "jsonpath-plus";
import Ajv, { ValidateFunction } from "ajv";
import { JobParams } from "../types/job-types.enum";
import { CreateJobDto } from "../dto/create-job.dto";
import { DatasetsService } from "src/datasets/datasets.service";
import { DatasetListDto } from "../dto/dataset-list.dto";

type JSONData = JSONPathOptions["json"];

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
export class ValidateAction<T extends JobDto> implements JobAction<T> {
  public static readonly actionType = "validate";
  protected request?: Record<string, ValidateFunction<T>>;

  getActionType(): string {
    return ValidateAction.actionType;
  }

  constructor(data: Record<string, unknown>, ajv?: Ajv) {
    ajv =
      ajv ||
      new Ajv({
        strictSchema: false,
        strictTypes: false,
      });
    if ("request" in data) {
      const request = data["request"] as Record<string, unknown>;
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

@Injectable()
export class ValidateCreateAction extends ValidateAction<CreateJobDto> {
  @Inject(DatasetsService) private datasetsService: DatasetsService;
  private datasets?: Record<string, ValidateFunction<CreateJobDto>>;

  constructor(data: Record<string, unknown>, ajv?: Ajv) {
    ajv =
      ajv ||
      new Ajv({
        strictSchema: false,
        strictTypes: false,
      });
    super(data, ajv);
    if ("datasets" in data) {
      const datasets = data["datasets"] as Record<string, unknown>;
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

function makeHttpException(message: string): HttpException {
  return new HttpException(
    {
      status: HttpStatus.BAD_REQUEST,
      message: message,
    },
    HttpStatus.BAD_REQUEST,
  );
}
