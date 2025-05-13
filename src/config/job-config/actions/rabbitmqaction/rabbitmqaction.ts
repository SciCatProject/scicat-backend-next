import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  JobAction,
  JobDto,
  JobPerformContext,
} from "../../jobconfig.interface";
import {
  actionType,
  RabbitMQJobActionOptions,
} from "./rabbitmqaction.interface";
import { RabbitMQService } from "src/common/rabbitmq/rabbitmq.service";

/**
 * Publish a message in a RabbitMQ queue
 */
export class RabbitMQJobAction<T extends JobDto> implements JobAction<T> {
  private queue: string;
  private exchange: string;
  private key: string;

  getActionType(): string {
    return actionType;
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
    options: RabbitMQJobActionOptions,
  ) {
    const rabbitMqEnabled =
      this.configService.get<string>("rabbitMq.enabled") === "yes";
    if (!rabbitMqEnabled) {
      throw new Error("RabbitMQService is not enabled.");
    }
    this.queue = options.queue;
    this.exchange = options.exchange;
    this.key = options.key;
  }

  async performJob(context: JobPerformContext<T>) {
    Logger.log(
      `(Job ${context.job.id}) Performing RabbitMQJobAction`,
      "RabbitMQJobAction",
    );
    this.rabbitMQService.sendMessage(
      this.queue,
      this.exchange,
      this.key,
      JSON.stringify(context.job),
    );
  }
}
