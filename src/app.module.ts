import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatasetsModule } from './datasets/datasets.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://localhost/nestdacat',
      {
        useFindAndModify: false
      }
      ), DatasetsModule, AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
