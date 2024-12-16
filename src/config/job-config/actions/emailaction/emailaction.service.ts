import { Injectable } from "@nestjs/common";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { isEmailJobActionOptions } from "./emailaction.interface";
import { EmailJobAction } from "./emailaction";
import { MailService } from "src/common/mail.service";

@Injectable()
export class EmailJobActionCreator implements JobActionCreator<JobDto> {
  constructor(private mailService: MailService) {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isEmailJobActionOptions(options)) {
      throw new Error("Invalid options for EmailJobAction.");
    }
    return new EmailJobAction(this.mailService, options);
  }
}
