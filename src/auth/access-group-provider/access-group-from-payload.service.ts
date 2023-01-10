import { AccessGroupService as AccessGroupService } from "./access-group.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OidcConfig } from "src/config/configuration";
import { UserPayload } from "../interfaces/userPayload.interface";

/**
 * This service is used to get the access groups from the payload of the IDP.
 */
@Injectable()
export class AccessGroupFromPayloadService extends AccessGroupService {
  constructor(private configService: ConfigService) {
    super();
  }

  async getAccessGroups(
    //idpPayload: Record<string, unknown>,
    userPayload: UserPayload
  ): Promise<string[]> {
    const defaultAccessGroups: string[] = [];

    //const oidcConfig = this.configService.get<OidcConfig>("oidc");
    //const accessGroupsProperty = oidcConfig?.accessGroups;
    const accessGroupsProperty = userPayload?.accessGroupProperty;

    if (!accessGroupsProperty) {
      return defaultAccessGroups;
    }
    if (!Array.isArray(userPayload.payload?[accessGroupsProperty] : [])) {
      return defaultAccessGroups;
    }

    return userPayload.payload?[accessGroupsProperty] as string[] : [];
  }
}
