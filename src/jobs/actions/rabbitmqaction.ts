import { Logger, NotFoundException } from "@nestjs/common";
import amqp, { Connection } from "amqplib/callback_api";
import { JobAction } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";


/**
 * Publish a message in a RabbitMQ queue
 */
export class RabbitMQJobAction<T> implements JobAction<T> {
  public static readonly actionType = "rabbitmq";
  private connection;
  private binding;

  constructor(data: Record<string, any>) {
    Logger.log(
      "Initializing RabbitMQJobAction. Params: " + JSON.stringify(data),
      "RabbitMQJobAction",
    );

    this.connection = {
      protocol: "amqp",
      hostname: data.hostname,
      port: data.port,
      username: data.username,
      password: data.password,
    };
    this.binding = {
      exchange: data.exchange,
      queue: data.queue,
      key: data.key
    };
  }

  getActionType(): string {
    return RabbitMQJobAction.actionType;
  }

  async validate(dto: T) {
    Logger.log(
      "Validating RabbitMQJobAction: " + JSON.stringify(dto),
      "RabbitMQJobAction",
    );

    const connectionDetailsMissing = [undefined, ""].some(el => Object.values(this.connection).includes(el));
    if (connectionDetailsMissing) {
      throw new NotFoundException("RabbitMQ configuration is missing connection details.");
    }

    const bindingDetailsMissing = [undefined, ""].some(el => Object.values(this.binding).includes(el));
    if (bindingDetailsMissing) {
      throw new NotFoundException("RabbitMQ binding is missing exchange/queue/key details.");
    }
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing RabbitMQJobAction: " + JSON.stringify(job),
      "RabbitMQJobAction",
    );

    amqp.connect(this.connection, (connectionError: Error, connection: Connection) => {
      if (connectionError) {
        Logger.error(
          "Connection error in RabbitMQJobAction: " + JSON.stringify(connectionError.message),
          "RabbitMQJobAction",
        );
        return;
      }

      connection.createChannel((channelError: Error, channel) => {
        if (channelError) {
          Logger.error(
            "Channel error in RabbitMQJobAction: " + JSON.stringify(channelError.message),
            "RabbitMQJobAction",
          );
          return;
        }

        channel.assertQueue(this.binding.queue, { durable: true });
        channel.assertExchange(this.binding.exchange, "topic", { durable: true });
        channel.bindQueue(this.binding.queue, this.binding.exchange, this.binding.key);
        channel.sendToQueue(this.binding.queue, Buffer.from(JSON.stringify(job)));

        channel.close(() => {
          connection.close();
        });
      });
    });
  }
}
