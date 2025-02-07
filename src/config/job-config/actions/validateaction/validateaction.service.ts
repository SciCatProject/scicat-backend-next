import { Injectable } from "@nestjs/common";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { ValidateJobAction } from "./validateaction";
import { isValidateJobActionOptions } from "./validateaction.interface";

@Injectable()
export class ValidateJobActionCreator implements JobActionCreator<JobDto> {
  constructor() {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isValidateJobActionOptions(options)) {
      throw new Error(
        `Invalid options for ValidateJobAction: ${JSON.stringify(options)}`,
      );
    }
    return new ValidateJobAction(options);
  }
}
