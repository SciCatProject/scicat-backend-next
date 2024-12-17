import amqp, { Connection, Channel } from "amqplib/callback_api";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Service for publishing messages to a RabbitMQ queue.
 */
@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connectionOptions: amqp.Options.Connect;
  private connection: Connection;
  private channel: Channel;

  constructor(private configService: ConfigService) {
    Logger.log("Initializing RabbitMQService.", "RabbitMQService");

    const rabbitMqEnabled =
      (this.configService.get<string>("rabbitMq.enabled") === "yes");

    if (rabbitMqEnabled) {
      const hostname = this.configService.get<string>("rabbitMq.hostname");
      const port = this.configService.get<number>("rabbitMq.port");
      const username = this.configService.get<string>("rabbitMq.username");
      const password = this.configService.get<string>("rabbitMq.password");

      if (!hostname || !port || !username || !password) {
        Logger.error(
          "RabbitMQ is enabled but missing one or more config variables.",
          "RabbitMQService",
        );
      } else {
        this.connectionOptions = {
          protocol: "amqp",
          hostname: hostname,
          port: port,
          username: username,
          password: password,
        };

        amqp.connect(
          this.connectionOptions,
          (connectionError: Error, connection: Connection) => {
            if (connectionError) {
              Logger.error(
                "Connection error in RabbitMQService: " +
                  JSON.stringify(connectionError.message),
                "RabbitMQService",
              );
              return;
            }
            this.connection = connection;
    
            this.connection.createChannel(
              (channelError: Error, channel: Channel) => {
                if (channelError) {
                  Logger.error(
                    "Channel error in RabbitMQService: " +
                      JSON.stringify(channelError.message),
                    "RabbitMQService",
                  );
                  return;
                }
                this.channel = channel;
                Logger.log(this.channel);
              }
            );
          },
        );
      }
    } else {
      Logger.error("RabbitMQ is not enabled.", "RabbitMQService");
    }
  }

  connect(
    queue: string,
    exchange: string,
    key: string,
  ) {
    try {
      this.channel.assertQueue(queue, { durable: true });
      this.channel.assertExchange(exchange, "topic", {
        durable: true,
      });
      this.channel.bindQueue(queue, exchange, key);
    } catch (error) {
      Logger.error(
        `Could not connect to RabbitMQ queue ${queue} with exchange ${exchange} and key ${key}.`,
        "RabbitMQService",
      );
      Logger.error(error);
    }
  }

  sendMessage(
    queue: string,
    message: string,
  ) {
    try {
      this.channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true
      });
    } catch (error) {
      Logger.error(
        `Could not send message to RabbitMQ queue ${queue}.`,
        "RabbitMQService",
      );
    }
  }

  onModuleDestroy() {
    if (this.channel) {
      this.channel.close(() => {
        Logger.log("RabbitMQ channel closed.", "RabbitMQService");
      });
    }
    if (this.connection) {
      this.connection.close(() => {
        Logger.log("RabbitMQ connection closed.", "RabbitMQService");
      });
    }
  }
}
