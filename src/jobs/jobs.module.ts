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

@Module({
  controllers: [JobsController],
  imports: [
    CommonModule,
    ConfigModule,
    DatasetsModule,
    MongooseModule.forFeatureAsync([
      {
        name: JobClass.name,
        // schema: JobSchema,
        useFactory: () => {
          const schema = JobSchema;

          schema.pre<JobClass>("save", function (next) {
            // if _id is empty or different than job id,
            // set _id to job id
            if (!this._id) {
              this._id = this.id;
            }
            next();
          });
          return schema;
        },
      },
    ]),
    PoliciesModule,
    OrigDatablocksModule,
  ],
  providers: [JobsService, CaslAbilityFactory],
})
export class JobsModule {}
