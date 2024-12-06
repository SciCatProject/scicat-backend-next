import { Logger } from "@nestjs/common";
import amqp, { Connection } from "amqplib/callback_api";
import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import {
  actionType,
  RabbitMQJobActionOptions,
} from "./rabbitmqaction.interface";

/**
 * Publish a message in a RabbitMQ queue
 */
export class RabbitMQJobAction<T extends JobDto> implements JobAction<T> {
  public static readonly actionType = "rabbitmq";
  private connection;
  private binding;

  constructor(options: RabbitMQJobActionOptions) {
    Logger.log(
      "Initializing RabbitMQJobAction. Params: " + JSON.stringify(options),
      "RabbitMQJobAction",
    );

    this.connection = {
      protocol: "amqp",
      hostname: options.hostname,
      port: options.port,
      username: options.username,
      password: options.password,
    };
    this.binding = {
      exchange: options.exchange,
      queue: options.queue,
      key: options.key,
    };
  }

  getActionType(): string {
    return actionType;
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
