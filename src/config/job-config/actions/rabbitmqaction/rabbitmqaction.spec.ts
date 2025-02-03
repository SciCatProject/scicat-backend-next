import { RabbitMQJobAction } from "./rabbitmqaction";
import { RabbitMQJobActionOptions } from "./rabbitmqaction.interface";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { RabbitMQService } from "src/common/rabbitmq/rabbitmq.service";
import { ConfigService } from "@nestjs/config";

jest.mock("@nestjs/config");

describe("RabbitMQJobAction", () => {
  const options: RabbitMQJobActionOptions = {
    actionType: "rabbitmq",
    queue: "testQueue",
    exchange: "testExchange",
    key: "testKey",
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case "rabbitMq.enabled":
          return "yes";
        case "rabbitMq.hostname":
          return "rabbitmq";
        case "rabbitMq.port":
          return 5672;
        case "rabbitMq.username":
          return "guest";
        case "rabbitMq.password":
          return "guest";
        default:
          return null;
      }
    }),
  };

  const mockRabbitMQService = {
    sendMessage: jest.fn(),
  };

  const action = new RabbitMQJobAction<CreateJobDto>(
    mockConfigService as unknown as ConfigService,
    mockRabbitMQService as unknown as RabbitMQService,
    options,
  );

  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });

  it("should connect and send a message to the queue", async () => {
    const job = { id: "12345" } as JobClass;

    await action.performJob(job);

    expect(mockRabbitMQService.sendMessage).toHaveBeenCalledWith(
      options.queue,
      options.exchange,
      options.key,
      JSON.stringify(job),
    );
  });
});
