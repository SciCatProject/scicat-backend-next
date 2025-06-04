/**
 * Simple JobAction for logging events.
 */
import { Logger } from "@nestjs/common";
import {
  JobAction,
  JobDto,
  JobValidateContext,
  JobPerformContext,
} from "../../jobconfig.interface";
import { LogJobActionOptions, actionType } from "./logaction.interface";
import { compile } from "handlebars";
import { compileJobTemplate, TemplateJob } from "../../handlebar-utils";

/**
 * Log job events
 *
 * Three phases can be logged. Each is a handlebars template.
 * 1. `init`: when the action is created.
 *    Context: The options from the job configuration file.
 *    Default: ""
 * 2. `validate`: Runs during the `validate` phase, before the job is written to the
 *    database.
 *    Context: {request: <the http request>, env: <environment variables>}.
 *    Default: ""
 * 3. `perform`: Runs during the `perform` phase, after the job is written to the
 *    database.
 *    Context: {request: <the http request>, job: <the job>, env: <environment
 *    variables>}.
 *    Default: "Performing job for {{{ job.type }}}"
 */
export class LogJobAction<T extends JobDto> implements JobAction<T> {
  private validateTemplate: TemplateJob;
  private performTemplate: TemplateJob;

  getActionType(): string {
    return actionType;
  }

  constructor(options: LogJobActionOptions) {
    options = {
      init: "",
      validate: "",
      perform: "Performing job for {{{ job.type }}}",
      ...options,
    };

    const initTemplate = compile<LogJobActionOptions>(options.init);
    this.validateTemplate = compileJobTemplate(options.validate || "");
    this.performTemplate = compileJobTemplate(options.perform || "");

    const msg = initTemplate(options);
    if (msg) {
      Logger.log(msg, "LogJobAction");
    }
  }

  async validate(context: JobValidateContext<T>) {
    const msg = this.validateTemplate(context);
    if (msg) {
      Logger.log(msg, "LogJobAction");
    }
  }

  async perform(context: JobPerformContext<T>) {
    Logger.log(this.performTemplate(context), "LogJobAction");
  }
}
