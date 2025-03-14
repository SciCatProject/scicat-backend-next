import { Module } from "@nestjs/common";
import {
  SwitchCreateJobActionCreator,
  SwitchUpdateJobActionCreator,
} from "./switchaction.service";

@Module({
  providers: [SwitchUpdateJobActionCreator, SwitchCreateJobActionCreator],
  exports: [SwitchUpdateJobActionCreator, SwitchCreateJobActionCreator],
})
export class SwitchJobActionModule {}
