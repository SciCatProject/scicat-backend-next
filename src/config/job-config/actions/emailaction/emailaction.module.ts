import { Module } from "@nestjs/common";
import { EmailJobActionCreator } from "./emailaction.service";
import { CommonModule } from "src/common/common.module";

@Module({
  imports: [CommonModule],
  providers: [EmailJobActionCreator],
  exports: [EmailJobActionCreator],
})
export class EmailJobActionModule {}
