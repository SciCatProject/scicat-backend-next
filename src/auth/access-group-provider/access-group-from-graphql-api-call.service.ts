import { AccessGroupService as AccessGroupService } from "./access-group.service";
import { Injectable } from "@nestjs/common";
///import fetch from "node-fetch";

import { UserPayload } from "../interfaces/userPayload.interface";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

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
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async getAccessGroups(
    //idpPayload: Record<string, unknown>,
    userPayload: UserPayload,
  ): Promise<string[]> {
    const userId = userPayload.userId as string;
    const query = this.graphqlTemplateQuery.replace("{{userId}}", userId);
    const response = await this.callGraphQLApi(query);
    const accessGroups = this.responseProcessor(response);

    return accessGroups;
  }

  async callGraphQLApi(query: string): Promise<Record<string, unknown>> {
    const response = await firstValueFrom(
      this.httpService.post(
        this.apiUrl,
        { query: { query } },
        {
          headers: {
            "Content-Type": "application/json",
            ...this.headers,
          },
        },
      ),
    );
    return response.data;
    /* const response = await fetch(this.apiUrl, {
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
    return json as Record<string, unknown>;
    */
  }
}
