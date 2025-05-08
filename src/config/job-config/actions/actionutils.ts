/**
 * Utility functions shared by several jobactions
 */
import { HttpStatus, Logger, NotFoundException } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { JSONPathOptions } from "jsonpath-plus";
import { makeHttpException } from "src/common/utils";
import { DatasetsService } from "src/datasets/datasets.service";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { CreateJobDto } from "src/jobs/dto/create-job.dto";
import { DatasetListDto } from "src/jobs/dto/dataset-list.dto";
import { JobParams } from "src/jobs/types/job-types.enum";
import { JobValidateContext } from "../jobconfig.interface";

export type JSONData = JSONPathOptions["json"];

/**
 * Interface to duck-type Mongoose Documents
 */
export interface HasToObject {
  toObject(): JSONData;
}
export function isHasToObject(obj: unknown): obj is HasToObject {
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
export function toObject(json: JSONData | HasToObject): JSONData {
  if (json !== null && isHasToObject(json)) {
    //json = JSON.parse(JSON.stringify(json));
    const t = json.toObject();
    return t;
  }
  return json;
}

/**
 * Load a list of datasets from the database
 * @param datasetList datasets to load. File lists are ignored
 * @param datasetsService service, usually injected by nestjs
 * @returns
 */

export async function loadDatasets(
  datasetsService: DatasetsService,
  context: JobValidateContext<CreateJobDto>,
): Promise<DatasetClass[]> {
  if (!context.datasets) {
    // Require datasetList
    if (!(JobParams.DatasetList in context.request.jobParams)) {
      throw makeHttpException(
        `'jobParams.${JobParams.DatasetList}' is required.`,
      );
    }
    const datasetList = context.request.jobParams[
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

    const result = await datasetsService.findAll(filter);
    if (result.length != datasetIds.length) {
      throw new NotFoundException(
        `Unable to get a dataset. (${JSON.stringify(datasetIds)})`,
      );
    }
    context.datasets = result;
  }
  return context.datasets;
}
/**
 * Resolves DatasetsService from a moduleRef.
 *
 * DatasetService has REQUEST scope so this must be called from a controller.
 * @param moduleRef Reference to a modules which can resolve DatasetService at runtime
 */

export async function resolveDatasetService(moduleRef: ModuleRef) {
  const datasetsService = await moduleRef.resolve(DatasetsService, undefined, {
    strict: false,
  });

  if (datasetsService === undefined || datasetsService.findAll === undefined) {
    // This shouldn't happen unless the NestJS dependency graph is messed up.
    // It is left here for debugging.
    Logger.error(
      `Unable to resolve DatasetService. This indicates an unexpected server state.`,
    );
    throw makeHttpException(
      "Unable to resolve DatasetService. This indicates an unexpected server state.",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  return datasetsService;
}
