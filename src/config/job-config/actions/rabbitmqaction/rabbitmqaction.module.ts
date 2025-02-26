import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "src/common/common.module";
import { RabbitMQJobActionCreator } from "./rabbitmqaction.service";

@Module({
  imports: [ConfigModule, CommonModule],
  providers: [RabbitMQJobActionCreator],
  exports: [RabbitMQJobActionCreator],
})
export class RabbitMQJobActionModule {}
