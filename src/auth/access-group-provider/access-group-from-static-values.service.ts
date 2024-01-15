import { Injectable, Logger } from "@nestjs/common";
import { AccessGroupService } from "./access-group.service";

/**
 * This service is used to get the access groups from a static list of values.
 */
@Injectable()
export class AccessGroupFromStaticValuesService extends AccessGroupService {
  constructor(private staticAccessGroups: string[]) {
    super();
  }

  async getAccessGroups(): Promise<string[]> {
    // Logger.log(
    //   "Static access group getAccessGroups : " +
    //     this.staticAccessGroups.join(","),
    // );
    return this.staticAccessGroups;
  }
}
