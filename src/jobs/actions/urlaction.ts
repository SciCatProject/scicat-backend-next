import { Logger, NotFoundException, HttpException } from "@nestjs/common";
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
 * Type guard for Record<string, string>
 * @param obj
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isStringRecord(obj: any): obj is Record<string, string> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Object.keys(obj).every(
      (key) => typeof key === "string" && typeof obj[key] === "string",
    )
  );
}

/**
 * Respond to Job events by making an HTTP call.
 */
export class URLAction<T> implements JobAction<T> {
  public static readonly actionType = "url";

  private urlTemplate: Handlebars.TemplateDelegate<JobClass>;
  private method = "GET";
  private headerTemplates?: Record<
    string,
    Handlebars.TemplateDelegate<JobClass>
  > = {};
  private bodyTemplate?: Handlebars.TemplateDelegate<JobClass>;

  getActionType(): string {
    return URLAction.actionType;
  }

  async performJob(job: JobClass) {
    const url = encodeURI(this.urlTemplate(job, jobTemplateOptions));
    Logger.log(`Requesting ${url}`, "UrlJobAction");

    const response = await fetch(url, {
      method: this.method,
      headers: this.headerTemplates
        ? Object.fromEntries(
            Object.entries(this.headerTemplates).map(([key, template]) => [
              key,
              template(job, jobTemplateOptions),
            ]),
          )
        : undefined,
      body: this.bodyTemplate
        ? this.bodyTemplate(job, jobTemplateOptions)
        : undefined,
    });

    Logger.log(`Request for ${url} returned ${response.status}`, "UrlJobAction");
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: Record<string, any>) {
    Logger.log(
      "Initializing UrlJobAction. Params: " + JSON.stringify(data),
      "UrlJobAction",
    );

    if (!data["url"]) {
      throw new NotFoundException("Param 'url' is undefined in url action");
    }
    this.urlTemplate = Handlebars.compile(data.url);

    if (data["method"]) {
      this.method = data.method;
    }

    if (data["headers"]) {
      if (!isStringRecord(data.headers)) {
        throw new NotFoundException(
          "Param 'headers' should map strings to strings",
        );
      }
      this.headerTemplates = Object.fromEntries(
        Object.entries(data.headers).map(([key, value]) => [
          key,
          Handlebars.compile(value),
        ]),
      );
    }

    if (data["body"]) {
      this.bodyTemplate = Handlebars.compile(data["body"]);
    }
  }
}
