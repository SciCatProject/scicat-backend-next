import { Module } from "@nestjs/common";
import { LogbooksService } from "./logbooks.service";
import { LogbooksController } from "./logbooks.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { ProposalsModule } from "src/proposals/proposals.module";

@Module({
  imports: [
    ConfigModule,
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
  controllers: [LogbooksController],
  providers: [LogbooksService, CaslAbilityFactory],
})
export class LogbooksModule {}
