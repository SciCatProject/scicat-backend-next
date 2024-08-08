/**
 * Send emails in response to job events
 * This is intended as an example of the JobAction interface
 *
 */
import { readFileSync } from "fs";
import { compile, TemplateDelegate } from "handlebars";
import { createTransport, Transporter } from "nodemailer";
import { Logger, NotFoundException } from "@nestjs/common";
import { JobAction } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";
import configuration from "src/config/configuration";


// Handlebar options for JobClass templates
const jobTemplateOptions = {
  allowedProtoProperties: {
    id: true,
    type: true,
    statusCode: true,
    statusMessage: true,
    createdBy: true,
    jobParams: true,
    contactEmail: true,
  },
  allowProtoPropertiesByDefault: false, // limit accessible fields for security
};

type MailOptions = {
  to: string;
  from: string;
  subject: string;
  text?: string;
};

/**
 * Send an email following a job
 */
export class EmailJobAction<T> implements JobAction<T> {
  public static readonly actionType = "email";

  private mailService: Transporter;
  private toTemplate: TemplateDelegate<JobClass>;
  private from: string;
  private password: string;
  private subjectTemplate: TemplateDelegate<JobClass>;
  private bodyTemplate: TemplateDelegate<JobClass>;

  getActionType(): string {
    return EmailJobAction.actionType;
  }

  constructor(data: Record<string, unknown>) {
    Logger.log(
      "Initializing EmailJobAction. Params: " + JSON.stringify(data),
      "EmailJobAction",
    );

    if (!data["to"]) {
      throw new NotFoundException("Param 'to' is undefined");
    }
    if (!data["from"]) {
      throw new NotFoundException("Param 'from' is undefined");
    }
    if (typeof data["from"] !== "string") {
      throw new TypeError("Param 'from' should be a string");
    }
    if (!data["password"]) {
      throw new NotFoundException("Param 'from' is undefined");
    }
    if (typeof data["password"] !== "string") {
      throw new TypeError("Param 'password' should be a string");
    }
    if (!data["subject"]) {
      throw new NotFoundException("Param 'subject' is undefined");
    }
    if (!data["bodyTemplate"]) {
      throw new NotFoundException("Param 'bodyTemplate' is undefined");
    }

    Logger.log("EmailJobAction parameters are valid.", "EmailJobAction");

    this.from = data["from"];
    this.password = data["password"];

    // const mailerConfig = configuration().smtp;
    // this.mailService = createTransport({
    //   host: mailerConfig.host,
    //   port: mailerConfig.port,
    //   secure: mailerConfig.secure,
    //   auth: {
    //     user: this.from,
    //     pass: this.password
    //   }
    // } as any);

    this.toTemplate = compile(data["to"]);
    this.subjectTemplate = compile(data["subject"]);

    const templateFile = readFileSync(data["bodyTemplate"] as string, "utf8");
    this.bodyTemplate = compile(templateFile);
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing EmailJobAction: " + JSON.stringify(job),
      "EmailJobAction",
    );
    
    // Fill templates
    const mail: MailOptions = {
      to: this.toTemplate(job, jobTemplateOptions),
      from: this.from,
      subject: this.subjectTemplate(job, jobTemplateOptions),
    };
    mail.text = this.bodyTemplate(job, jobTemplateOptions);
    Logger.log(mail);

    // Send the email
    // await this.mailService.sendMail(mail);
  }
}
