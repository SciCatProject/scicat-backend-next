import { Module } from "@nestjs/common";
import { LogbooksService } from "./logbooks.service";
import { LogbooksController } from "./logbooks.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { ProposalsModule } from "src/proposals/proposals.module";
import { CaslModule } from "src/casl/casl.module";

@Module({
  imports: [
    ConfigModule,
    CaslModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get("httpTimeOut"),
        maxRedirects: configService.get("httpMaxRedirects"),
      }),
      inject: [ConfigService],
    }),
    ProposalsModule,
  ],
  exports: [LogbooksService],
  controllers: [LogbooksController],
  providers: [LogbooksService],
})
export class LogbooksModule {}
