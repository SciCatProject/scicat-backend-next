import { Module } from "@nestjs/common";
import { EmailJobActionFactory } from "./emailaction.factory";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [CommonModule],
  providers: [EmailJobActionFactory],
  exports: [EmailJobActionFactory],
})
export class EmailJobActionModule {}
