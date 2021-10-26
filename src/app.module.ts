import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatasetsModule } from './datasets/datasets.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CaslModule } from './casl/casl.module';
import configuration from './config/configuration';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (ref) => new JwtAuthGuard(ref),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
