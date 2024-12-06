import { isLogJobActionOptions } from "./logaction.interface";
import {
  JobActionFactory,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { Injectable } from "@nestjs/common";
import { LogJobAction } from "./logaction";

@Injectable()
export class LogJobActionFactory implements JobActionFactory<JobDto> {
  constructor() {}

  public create(options: JobActionOptions) {
    if (!isLogJobActionOptions(options)) {
      throw new Error("Invalid options for LogJobAction.");
    }

    return new LogJobAction(options);
  }
}
