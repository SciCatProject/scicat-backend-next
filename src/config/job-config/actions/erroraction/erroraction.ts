import {
  JobAction,
  JobDto,
  JobValidateContext,
  JobPerformContext,
} from "../../jobconfig.interface";
import { ErrorJobActionOptions, actionType } from "./erroraction.interface";
import { makeHttpException } from "src/common/utils";
import { HttpStatus, Logger } from "@nestjs/common";
import { compileJobTemplate, TemplateJob } from "../../handlebar-utils";

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
  private messageTemplate: TemplateJob;
  private status?: number;

  getActionType(): string {
    return actionType;
  }

  constructor(options: ErrorJobActionOptions) {
    this.messageTemplate = compileJobTemplate(options.message || "");
    this.status = options.status;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async performJob(context: JobPerformContext<T>): Promise<void> {}

  async validate(context: JobValidateContext<T>) {
    const message = this.messageTemplate(context);
    Logger.error(
      `Executing error action [${this.status || HttpStatus.BAD_REQUEST}]: ${message}`,
    );
    throw makeHttpException(message, this.status);
  }
}
