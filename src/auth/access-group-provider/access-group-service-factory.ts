import { ConfigService } from "@nestjs/config";
import { AccessGroupFromStaticValuesService } from "./access-group-from-static-values.service";
import { AccessGroupService } from "./access-group.service";
import { AccessGroupFromGraphQLApiService } from "./access-group-from-graphql-api-call.service";
import { AccessGroupFromPayloadService } from "./access-group-from-payload.service";
import { HttpService } from "@nestjs/axios";
import { AccessGroupFromMultipleProvidersService } from "./access-group-from-multiple-providers.service";
import { Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
/*
 * this is the default function which provides an empty array as groups
 */
export const accessGroupServiceFactory = {
  imports: [ConfigModule],
  provide: AccessGroupService,
  useFactory: (configService: ConfigService) => {
    Logger.debug("Service factory starting");
    const accessGroupsStaticConfig = configService.get(
      "accessGroupsStaticConfig",
    );
    const accessGroupsGraphQlConfig = configService.get(
      "accessGroupsGraphQlConfig",
    );
    const accessGroupsOIDCPayloadConfig = configService.get(
      "accessGroupsOIDCPayloadConfig",
    );

    const accessGroupServices: AccessGroupService[] = [];
    if (accessGroupsStaticConfig?.enabled == true) {
      accessGroupServices.push(
        new AccessGroupFromStaticValuesService(accessGroupsStaticConfig.value),
      );
    }
    if (accessGroupsOIDCPayloadConfig?.enabled == true) {
      Logger.log("loading oidc processor");
      accessGroupServices.push(
        new AccessGroupFromPayloadService(configService),
      );
    }
    Logger.log(accessGroupsGraphQlConfig);

    if (accessGroupsGraphQlConfig?.enabled == true) {
      Logger.log("loading graphql processor");
      import(accessGroupsGraphQlConfig.responseProcessorSrc).then(
        (rpModule) => {
          const gh = rpModule.graphHandler;
          const responseProcessor: (
            response: Record<string, unknown>,
          ) => string[] = gh.responseProcessor;
          const graphqlTemplateQuery: string = gh.graphqlTemplateQuery;
          accessGroupServices.push(
            new AccessGroupFromGraphQLApiService(
              graphqlTemplateQuery,
              accessGroupsGraphQlConfig.apiUrl,
              {
                Authorization: `Bearer ${accessGroupsGraphQlConfig.token}`,
              },
              responseProcessor,
              new HttpService(),
            ),
          );
        },
      );
    }

    return new AccessGroupFromMultipleProvidersService(accessGroupServices);
  },
  inject: [ConfigService],
};
