import { isErrorJobActionOptions } from "./erroraction.interface";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { Injectable } from "@nestjs/common";
import { ErrorJobAction } from "./erroraction";

@Injectable()
export class ErrorJobActionCreator implements JobActionCreator<JobDto> {
  constructor() {}

  public create(options: JobActionOptions) {
    if (!isErrorJobActionOptions(options)) {
      throw new Error("Invalid options for ErrorJobAction.");
    }

    return new ErrorJobAction(options);
  }
}
