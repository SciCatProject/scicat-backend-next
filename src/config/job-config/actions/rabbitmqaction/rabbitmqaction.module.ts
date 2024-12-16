import { Module } from "@nestjs/common";
import { RabbitMQJobActionCreator } from "./rabbitmqaction.service";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [CommonModule],
  providers: [RabbitMQJobActionCreator],
  exports: [RabbitMQJobActionCreator],
})
export class RabbitMQJobActionModule {}
