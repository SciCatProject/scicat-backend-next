import {
  Logger,
  NotFoundException,
  BadRequestException,
  HttpException,
} from "@nestjs/common";
import { JobAction } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";
import * as Handlebars from "handlebars";

// Handlebar options for JobClass templates
// TODO should this be moved into job.schema.ts?
const jobTemplateOptions = {
  allowedProtoProperties: {
    id: true,
    type: true,
    statusCode: true,
    statusMessage: true,
    messageSent: true,
    createdBy: true,
    jobParams: false,
  },
  allowProtoPropertiesByDefault: false, // limit accessible fields for security
};

/**
 * Respond to Job events by making an HTTP call.
 */
export class URLAction<T> implements JobAction<T> {
  public static readonly actionType = "url";

  private urlTemplate: Handlebars.TemplateDelegate<JobClass>;
  private method = "GET";
  private headers: Record<string, string> = {};
  private body: Record<string, any> | null = null;

  getActionType(): string {
    return URLAction.actionType;
  }

  async validate(dto: T) {}

  async performJob(job: JobClass) {
    const url = this.urlTemplate(job, jobTemplateOptions);
    Logger.log(`Requesting ${url}`, "URLAction");

    const response = await fetch(url, {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
    });

    Logger.log(`Request for ${url} returned ${response.status}`, "URLAction");
    if (!response.ok) {
      throw new HttpException(
        {
          status: response.status,
          message: `Got response: ${await response.text()}`,
        },
        response.status,
      );
    }

    // TODO do something with the response?
  }

  /**
   * Constructor for the class.
   *
   * @param {Record<string, any>} data - The data object should contain the following properties:
   * - url (required): the URL for the request
   * - method (optional): the HTTP method for the request, e.g. "GET", "POST"
   * - headers (optional): an object containing HTTP headers to be included in the request
   * - body (optional): the body of the request, for methods like "POST" or "PUT"
   *
   * @throws {NotFoundException} If the 'url' parameter is not provided in the data object
   */
  constructor(data: Record<string, any>) {
    if (!data["url"]) {
      throw new NotFoundException("Param 'url' is undefined in url action");
    }
    this.urlTemplate = Handlebars.compile(data.url);
    if (data["method"]) {
      this.method = data.method;
    }
    if (data["headers"]) {
      this.headers = data.headers;
    }
    this.body = data["body"];
  }
}
