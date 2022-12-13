import { ConfigService } from "@nestjs/config";
import { AccessGroupService } from "./access-group.service";
import { ApiCallAccessGroupService } from "./api-call-access-group.service";

export const getAccessGroupsServiceFactory = {
  provide: AccessGroupService,
  useFactory: (configService: ConfigService) => {
    if (configService.get<string>("site") === "ESS") {
      return new ApiCallAccessGroupService();
    } else {
      throw new Error("Not implemented");
    }
  },
};
