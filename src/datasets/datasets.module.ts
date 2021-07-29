import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Dataset, DatasetSchema } from './dataset.schema';
import { DatasetsController } from './datasets.controller';
import { DatasetsService } from './datasets.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dataset.name, schema: DatasetSchema }]),
  ],
  controllers: [DatasetsController],
  providers: [DatasetsService],
})
export class DatasetsModule {}
