/**
 * Send emails in response to job events
 * This is intended as an example of the JobAction interface
 *
 */
import { readFileSync } from "fs";
import { compile, TemplateDelegate } from "handlebars";
import { createTransport, Transporter } from "nodemailer";
import { Logger, NotFoundException } from "@nestjs/common";
import { JobAction, JobDto } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";

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

type Auth = {
  user: string;
  password: string;
};

/**
 * Send an email following a job
 */
export class EmailJobAction<T extends JobDto> implements JobAction<T> {
  public static readonly actionType = "email";

  private mailService: Transporter;
  private toTemplate: TemplateDelegate<JobClass>;
  private from: string;
  private auth: Auth | object = {};
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

    if (data["auth"]) {
      // check optional auth field
      function CheckAuthDefinition(obj: object): obj is Auth {
        return (
          Object.keys(obj).length == 2 && "user" in obj && "password" in obj
        );
      }

      if (!CheckAuthDefinition(data["auth"])) {
        throw new NotFoundException(
          "Param 'auth' should contain fields 'user' and 'password' only.",
        );
      }
      this.auth = data["auth"] as Auth;
    }
    if (!data["to"]) {
      throw new NotFoundException("Param 'to' is undefined");
    }
    if (!data["from"]) {
      throw new NotFoundException("Param 'from' is undefined");
    }
    if (!data["subject"]) {
      throw new NotFoundException("Param 'subject' is undefined");
    }
    if (!data["bodyTemplateFile"]) {
      throw new NotFoundException("Param 'bodyTemplateFile' is undefined");
    }
    Logger.log("EmailJobAction parameters are valid.", "EmailJobAction");

    // const mailerConfig = configuration().smtp;
    // this.mailService = createTransport({
    //   host: mailerConfig.host,
    //   port: mailerConfig.port,
    //   secure: mailerConfig.secure,
    //   auth: this.auth
    // } as any);

    this.from = data["from"] as string;
    this.toTemplate = compile(data["to"]);
    this.subjectTemplate = compile(data["subject"]);

    const templateFile = readFileSync(
      data["bodyTemplateFile"] as string,
      "utf8",
    );
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
