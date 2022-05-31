import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Job, JobSchema } from "./schemas/job.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsModule } from "src/datasets/datasets.module";
import { PoliciesModule } from "src/policies/policies.module";
import { CommonModule } from "src/common/common.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  controllers: [JobsController],
  imports: [
    CommonModule,
    ConfigModule,
    DatasetsModule,
    MongooseModule.forFeature([
      {
        name: Job.name,
        schema: JobSchema,
      },
    ]),
    PoliciesModule,
  ],
  providers: [JobsService, CaslAbilityFactory],
})
export class JobsModule {}
