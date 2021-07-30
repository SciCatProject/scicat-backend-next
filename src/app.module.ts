import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatasetsModule } from './datasets/datasets.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), DatasetsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
