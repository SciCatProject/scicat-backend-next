/**
 * Simple JobAction for logging events.
 */
import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { ErrorJobActionOptions, actionType } from "./erroraction.interface";
import { compileJob, TemplateJob } from "../../handlebar-utils";
import { makeHttpException } from "src/common/utils";
import { HttpStatus, Logger } from "@nestjs/common";

export class ErrorJobAction<T extends JobDto> implements JobAction<T> {
  private messageTemplate: TemplateJob;
  private status?: number;

  getActionType(): string {
    return actionType;
  }

  constructor(options: ErrorJobActionOptions) {
    this.messageTemplate = compileJob(options.message || "");
    this.status = options.status;
  }

  async validate(dto: T) {}

  async performJob(job: JobClass) {
    const message = this.messageTemplate(job);
    Logger.error(
      `Executing error action [${this.status || HttpStatus.BAD_REQUEST}]: ${message}`,
    );
    throw makeHttpException(message, this.status);
  }
}
