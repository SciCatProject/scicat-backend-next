import { Module } from "@nestjs/common";
import { JobConfigService } from "./jobconfig.service";
import { ConfigModule } from "@nestjs/config";
import { DefaultJobActionFactories } from "./actions/defaultjobactions.module";

@Module({
  imports: [ConfigModule, DefaultJobActionFactories],
  providers: [JobConfigService],
  exports: [JobConfigService],
})
export class JobConfigModule {}
