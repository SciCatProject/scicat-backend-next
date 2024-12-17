import { Module } from "@nestjs/common";
import { CommonModule } from "src/common/common.module";
import { RabbitMQJobActionCreator } from "./rabbitmqaction.service";

@Module({
  imports: [CommonModule],
  providers: [RabbitMQJobActionCreator],
  exports: [RabbitMQJobActionCreator],
})
export class RabbitMQJobActionModule {}
