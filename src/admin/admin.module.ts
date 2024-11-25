import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
  controllers: [AdminController],
  imports: [ConfigModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
