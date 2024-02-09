/**
 * Send emails in response to job events
 * This is intended as an example of the JobAction interface
 *
 */
import { JobAction } from "../jobconfig";
import { JobClass } from "../../jobs/schemas/job.schema";
import { createTransport, Transporter } from "nodemailer";
import { compile, TemplateDelegate } from "handlebars";

const exampleConfig = {
  // Must be "email"
  type: "email",
  // Configure the SMTP server. See https://nodemailer.com/
  mailer: {
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: "REPLACE-WITH-YOUR-ALIAS@YOURDOMAIN.COM",
      pass: "REPLACE-WITH-YOUR-GENERATED-PASSWORD",
    },
  },
  // Template for comma-separated list of recipients
  to: "{{job.ownerEmail}}",
  // Fixed String
  from: "scicat@example.com",
  // Template for subject
  subject: "Archive job {{job.pid}} has completed.",
  // Template for plain-text body
  text: "Dear {{job.owner}},\n\nArchive job {{job.pid}} has completed. Results: {{job.status}}\n",
  // Template for html body
  html: "Dear {{job.owner}},<p>Archive job {{job.pid}} has completed. Results: {{job.status}}</p>",
};

/**
 * Send an email following a job
 */
export class EmailJobAction<T> implements JobAction<T> {
  private mailService: Transporter;
  private toTemplate: TemplateDelegate<JobClass>;
  private from: string;
  private ccTemplate?: TemplateDelegate<JobClass>;
  private subjectTemplate: TemplateDelegate<JobClass>;
  private htmlTemplate?: TemplateDelegate<JobClass>;
  private textTemplate?: TemplateDelegate<JobClass>;

  public static readonly actionType = "email";

  getActionType(): string {
    return EmailJobAction.actionType;
  }

  constructor(data: Record<string, any>) {
    this.mailService = createTransport(data["mailer"]);
    this.toTemplate = compile(data["to"]);
    this.from = data["from"];
    this.ccTemplate = "cc" in data ? compile(data["cc"]) : undefined;
    this.subjectTemplate = compile(data["subject"]);
    this.htmlTemplate = "html" in data ? compile(data["html"]) : undefined;
    this.textTemplate = "text" in data ? compile(data["text"]) : undefined;
  }

  async validate(dto: T) {
    //TODO validate fields used in the templates are present somehow
  }

  async performJob(job: JobClass) {
    // Fill templates
    const mail: any = {
      to: this.toTemplate(job),
      from: this.from,
      subject: this.subjectTemplate(job),
    };
    if (this.ccTemplate) {
      mail.cc = this.ccTemplate(job);
    }
    if (this.htmlTemplate) {
      mail.html = this.htmlTemplate(job);
    }
    if (this.textTemplate) {
      mail.text = this.textTemplate(job);
    }
    await this.mailService.sendMail(mail);

    return job;
  }
}
