/**
 * Functions for mapping between v3 and v4 job models
 */

import { DatasetListDto } from "./dto/dataset-list.dto";
import { OutputJobV3Dto } from "./dto/output-job-v3.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { UpdateJobDtoV3 } from "./dto/update-job.v3.dto";
import { JobClass } from "./schemas/job.schema";

/**
 * Transform a v4 job instance so that is compatible with v3
 * @param job: a JobClass instance (v4)
 * @returns a OutputJobV3Dto instance
 */
export function mapJobClassV4toV3(job: JobClass): OutputJobV3Dto {
  const jobV3 = new OutputJobV3Dto();
  // Map fields from v4 to v3
  jobV3._id = job._id;
  jobV3.id = job.id;
  jobV3.emailJobInitiator = job.contactEmail;
  jobV3.type = job.type;
  jobV3.creationTime = job.createdAt;
  jobV3.jobStatusMessage = job.statusCode;
  jobV3.jobResultObject = job.jobResultObject;
  // Extract datasetList from jobParams
  const { datasetList, ...jobParams } = job.jobParams;
  jobV3.datasetList = datasetList as DatasetListDto[];
  jobV3.jobParams = jobParams;
  // Extract executionTime from jobParams
  if (job.jobParams.executionTime) {
    const { datasetList, executionTime, ...jobParams } = job.jobParams;
    jobV3.datasetList = datasetList as DatasetListDto[];
    jobV3.executionTime = executionTime as Date;
    jobV3.jobParams = jobParams;
  }
  return jobV3;
}

export function mapUpdateJobDtoV3ToV4(dtoV3: UpdateJobDtoV3) {
  let newBody: UpdateJobDto = {
    statusCode: dtoV3.jobStatusMessage,
    statusMessage: dtoV3.jobStatusMessage,
  };

  let newjobResultObject = dtoV3.jobResultObject;
  // if executionTime is provided, add it to jobResultObject, to maintain compatibility
  // after the job update is completed, it will be then moved to jobParams
  if (dtoV3.executionTime) {
    newjobResultObject = {
      ...newjobResultObject,
      executionTime: dtoV3.executionTime,
    };
  }
  newBody = {
    ...newBody,
    jobResultObject: newjobResultObject,
  };
  return newBody;
}
