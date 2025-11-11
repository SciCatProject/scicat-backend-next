import { Module } from "@nestjs/common";
import { AppConfigService } from "./app-config.service";
import { AppConfigController } from "./app-config.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { AppConfig, AppConfigSchema } from "./schemas/app-config.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AppConfig.name,
        schema: AppConfigSchema,
      },
    ]),
  ],
  controllers: [AppConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
