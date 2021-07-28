import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatasetsModule } from './datasets/datasets.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), DatasetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
