import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Job, JobSchema } from "./schemas/job.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsModule } from "src/datasets/datasets.module";
import { PoliciesModule } from "src/policies/policies.module";

@Module({
  controllers: [JobsController],
  imports: [
    DatasetsModule,
    MongooseModule.forFeatureAsync([
      {
        name: Job.name,
        useFactory: () => {
          const schema = JobSchema;

          schema.pre<Job>("save", function (next) {
            // if _id is empty or different than id,
            // set _id to id
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
  ],
  providers: [JobsService, CaslAbilityFactory],
})
export class JobsModule {}
