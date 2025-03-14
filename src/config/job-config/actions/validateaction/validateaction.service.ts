import { Injectable } from "@nestjs/common";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { ValidateCreateJobAction, ValidateJobAction } from "./validateaction";
import {
  isValidateCreateJobActionOptions,
  isValidateJobActionOptions,
} from "./validateaction.interface";
import { DatasetsService } from "src/datasets/datasets.service";
import { CreateJobDto } from "src/jobs/dto/create-job.dto";
import { ModuleRef } from "@nestjs/core";

@Injectable()
export class ValidateJobActionCreator implements JobActionCreator<JobDto> {
  constructor() {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isValidateJobActionOptions(options)) {
      throw new Error(
        `Invalid options for validate action: ${JSON.stringify(options)}`,
      );
    }
    return new ValidateJobAction(options);
  }
}

@Injectable()
export class ValidateCreateJobActionCreator
  implements JobActionCreator<CreateJobDto>
{
  constructor(private moduleRef: ModuleRef) {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isValidateCreateJobActionOptions(options)) {
      throw new Error(
        "Invalid options for validate action: ${JSON.stringify(options)}",
      );
    }
    return new ValidateCreateJobAction(this.moduleRef, options);
  }
}
