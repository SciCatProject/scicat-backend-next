import { AccessGroupService as AccessGroupService } from "./access-group.service";
import { Injectable } from "@nestjs/common";
import fetch from "node-fetch";

/**
 * This service is used to fetch access groups from a GraphQL API.
 */
@Injectable()
export class AccessGroupFromGraphQLApiService extends AccessGroupService {
  constructor(
    private graphqlTemplateQuery: string, // e.g. `userByOIDCSub(oidcSub: "{{oidcSub}}"){ proposals { proposalId } }`
    private apiUrl: string,
    private headers: Record<string, string>,
    private responseProcessor: (response: Record<string, unknown>) => string[],
  ) {
    super();
  }

  async getAccessGroups(
    idpPayload: Record<string, unknown>,
  ): Promise<string[]> {
    const oidcSub = idpPayload.sub as string;
    const query = this.graphqlTemplateQuery.replace("{{oidcSub}}", oidcSub);
    const response = await this.callGraphQLApi(query);
    const accessGroups = this.responseProcessor(response);

    return accessGroups;
  }

  async callGraphQLApi(query: string): Promise<Record<string, unknown>> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      body: JSON.stringify({
        query: `{ ${query} }`,
      }),
    });
    const json = await response.json();
    return json;
  }
}
