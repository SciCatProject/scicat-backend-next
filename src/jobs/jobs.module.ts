import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Job, JobSchema } from "./schemas/job.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";

@Module({
  controllers: [JobsController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Job.name,
        schema: JobSchema,
      },
    ]),
  ],
  providers: [JobsService, CaslAbilityFactory],
})
export class JobsModule {}
