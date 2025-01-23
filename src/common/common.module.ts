import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service";
import { RabbitMQService } from "./rabbitmq/rabbitmq.service";

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: RabbitMQService,
      useFactory: (configService: ConfigService) => {
        const isEnabled =
          configService.get<string>("rabbitMq.enabled") === "yes";
        if (isEnabled) {
          return new RabbitMQService(configService);
        }
        return null;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MailService, RabbitMQService],
})
export class CommonModule {}
