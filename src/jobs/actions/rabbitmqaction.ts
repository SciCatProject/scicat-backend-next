import { Logger, NotFoundException } from "@nestjs/common";
import amqp, { Connection } from "amqplib/callback_api";
import { JobAction } from "../config/jobconfig";
import { JobClass } from "../schemas/job.schema";


/**
 * Publish a message following a job status update
 */
export class RabbitMQJobAction<T> implements JobAction<T> {
  public static readonly actionType = "rabbitmq";
  private connectionDetails;
  private queueName;

  constructor(data: Record<string, any>) {
    Logger.log(
      "Initializing RabbitMQJobAction. Params: " + JSON.stringify(data),
      "RabbitMQJobAction",
    );

    this.connectionDetails = {
      protocol: "amqp",
      hostname: data.hostname,
      port: data.port,
      username: data.username,
      password: data.password,
    };
    this.queueName = data.queue;
  }

  getActionType(): string {
    return RabbitMQJobAction.actionType;
  }

  async validate(dto: T) {
    Logger.log(
      "Validating RabbitMQJobAction: " + JSON.stringify(dto),
      "RabbitMQJobAction",
    );

    if ([undefined, ""].some(el => Object.values(this.connectionDetails).includes(el))) {
      throw new NotFoundException("Configuration is missing connection details.");
    }
    if (this.queueName == undefined || this.queueName == "") {
      throw new NotFoundException("Queue name is not defined.");
    }
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing RabbitMQJobAction: " + JSON.stringify(job),
      "RabbitMQJobAction",
    );

    amqp.connect(this.connectionDetails, (connectionError: Error, connection: Connection) => {
      if (connectionError) {
        console.log(connectionError);
        Logger.log(
          "Connection error in RabbitMQJobAction: " + JSON.stringify(connectionError.message),
          "RabbitMQJobAction",
        );
        return;
      }

      connection.createChannel((channelError: Error, channel) => {
        if (channelError) {
          Logger.log(
            "Channel error in RabbitMQJobAction: " + JSON.stringify(channelError.message),
            "RabbitMQJobAction",
          );
          return;
        }

        channel.assertQueue(this.queueName, {
          durable: true
        });

        const msg = `StatusUpdate Job ${job.id}`;
        channel.sendToQueue(this.queueName, Buffer.from(msg));
        Logger.log(
          "Published message: " + msg,
          "RabbitMQJobAction",
        );

        channel.close(() => {
          connection.close();
        });
      });
    });
  }
}
