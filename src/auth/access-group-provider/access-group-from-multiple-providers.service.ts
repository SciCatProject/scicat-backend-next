import { Injectable } from "@nestjs/common";
import { AccessGroupService } from "./access-group.service";

/**
 * This service is used to get the access groups from multiple providers.
 */
@Injectable()
export class AccessGroupFromMultipleProvidersService extends AccessGroupService {
  constructor(private accessGroupProviders: AccessGroupService[]) {
    super();
  }

  async getAccessGroups(
    idpPayload: Record<string, unknown>,
  ): Promise<string[]> {
    const accessGroups: string[] = [];

    for (const accessGroupProvider of this.accessGroupProviders) {
      const accessGroupsFromProvider =
        await accessGroupProvider.getAccessGroups(idpPayload);
      accessGroups.push(...accessGroupsFromProvider);
    }

    return accessGroups;
  }
}
