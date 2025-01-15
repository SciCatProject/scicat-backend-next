import { isLogJobActionOptions } from "./logaction.interface";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { Injectable } from "@nestjs/common";
import { LogJobAction } from "./logaction";

@Injectable()
export class LogJobActionCreator implements JobActionCreator<JobDto> {
  constructor() {}

  public create(options: JobActionOptions) {
    if (!isLogJobActionOptions(options)) {
      throw new Error("Invalid options for LogJobAction.");
    }

    return new LogJobAction(options);
  }
}
