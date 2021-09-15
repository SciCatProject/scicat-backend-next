import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dataset, DatasetSchema } from './schemas/dataset.schema';
import { DatasetsController } from './datasets.controller';
import { DatasetsService } from './datasets.service';
import { RawDatasetSchema } from './schemas/raw-dataset.schema';
import { DerivedDatasetSchema } from './schemas/derived-dataset.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Dataset.name,
        schema: DatasetSchema,
        discriminators: [
          { name: 'raw', schema: RawDatasetSchema },
          { name: 'derived', schema: DerivedDatasetSchema },
        ],
      },
    ]),
  ],
  controllers: [DatasetsController],
  providers: [DatasetsService],
})
export class DatasetsModule {}
