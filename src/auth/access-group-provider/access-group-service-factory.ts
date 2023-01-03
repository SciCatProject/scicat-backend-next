import { ConfigService } from "@nestjs/config";
import { AccessGroupFromStaticValuesService } from "./access-group-from-static-values.service";
import { AccessGroupService } from "./access-group.service";

/*
 * this is the default function which provides an empty array as groups
 */
export const accessGroupServiceFactory = {
  provide: AccessGroupService,
  useFactory: (configService: ConfigService) => {
    const site = configService.get<string>("site");
    return new AccessGroupFromStaticValuesService([]);
  },
  inject: [ConfigService],
};
