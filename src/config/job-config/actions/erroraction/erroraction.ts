import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { ErrorJobActionOptions, actionType } from "./erroraction.interface";
import { makeHttpException } from "src/common/utils";
import { HttpStatus, Logger } from "@nestjs/common";
import { compile, TemplateDelegate } from "handlebars";

/**
 * Raise an HTTP error
 *
 * This is useful for testing or in combination with a `switch` action to raise errors
 * for specific job situations.
 *
 * Errors are thrown during the `validate` step, before job is written to the database.
 *
 * Configuration parameters:
 *
 * - message (string, required): Error message returned in the response body. May include
 *   handlebars templates referring to the DTO
 * - status (number, optional): HTTP error code. Defaults to 400 bad request.
 */
export class ErrorJobAction<T extends JobDto> implements JobAction<T> {
  private messageTemplate: TemplateDelegate<T>;
  private status?: number;

  getActionType(): string {
    return actionType;
  }

  constructor(options: ErrorJobActionOptions) {
    this.messageTemplate = compile(options.message || "");
    this.status = options.status;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async performJob(job: JobClass): Promise<void> {}

  async validate(dto: T) {
    const message = this.messageTemplate(dto);
    Logger.error(
      `Executing error action [${this.status || HttpStatus.BAD_REQUEST}]: ${message}`,
    );
    throw makeHttpException(message, this.status);
  }
}
