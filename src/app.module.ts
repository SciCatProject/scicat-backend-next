import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DatasetsModule } from "./datasets/datasets.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CaslModule } from "./casl/casl.module";
import configuration from "./config/configuration";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { AttachmentsModule } from "./attachments/attachments.module";
import { OrigdatablocksModule } from "./origdatablocks/origdatablocks.module";
import { DatablocksModule } from "./datablocks/datablocks.module";
import { ProposalsModule } from "./proposals/proposals.module";
import { SamplesModule } from "./samples/samples.module";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    DatasetsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("mongodbUri"),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CaslModule,
    AttachmentsModule,
    OrigdatablocksModule,
    DatablocksModule,
    ProposalsModule,
    SamplesModule,
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
