import { Logger } from "@nestjs/common";
import amqp, { Connection } from "amqplib/callback_api";
import { JobAction, JobDto } from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import {
  actionType,
  RabbitMQJobActionOptions,
} from "./rabbitmqaction.interface";
import { ConfigService } from "@nestjs/config";

/**
 * Publish a message in a RabbitMQ queue
 */
export class RabbitMQJobAction<T extends JobDto> implements JobAction<T> {
  private connection: amqp.Options.Connect;
  private binding: RabbitMQJobActionOptions;
  private rabbitMqReady: boolean = false;

  getActionType(): string {
    return actionType;
  }

  constructor(
    private configService: ConfigService,
    options: RabbitMQJobActionOptions,
  ) {
    Logger.log(
      "Initializing RabbitMQJobAction. Params: " + JSON.stringify(options),
      "RabbitMQJobAction",
    );

    const rabbitMqEnabled =
    this.configService.get<string>("rabbitMq.enabled") === "yes"
      ? true
      : false;

    if (rabbitMqEnabled) {
      const hostname = this.configService.get<string>("rabbitMq.hostname");
      const port = this.configService.get<number>("rabbitMq.port");
      const username = this.configService.get<string>("rabbitMq.username");
      const password = this.configService.get<string>("rabbitMq.password");

      if (!hostname || !port || !username || !password) {
        Logger.error(
          "RabbitMQ is enabled but missing one or more config variables.",
          "RabbitMQJobAction",
        );
      }
      else {
        this.connection = {
          protocol: "amqp",
          hostname: hostname,
          port: port,
          username: username,
          password: password,
        };
        this.binding = {
          actionType: actionType,
          exchange: options.exchange,
          queue: options.queue,
          key: options.key,
        };
        this.rabbitMqReady = true;
      }
    }
    else {
      Logger.error(
        "RabbitMQ is not enabled.",
        "RabbitMQJobAction",
      );
    }
  }

  async performJob(job: JobClass) {
    Logger.log(
      "Performing RabbitMQJobAction: " + JSON.stringify(job),
      "RabbitMQJobAction",
    );

    if (this.rabbitMqReady) {
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
    else {
      Logger.error(
        "RabbitMQ is either not enabled or not configured properly.",
        "RabbitMQJobAction",
      );
    }
  }
}
