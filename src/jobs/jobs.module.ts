<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 37d12183 (fix: lint issue fix)
import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { MongooseModule } from "@nestjs/mongoose";
<<<<<<< HEAD
import { JobClass, JobSchema } from "./schemas/job.schema";
=======
import { Job, JobSchema } from "./schemas/job.schema";
>>>>>>> 37d12183 (fix: lint issue fix)
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsModule } from "src/datasets/datasets.module";
import { PoliciesModule } from "src/policies/policies.module";
import { CommonModule } from "src/common/common.module";
import { ConfigModule } from "@nestjs/config";
import { OrigDatablocksModule } from "src/origdatablocks/origdatablocks.module";
<<<<<<< HEAD
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
=======
>>>>>>> 37d12183 (fix: lint issue fix)

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
