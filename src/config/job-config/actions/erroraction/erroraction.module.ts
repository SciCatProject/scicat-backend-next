import { Module } from "@nestjs/common";
import { ErrorJobActionCreator } from "./erroraction.service";

@Module({
  providers: [ErrorJobActionCreator],
  exports: [ErrorJobActionCreator],
})
export class ErrorJobActionModule {}
