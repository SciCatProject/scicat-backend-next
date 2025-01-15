import { Module } from "@nestjs/common";
import { ValidateJobActionCreator } from "./validateaction.service";

@Module({
  providers: [ValidateJobActionCreator],
  exports: [ValidateJobActionCreator],
})
export class ValidateJobActionModule {}
