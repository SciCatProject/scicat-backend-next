import { AccessGroupService as AccessGroupService } from "./access-group.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AccessGroupFromPayloadService extends AccessGroupService {
  async getAccessGroups(
    idpPayload: Record<string, unknown>,
  ): Promise<string[]> {
    throw new Error("Not implemented");
  }
}
