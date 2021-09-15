import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatasetsModule } from './datasets/datasets.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest', {
      useFindAndModify: false,
    }),
    DatasetsModule,
    AuthModule,
    UsersModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
