import { Injectable } from "@nestjs/common";
import {
  JobActionFactory,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { ValidateJobAction } from "./validateaction";
import { isValidateJobActionOptions } from "./validateaction.interface";

@Injectable()
export class ValidateJobActionFactory implements JobActionFactory<JobDto> {
  constructor() {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isValidateJobActionOptions(options)) {
      throw new Error("Invalid options for ValidateJobAction.");
    }
    return new ValidateJobAction(options);
  }
}
