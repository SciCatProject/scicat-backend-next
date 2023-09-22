import {Module} from "@nestjs/common";
import {AdminService} from "./admin.service";
import {AdminController} from "./admin.controller";

@Module({
  controllers: [AdminController],
  imports: [],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
