import { Injectable } from "@nestjs/common";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { ValidateCreateJobAction, ValidateJobAction } from "./validateaction";
import { isValidateJobActionOptions } from "./validateaction.interface";
import { DatasetsService } from "src/datasets/datasets.service";
import { CreateJobDto } from "src/jobs/dto/create-job.dto";

@Injectable()
export class ValidateJobActionCreator implements JobActionCreator<JobDto> {
  constructor(private datasetService: DatasetsService) {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isValidateJobActionOptions(options)) {
      throw new Error("Invalid options for ValidateJobAction.");
    }
    return new ValidateJobAction(options);
  }
}

@Injectable()
export class ValidateCreateJobActionCreator
  implements JobActionCreator<CreateJobDto>
{
  constructor(private datasetService: DatasetsService) {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isValidateJobActionOptions(options)) {
      throw new Error("Invalid options for ValidateJobAction.");
    }
    return new ValidateCreateJobAction(this.datasetService, options);
  }
}
