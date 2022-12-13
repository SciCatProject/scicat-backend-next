import { AccessGroupService as AccessGroupService } from "./access-group.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OidcConfig } from "src/config/configuration";

@Injectable()
export class AccessGroupFromPayloadService extends AccessGroupService {
  constructor(private configService: ConfigService) {
    super();
  }

  async getAccessGroups(
    idpPayload: Record<string, unknown>,
  ): Promise<string[]> {
    const defaultAccessGroups: string[] = [];

    const configs = this.configService.get<OidcConfig>("oidc");
    const userInfoResponseObjectAccessGroupKey = configs?.accessGroups;

    if (!userInfoResponseObjectAccessGroupKey) {
      return defaultAccessGroups;
    }
    if (!Array.isArray(idpPayload[userInfoResponseObjectAccessGroupKey])) {
      return defaultAccessGroups;
    }

    return idpPayload[userInfoResponseObjectAccessGroupKey] as string[];
  }
}
