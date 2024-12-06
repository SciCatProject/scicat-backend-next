import { Module } from "@nestjs/common";
import { URLJobActionFactory } from "./urlaction.factory";

@Module({
  providers: [URLJobActionFactory],
  exports: [URLJobActionFactory],
})
export class URLJobActionModule {}
