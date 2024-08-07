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

  constructor(data: Record<string, unknown>) {
    Logger.log(
      "Initializing RabbitMQJobAction. Params: " + JSON.stringify(data),
      "RabbitMQJobAction",
    );

    // Validate that all necessary params are present
    const requiredConnectionParams = [
      "hostname",
      "port",
      "username",
      "password",
    ];
    for (const param of requiredConnectionParams) {
      if (!data[param]) {
        throw new NotFoundException(`Missing connection parameter: ${param}`);
      }
    }

    const requiredBindingParams = ["exchange", "queue", "key"];
    for (const param of requiredBindingParams) {
      if (!data[param]) {
        throw new NotFoundException(`Missing binding parameter: ${param}`);
      }
    }
    this.connection = {
      protocol: "amqp",
      hostname: data.hostname as string,
      port: data.port as number,
      username: data.username as string,
      password: data.password as string,
    };
    this.binding = {
      exchange: data.exchange as string,
      queue: data.queue as string,
      key: data.key as string,
    };
  }

  getActionType(): string {
    return RabbitMQJobAction.actionType;
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing RabbitMQJobAction: " + JSON.stringify(job),
      "RabbitMQJobAction",
    );

    amqp.connect(
      this.connection,
      (connectionError: Error, connection: Connection) => {
        if (connectionError) {
          Logger.error(
            "Connection error in RabbitMQJobAction: " +
              JSON.stringify(connectionError.message),
            "RabbitMQJobAction",
          );
          return;
        }

        connection.createChannel((channelError: Error, channel) => {
          if (channelError) {
            Logger.error(
              "Channel error in RabbitMQJobAction: " +
                JSON.stringify(channelError.message),
              "RabbitMQJobAction",
            );
            return;
          }

          channel.assertQueue(this.binding.queue, { durable: true });
          channel.assertExchange(this.binding.exchange, "topic", {
            durable: true,
          });
          channel.bindQueue(
            this.binding.queue,
            this.binding.exchange,
            this.binding.key,
          );
          channel.sendToQueue(
            this.binding.queue,
            Buffer.from(JSON.stringify(job)),
          );

          channel.close(() => {
            connection.close();
          });
        });
      },
    );
  }
}
