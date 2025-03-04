import { Module } from "@nestjs/common";
import {
  ValidateCreateJobActionCreator,
  ValidateJobActionCreator,
} from "./validateaction.service";

@Module({
  providers: [ValidateJobActionCreator, ValidateCreateJobActionCreator],
  exports: [ValidateJobActionCreator, ValidateCreateJobActionCreator],
})
export class ValidateJobActionModule {}
