import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitMQModule } from "src/common/rabbitmq/rabbitmq.module";
import { RabbitMQJobActionCreator } from "./rabbitmqaction.service";

@Module({
  imports: [ConfigModule, RabbitMQModule],
  providers: [RabbitMQJobActionCreator],
  exports: [RabbitMQJobActionCreator],
})
export class RabbitMQJobActionModule {}
