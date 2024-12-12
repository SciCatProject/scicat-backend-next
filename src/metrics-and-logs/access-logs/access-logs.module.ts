import { Module } from "@nestjs/common";
import { AccessLogsService } from "./access-logs.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AccessLogs, AccessLogSchema } from "./schemas/access-log.schema";
import { AccessLogsController } from "./access-logs.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AccessLogs.name,
        schema: AccessLogSchema,
      },
    ]),
  ],
  providers: [AccessLogsService, AccessLogsController],
  exports: [AccessLogsController],
})
export class AccessLogsModule {}
