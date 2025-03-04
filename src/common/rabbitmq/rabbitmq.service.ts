import amqp, { Connection, Channel } from "amqplib/callback_api";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Service for publishing messages to a RabbitMQ queue.
 */
@Injectable()
export class RabbitMQService implements OnModuleDestroy, OnApplicationShutdown {
  private connectionOptions: amqp.Options.Connect;
  private connection: Connection;
  private channel: Channel;

  constructor(private readonly configService: ConfigService) {
    Logger.log("Initializing RabbitMQService.", "RabbitMQService");

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
            },
          );
        },
      );
    }
  }

  private connect(queue: string, exchange: string, key: string) {
    try {
      this.channel.assertQueue(queue, { durable: true });
      this.channel.assertExchange(exchange, "topic", {
        durable: true,
      });
      this.channel.bindQueue(queue, exchange, key);
    } catch (error) {
      throw new Error(
        `Could not connect to RabbitMQ queue ${queue} with exchange ${exchange} and key ${key}.`,
        { cause: error },
      );
    }
  }

  sendMessage(queue: string, exchange: string, key: string, message: string) {
    try {
      this.connect(queue, exchange, key);
      this.channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true,
      });
    } catch (error) {
      throw new Error(`Could not send message to RabbitMQ queue ${queue}.`, {
        cause: error,
      });
    }
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close(() => {
        Logger.log("RabbitMQ channel closed.", "RabbitMQService");
      });
    }
    if (this.connection) {
      await this.connection.close(() => {
        Logger.log("RabbitMQ connection closed.", "RabbitMQService");
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.close();
  }
}
