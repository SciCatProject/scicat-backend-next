import { RabbitMQJobAction } from "./rabbitmqaction";
import { RabbitMQJobActionOptions } from "./rabbitmqaction.interface";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { RabbitMQService } from "src/common/rabbitmq/rabbitmq.service";
import amqp from "amqplib";

jest.mock("amqplib");

describe("RabbitMQJobAction", () => {
  const config: RabbitMQJobActionOptions = {
    actionType: "rabbitmq",
    queue: "testQueue",
    exchange: "testExchange",
    key: "testKey",
  };

  const rabbitMQService = {
    connect: jest.fn(),
    sendMessage: jest.fn(),
  } as unknown as RabbitMQService;

  const action = new RabbitMQJobAction<CreateJobDto>(rabbitMQService, config);

  beforeEach(() => {
    (amqp.connect as jest.Mock).mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue({
        assertQueue: jest.fn(),
        sendToQueue: jest.fn(),
        close: jest.fn(),
      }),
      close: jest.fn(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });

  it("should send a message to the queue", async () => {
    const job = { id: "12345" } as JobClass;

    await action.performJob(job);

    expect(rabbitMQService.connect).toHaveBeenCalledWith("testQueue", "testExchange", "testKey");
    expect(rabbitMQService.sendMessage).toHaveBeenCalledWith("testQueue", JSON.stringify(job));
  });
});
