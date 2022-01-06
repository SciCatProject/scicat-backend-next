import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Dataset, DatasetSchema } from "./schemas/dataset.schema";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";
import { RawDatasetSchema } from "./schemas/raw-dataset.schema";
import { DerivedDatasetSchema } from "./schemas/derived-dataset.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    AttachmentsModule,
    ConfigModule,
    MongooseModule.forFeatureAsync([
      {
        name: Dataset.name,
        discriminators: [
          { name: "raw", schema: RawDatasetSchema },
          { name: "derived", schema: DerivedDatasetSchema },
        ],

        //schema: DatasetSchema,
        useFactory: () => {
          const schema = DatasetSchema;

          schema.pre<Dataset>("save", function (next) {
            // if _id is empty or differnet than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.pid;
            }
            next();
          });

          return schema;
        },
      },
    ]),
  ],
  controllers: [DatasetsController],
  providers: [DatasetsService, CaslAbilityFactory],
})
export class DatasetsModule {}
