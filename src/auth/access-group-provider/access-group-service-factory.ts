import { ConfigService } from "@nestjs/config";
import { AccessGroupFromApiCallService } from "./access-group-from-api-call.service";
import { AccessGroupFromPayloadService } from "./access-group-from-payload.service copy";
import { AccessGroupService } from "./access-group.service";

export const accessGroupServiceFactory = {
  provide: AccessGroupService,
  useFactory: (configService: ConfigService) => {
    if (configService.get<string>("site") === "ESS") {
      return new AccessGroupFromApiCallService();
    } else {
      return new AccessGroupFromPayloadService(configService);
    }
  },
  inject: [ConfigService],
};
