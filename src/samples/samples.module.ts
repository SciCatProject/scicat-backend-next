import { Module } from "@nestjs/common";
import { SamplesService } from "./samples.service";
import { SamplesController } from "./samples.controller";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { DatasetsModule } from "src/datasets/datasets.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Sample, SampleSchema } from "./schemas/sample.schema";

@Module({
  imports: [
    AttachmentsModule,
    DatasetsModule,
    MongooseModule.forFeatureAsync([
      {
        name: Sample.name,
        useFactory: () => {
          const schema = SampleSchema;

          schema.pre<Sample>("save", function (next) {
            // if _id is empty or different than sampleId,
            // set _id to sampleId
            if (!this._id) {
              this._id = this.sampleId;
            }
            next();
          });
          return schema;
        },
      },
    ]),
  ],
  controllers: [SamplesController],
  providers: [SamplesService],
})
export class SamplesModule {}
