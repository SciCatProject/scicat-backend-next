/**
 * Send emails in response to job events
 * This is intended as an example of the JobAction interface
 * 
 */
import { Logger } from "@nestjs/common";
import { JobCreateAction, registerCreateAction } from "../jobconfig";
import { JobClass } from "../../jobs/schemas/job.schema";
import { CreateJobDto } from "../../jobs/dto/create-job.dto";
import { MailerService, createTransport } from "@nestjs-modules/mailer";
import { MailService } from "src/common/mail.service";
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
    // Template for subject
    subject: "Archive job {{job.pid}} has completed.",
    // Template for plain-text body
    text: "Dear {{job.owner}},\n\nArchive job {{job.pid}} has completed. Results: {{job.status}}\n",
    // Template for html body
    html: "Dear {{job.owner}},<p>Archive job {{job.pid}} has completed. Results: {{job.status}}</p>",
}
/**
 * Send an email following a job
 */
export class EmailJobAction implements JobCreateAction {
    static readonly type = "email";
    private mailService: MailService;
    private toTemplate: TemplateDelegate<JobClass>;
    private ccTemplate?: TemplateDelegate<JobClass>;
    private subjectTemplate: TemplateDelegate<JobClass>;
    private htmlTemplate?: TemplateDelegate<JobClass>;
    private textTemplate?: TemplateDelegate<JobClass>;
    
    constructor(data: Record<string, any>) {
        const mailer: MailerService = createTransport(data["mailer"]);
        this.mailService = new MailService(mailer);
        this.toTemplate = compile(data["to"]);
        this.ccTemplate = "cc" in data ? compile(data["cc"]) : undefined;
        this.subjectTemplate = compile(data["subject"])
        this.htmlTemplate = "html" in data? compile(data["html"]) : undefined;
        this.textTemplate = "text" in data ? compile(data["text"]) : undefined;
    }

    async validate(createJobDto: CreateJobDto) {}

    async performJob(job: JobClass) {
        // Fill templates
        const to = this.toTemplate(job);
        const cc = this.ccTemplate ? this.ccTemplate(job) : "";
        const subject = this.subjectTemplate(job);
        const html = this.htmlTemplate ? this.htmlTemplate(job) : null;
        const text = this.textTemplate ? this.textTemplate(job) : null;
        await this.mailService.sendMail(to, cc, subject, text, html);

        return job;
    }

}

//registerCreateAction(LogJobAction.type, (data) => new LogJobAction(data))
