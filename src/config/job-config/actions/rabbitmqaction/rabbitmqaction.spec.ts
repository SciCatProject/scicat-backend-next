import { RabbitMQJobAction } from "./rabbitmqaction";
import { RabbitMQJobActionOptions } from "./rabbitmqaction.interface";
import { CreateJobDto } from "../../../../jobs/dto/create-job.dto";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { RabbitMQService } from "src/common/rabbitmq/rabbitmq.service";
import { ConfigService } from "@nestjs/config";


describe("RabbitMQJobAction", () => {
  const config: RabbitMQJobActionOptions = {
    actionType: "rabbitmq",
    queue: "testQueue",
    exchange: "testExchange",
    key: "testKey",
  };

  const configService = new ConfigService();
  const rabbitMQService = new RabbitMQService(configService);
  const action = new RabbitMQJobAction<CreateJobDto>(rabbitMQService, config);

  const spyConnect = jest.spyOn(rabbitMQService, "connect");
  const spySendMessage = jest.spyOn(rabbitMQService, "sendMessage");

  it("should be configured successfully", async () => {
    expect(action).toBeDefined();
  });

  it("should connect and send a message to the queue", async () => {
    const job = { id: "12345" } as JobClass;

    await action.performJob(job);

    expect(spyConnect).toHaveBeenCalledWith(
      config.queue,
      config.exchange,
      config.key,
    );

    expect(spySendMessage).toHaveBeenCalledWith(
      config.queue,
      JSON.stringify(job),
    );
  });
});
