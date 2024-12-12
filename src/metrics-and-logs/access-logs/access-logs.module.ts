import { Module } from "@nestjs/common";
import { AccessLogsService } from "./access-logs.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AccessLog, AccessLogSchema } from "./schemas/access-log.schema";
import { AccessLogsController } from "./access-logs.controller";
import { CaslModule } from "src/casl/casl.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AccessLog.name,
        schema: AccessLogSchema,
      },
    ]),
    CaslModule,
  ],
  providers: [AccessLogsService, AccessLogsController],
  exports: [AccessLogsService, AccessLogsController],
  controllers: [AccessLogsController],
})
export class AccessLogsModule {}
