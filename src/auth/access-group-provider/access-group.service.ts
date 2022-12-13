export abstract class AccessGroupService {
  abstract getAccessGroups(
    idpPayload: Record<string, unknown>,
  ): Promise<string[]>;
}
