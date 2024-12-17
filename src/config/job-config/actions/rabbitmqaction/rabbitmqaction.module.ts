import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitMQJobActionCreator } from "./rabbitmqaction.service";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [
    CommonModule,
    ConfigModule,
  ],
  providers: [RabbitMQJobActionCreator],
  exports: [RabbitMQJobActionCreator],
})
export class RabbitMQJobActionModule {}
