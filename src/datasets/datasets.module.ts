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
    MongooseModule.forFeature([
      {
        name: Dataset.name,
        schema: DatasetSchema,
        discriminators: [
          { name: "raw", schema: RawDatasetSchema },
          { name: "derived", schema: DerivedDatasetSchema },
        ],
      },
    ]),
  ],
  controllers: [DatasetsController],
  providers: [DatasetsService, CaslAbilityFactory],
})
export class DatasetsModule {}
