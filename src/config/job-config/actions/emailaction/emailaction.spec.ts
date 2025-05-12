import { EmailJobAction } from "./emailaction";
import { EmailJobActionOptions } from "./emailaction.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { MailService } from "src/common/mail.service";
import { MailerService } from "@nestjs-modules/mailer";

jest.mock("src/common/mail.service");
jest.mock("@nestjs-modules/mailer");

describe("EmailJobAction", () => {
  const config: EmailJobActionOptions = {
    actionType: "email",
    to: "recipient@example.com",
    from: "sender@example.com",
    subject: "Job {{job.id}} completed",
    bodyTemplateFile: "src/common/email-templates/job-template.spec.html",
  };

  const mailService = {
    sendMail: jest.fn(),
  } as unknown as MailService;

  const action = new EmailJobAction(mailService, config);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });

  it("should send an email successfully", async () => {
    const job = {
      id: "12345",
      type: "testemail",
    } as JobClass;

    const context = { request: job, job, env: {} };
    await action.performJob(context);

    expect(mailService.sendMail).toHaveBeenCalledWith({
      to: "recipient@example.com",
      from: "sender@example.com",
      subject: "Job 12345 completed",
      html: "Your testemail job with ID 12345 has been completed successfully.",
    });
  });

  it("should throw an error if email sending fails", async () => {
    const job = {
      id: "12345",
      type: "testemail",
    } as JobClass;

    (mailService.sendMail as jest.Mock).mockRejectedValue(
      new Error("Email sending failed"),
    );

    const context = { request: job, job, env: {} };
    await expect(action.performJob(context)).rejects.toThrow(
      "Email sending failed",
    );
  });
});

describe("EmailJobAction with default sender", () => {
  const config: EmailJobActionOptions = {
    actionType: "email",
    to: "recipient@example.com",
    subject: "Job {{ job.id }} completed",
    bodyTemplateFile: "src/common/email-templates/job-template.spec.html",
  };

  const mailService = {
    sendMail: jest.fn(),
  } as unknown as MailService;

  const mailerService = {
    sendMail: jest.fn(),
  } as unknown as MailerService;

  const action = new EmailJobAction(mailService, config);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });

  it("should send an email with default sender successfully", async () => {
    const job = {
      id: "12345",
      type: "testemail",
    } as JobClass;

    const defaultFrom = "default-sender@example.com";
    (mailerService.sendMail as jest.Mock).mockImplementation((mailOptions) => {
      mailOptions.from = defaultFrom;
      return Promise.resolve();
    });

    (mailService.sendMail as jest.Mock).mockImplementation((mailOptions) => {
      return mailerService.sendMail(mailOptions);
    });

    const context = { request: job, job, env: {} };
    await action.performJob(context);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: "recipient@example.com",
      from: defaultFrom,
      subject: "Job 12345 completed",
      html: "Your testemail job with ID 12345 has been completed successfully.",
    });
  });
});
