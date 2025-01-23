import { EmailJobAction } from "./emailaction";
import { EmailJobActionOptions } from "./emailaction.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { MailService } from "src/common/mail.service";

jest.mock("src/common/mail.service");

describe("EmailJobAction", () => {
  const config: EmailJobActionOptions = {
    actionType: "email",
    to: "recipient@example.com",
    from: "sender@example.com",
    subject: "Job {{id}} completed",
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

    await action.performJob(job);

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

    await expect(action.performJob(job)).rejects.toThrow(
      "Email sending failed",
    );
  });
});
