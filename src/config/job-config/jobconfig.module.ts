import { Module } from "@nestjs/common";
import { JobConfigService } from "./jobconfig.service";
import { ConfigModule } from "@nestjs/config";
import { CoreJobActionCreators } from "./actions/corejobactioncreators.module";

@Module({
  imports: [ConfigModule, CoreJobActionCreators],
  providers: [JobConfigService],
  exports: [JobConfigService],
})
export class JobConfigModule {}
