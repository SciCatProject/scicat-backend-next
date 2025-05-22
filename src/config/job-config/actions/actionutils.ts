/**
 * Utility functions shared by several jobactions
 */
import { HttpStatus, Logger, NotFoundException } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { JSONPathOptions } from "jsonpath-plus";
import { makeHttpException } from "src/common/utils";
import { DatasetsService } from "src/datasets/datasets.service";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { DatasetListDto } from "src/jobs/dto/dataset-list.dto";
import { JobParams } from "src/jobs/types/job-types.enum";
import { JobTemplateContext } from "../jobconfig.interface";

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
 * Load a list of datasets from the database.
 *
 * This requires datasetList to be set either in context.request (create jobs)
 * or context.job (update jobs). If it is missing an HTTP exception is thrown.
 * @param datasetsService service, usually injected by nestjs
 * @param context job context
 * @returns The list of datasets, which are also stored as context.datasets
 */

export async function loadDatasets(
  datasetsService: DatasetsService,
  context: JobTemplateContext,
): Promise<DatasetClass[]> {
  if (!context.datasets) {
    // Require datasetList
    let datasetList: DatasetListDto[] = [];
    if (
      "jobParams" in context.request &&
      JobParams.DatasetList in context.request.jobParams
    ) {
      datasetList = context.request.jobParams[
        JobParams.DatasetList
      ] as DatasetListDto[];
    } else if (
      "job" in context &&
      context.job &&
      JobParams.DatasetList in context.job.jobParams
    ) {
      datasetList = context.job.jobParams[
        JobParams.DatasetList
      ] as DatasetListDto[];
    } else {
      throw makeHttpException(
        `'jobParams.${JobParams.DatasetList}' is required.`,
      );
    }

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
