import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailService } from "./mail.service";
import { RabbitMQService } from "./rabbitmq/rabbitmq.service";

@Module({
  imports: [ConfigModule],
  providers: [MailService, RabbitMQService],
  exports: [MailService, RabbitMQService],
})
export class CommonModule {}
