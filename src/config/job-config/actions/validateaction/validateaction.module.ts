import { Module } from "@nestjs/common";
import { ValidateJobActionFactory } from "./validateaction.factory";

@Module({
  providers: [ValidateJobActionFactory],
  exports: [ValidateJobActionFactory],
})
export class ValidateJobActionModule {}
