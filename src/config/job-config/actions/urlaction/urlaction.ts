import { Logger, HttpException } from "@nestjs/common";
import {
  JobAction,
  JobDto,
  JobPerformContext,
} from "../../jobconfig.interface";
import { compileJobTemplate, TemplateJob } from "../../handlebar-utils";
import { actionType, URLJobActionOptions } from "./urlaction.interface";

/**
 * Respond to Job events by making an HTTP call.
 */
export class URLJobAction<T extends JobDto> implements JobAction<T> {
  private urlTemplate: TemplateJob;
  private method = "GET";
  private headerTemplates?: Record<string, TemplateJob> = {};
  private bodyTemplate?: TemplateJob;
  private ignoreErrors = false;

  getActionType(): string {
    return actionType;
  }

  async perform(context: JobPerformContext<T>) {
    const url = encodeURI(this.urlTemplate(context));
    Logger.log(`(Job ${context.job.id}) Requesting ${url}`, "URLAction");

    let msg;
    try {
      msg = {
        method: this.method,
        headers: this.headerTemplates
          ? Object.fromEntries(
              Object.entries(this.headerTemplates).map(([key, template]) => [
                key,
                template(context),
              ]),
            )
          : undefined,
        body: this.bodyTemplate ? this.bodyTemplate(context) : undefined,
      };
    } catch (err) {
      Logger.error(
        `(Job ${context.job.id}) Templating error generating request for ${url}: ${err}`,
        "URLAction",
      );
      if (!this.ignoreErrors) {
        throw err;
      }
      return;
    }

    let response;
    try {
      response = await fetch(url, msg);
    } catch (err) {
      Logger.error(
        `(Job ${context.job.id}) Network error requesting ${url}: ${err}`,
        "URLAction",
      );
      if (!this.ignoreErrors) {
        throw err;
      }
      return;
    }

    let text = "undefined";
    try {
      text = await response.text();
    } catch (err) {
      Logger.error(
        `(Job ${context.job.id}) Error reading response text from ${url}: ${err}`,
        "URLAction",
      );
      if (!this.ignoreErrors) {
        throw err;
      }
    }

    if (response.ok) {
      Logger.log(
        `(Job ${context.job.id}) Request for ${url} returned ${response.status}. Response: ${text}`,
        "URLAction",
      );
    } else {
      Logger.error(
        `(Job ${context.job.id}) Request for ${url} returned ${response.status}. Response: ${text}`,
        "URLAction",
      );

      if (!this.ignoreErrors) {
        throw new HttpException(
          {
            status: response.status,
            message: `A remote URL call failed with response: ${text}`,
          },
          response.status,
        );
      }
    }
  }

  /**
   * Constructor for the class.
   *
   * @param {Record<string, any>} options - The data object should contain the following properties:
   * - url (required): the URL for the request
   * - method (optional): the HTTP method for the request, e.g. "GET", "POST"
   * - headers (optional): an object containing HTTP headers to be included in the request
   * - body (optional): the body of the request, for methods like "POST" or "PUT"
   *
   * @throws {NotFoundException} If the 'url' parameter is not provided in the data object
   */

  constructor(options: URLJobActionOptions) {
    this.urlTemplate = compileJobTemplate(options.url);

    if (options["method"]) {
      this.method = options.method;
    }

    if (options["headers"]) {
      this.headerTemplates = Object.fromEntries(
        Object.entries(options.headers).map(([key, value]) => [
          key,
          compileJobTemplate(value),
        ]),
      );
    }

    if (options["body"]) {
      this.bodyTemplate = compileJobTemplate(options["body"]);
    }

    if (options["ignoreErrors"]) {
      this.ignoreErrors = options.ignoreErrors;
    }
  }
}
