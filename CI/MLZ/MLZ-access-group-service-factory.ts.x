import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
//import { AccessGroupFromOidcApiService } from "./access-group-from-oidc.service";
import { AccessGroupFromMultipleProvidersService } from "./access-group-from-multiple-providers.service";
import { AccessGroupFromPayloadService } from "./access-group-from-payload.service";
import { AccessGroupFromStaticValuesService } from "./access-group-from-static-values.service";
import { AccessGroupService } from "./access-group.service";

export const accessGroupServiceFactory = {
  provide: AccessGroupService,
  useFactory: (configService: ConfigService) => {
    return getMLZAccessGroupService(configService);
  },
  inject: [ConfigService],
};

function getMLZAccessGroupService(configService: ConfigService) {
  const accessGroupsStaticValues = configService.get(
    "accessGroupsStaticValues",
  );
  const fromPayload =  new AccessGroupFromPayloadService(configService);
  const fromStatic = new AccessGroupFromStaticValuesService(
    accessGroupsStaticValues,
  );

  const fromMultiple = new AccessGroupFromMultipleProvidersService([
    fromPayload,
    fromStatic,
  ]);

  return fromMultiple;
}

