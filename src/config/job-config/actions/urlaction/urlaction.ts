import { Logger, HttpException } from "@nestjs/common";
import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { compileJob, TemplateJob } from "../../handlebar-utils";
import { actionType, URLJobActionOptions } from "./urlaction.interface";

/**
 * Respond to Job events by making an HTTP call.
 */
export class URLJobAction<T extends JobDto> implements JobAction<T> {
  private urlTemplate: TemplateJob;
  private method = "GET";
  private headerTemplates?: Record<string, TemplateJob> = {};
  private bodyTemplate?: TemplateJob;

  getActionType(): string {
    return actionType;
  }

  async performJob(job: JobClass) {
    const url = encodeURI(this.urlTemplate(job));
    Logger.log(`(Job ${job.id}) Requesting ${url}`, "URLAction");

    const response = await fetch(url, {
      method: this.method,
      headers: this.headerTemplates
        ? Object.fromEntries(
            Object.entries(this.headerTemplates).map(([key, template]) => [
              key,
              template(job),
            ]),
          )
        : undefined,
      body: this.bodyTemplate ? this.bodyTemplate(job) : undefined,
    });

    Logger.log(
      `(Job ${job.id}) Request for ${url} returned ${response.status}`,
      "URLAction",
    );
    if (!response.ok) {
      const text = await response.text();
      Logger.error(`(Job ${job.id}) Got response: ${text}`);
      throw new HttpException(
        {
          status: response.status,
          message: `Got response: ${text}`,
        },
        response.status,
      );
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
    this.urlTemplate = compileJob(options.url);

    if (options["method"]) {
      this.method = options.method;
    }

    if (options["headers"]) {
      this.headerTemplates = Object.fromEntries(
        Object.entries(options.headers).map(([key, value]) => [
          key,
          compileJob(value),
        ]),
      );
    }

    if (options["body"]) {
      this.bodyTemplate = compileJob(options["body"]);
    }
  }
}
