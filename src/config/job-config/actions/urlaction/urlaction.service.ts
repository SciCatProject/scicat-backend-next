import { Injectable } from "@nestjs/common";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { URLJobAction } from "./urlaction";
import { isURLJobActionOptions } from "./urlaction.interface";

@Injectable()
export class URLJobActionCreator implements JobActionCreator<JobDto> {
  constructor() {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isURLJobActionOptions(options)) {
      throw new Error("Invalid options for URLJobAction.");
    }
    return new URLJobAction(options);
  }
}
