import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Job, JobSchema } from "./schemas/job.schema";

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
  providers: [JobsService],
})
export class JobsModule {}
