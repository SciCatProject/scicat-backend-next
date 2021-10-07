import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatasetsModule } from './datasets/datasets.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from './casl/casl.module';
import configuration from './config/configuration';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    DatasetsModule,
    MongooseModule.forRoot('mongodb://localhost/nest'),
    UsersModule,
    CaslModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
