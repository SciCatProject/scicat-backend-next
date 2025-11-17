import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RuntimeConfigService } from "./runtime-config.service";
import { RuntimeConfigController } from "./runtime-config.controller";
import {
  RuntimeConfig,
  RuntimeConfigSchema,
} from "./schemas/runtime-config.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RuntimeConfig.name,
        schema: RuntimeConfigSchema,
      },
    ]),
  ],
  controllers: [RuntimeConfigController],
  providers: [RuntimeConfigService],
  exports: [RuntimeConfigService],
})
export class RuntimeConfigModule {}
