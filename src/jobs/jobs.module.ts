import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { JobClass, JobSchema } from "./schemas/job.schema";
import { DatasetsModule } from "src/datasets/datasets.module";
import { PoliciesModule } from "src/policies/policies.module";
import { OrigDatablocksModule } from "src/origdatablocks/origdatablocks.module";
import { UsersModule } from "src/users/users.module";
import { JobConfigService } from "../config/job-config/jobconfig.service";
import { CoreJobActionCreators } from "../config/job-config/actions/corejobactioncreators.module";
import { EmailJobActionCreator } from "src/config/job-config/actions/emailaction/emailaction.service";
import { CommonModule } from "src/common/common.module";
import { CaslModule } from "src/casl/casl.module";

@Module({
  controllers: [JobsController],
  imports: [
    CommonModule,
    CoreJobActionCreators,
    DatasetsModule,
    UsersModule,
    CaslModule,
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
  providers: [JobsService, JobConfigService, EmailJobActionCreator],
})
export class JobsModule {}
