import { Module } from "@nestjs/common";
import { URLJobActionCreator } from "./urlaction.service";

@Module({
  providers: [URLJobActionCreator],
  exports: [URLJobActionCreator],
})
export class URLJobActionModule {}
