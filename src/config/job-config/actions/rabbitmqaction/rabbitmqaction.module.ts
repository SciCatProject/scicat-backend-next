import { Module } from "@nestjs/common";
import { RabbitMQJobActionFactory } from "./rabbitmqaction.factory";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [CommonModule],
  providers: [RabbitMQJobActionFactory],
  exports: [RabbitMQJobActionFactory],
})
export class RabbitMQJobActionModule {}
