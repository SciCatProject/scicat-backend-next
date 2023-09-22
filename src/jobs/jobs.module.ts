<<<<<<< HEAD
import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { JobClass, JobSchema } from "./schemas/job.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsModule } from "src/datasets/datasets.module";
import { PoliciesModule } from "src/policies/policies.module";
import { CommonModule } from "src/common/common.module";
import { ConfigModule } from "@nestjs/config";
import { OrigDatablocksModule } from "src/origdatablocks/origdatablocks.module";
=======
import {Module} from "@nestjs/common";
import {JobsService} from "./jobs.service";
import {JobsController} from "./jobs.controller";
import {MongooseModule} from "@nestjs/mongoose";
import {Job, JobSchema} from "./schemas/job.schema";
import {CaslAbilityFactory} from "src/casl/casl-ability.factory";
import {DatasetsModule} from "src/datasets/datasets.module";
import {PoliciesModule} from "src/policies/policies.module";
import {CommonModule} from "src/common/common.module";
import {ConfigModule} from "@nestjs/config";
import {OrigDatablocksModule} from "src/origdatablocks/origdatablocks.module";
>>>>>>> b35ceca7 (fix: fix lint issue)

@Module({
  controllers: [JobsController],
  imports: [
    CommonModule,
    ConfigModule,
    DatasetsModule,
    MongooseModule.forFeature([
      {
        name: JobClass.name,
        schema: JobSchema,
      },
    ]),
    PoliciesModule,
    OrigDatablocksModule,
  ],
  providers: [JobsService, CaslAbilityFactory],
})
export class JobsModule {}
