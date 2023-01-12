import { AccessGroupService as AccessGroupService } from "./access-group.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
    userPayload: UserPayload
  ): Promise<string[]> {
    const defaultAccessGroups: string[] = [];

    const accessGroupsProperty = userPayload?.accessGroupProperty;

    if (!accessGroupsProperty) {
      return defaultAccessGroups;
    }
    const payload : Record<string, unknown> | undefined = userPayload.payload;
    if ( payload !== undefined ) {
      if (!Array.isArray(payload[accessGroupsProperty])) {
        return defaultAccessGroups;
      }

      return payload[accessGroupsProperty] !== undefined ? payload[accessGroupsProperty] as string[] : [];
    }
    return [];
  }
}
