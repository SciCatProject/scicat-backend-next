/**
 * Simple JobAction for logging events.
 */
import { Logger } from "@nestjs/common";
import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { LogJobActionOptions, actionType } from "./logaction.interface";
import { compile, TemplateDelegate } from "handlebars";
import { compileJob, TemplateJob } from "../../handlebar-utils";

export class LogJobAction<T extends JobDto> implements JobAction<T> {
  private validateTemplate: TemplateDelegate<T>;
  private performJobTemplate: TemplateJob;

  getActionType(): string {
    return actionType;
  }

  constructor(options: LogJobActionOptions) {
    options = {
      init: "",
      validate: "Validating job dto for {{{type}}}",
      performJob: "Performing job for {{{type}}}",
      ...options,
    };

    const initTemplate = compile<LogJobActionOptions>(options.init);
    this.validateTemplate = compile(options.validate || "");
    this.performJobTemplate = compileJob(options.performJob || "");

    const msg = initTemplate(options);
    if (msg) {
      Logger.log(msg, "LogJobAction");
    }
  }

  async validate(dto: T) {
    const msg = this.validateTemplate(dto);
    if (msg) {
      Logger.log(msg, "LogJobAction");
    }
  }

  async performJob(job: JobClass) {
    Logger.log(this.performJobTemplate(job), "LogJobAction");
  }
}
