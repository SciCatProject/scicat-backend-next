/**
 * Simple JobAction for logging events.
 * This is intended as an example of the JobAction interface
 *
 */
import { Logger } from "@nestjs/common";
import { JobAction, JobDto } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";

export class LogJobAction<T extends JobDto> implements JobAction<T> {
  public static readonly actionType = "log";

  getActionType(): string {
    return LogJobAction.actionType;
  }

  async validate(dto: T) {
    Logger.log("Validating job dto: " + JSON.stringify(dto), "LogJobAction");
  }

  async performJob(job: JobClass) {
    Logger.log("Performing job: " + JSON.stringify(job), "LogJobAction");
  }

  constructor(data: Record<string, unknown>) {
    Logger.log(
      "Initializing LogJobAction. Params: " + JSON.stringify(data),
      "LogJobAction",
    );
  }
}
