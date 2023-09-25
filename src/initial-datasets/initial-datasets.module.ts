import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InitialDatasetsService } from "./initial-datasets.service";
import {
  InitialDataset,
  InitialDatasetSchema,
} from "./schemas/initial-dataset.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: InitialDataset.name,
        schema: InitialDatasetSchema,
      },
    ]),
  ],
  exports: [InitialDatasetsService],
  providers: [InitialDatasetsService],
})
export class InitialDatasetsModule {}
