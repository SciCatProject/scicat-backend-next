import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { createTestingApp, createTestingModuleFactory } from "./utlis";
import { getToken } from "../LoginUtils";
import { TestData } from "../TestData";

describe("Policy groups test", () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let token: string;
  process.env.POLICY_GROUPS = "proposalingestor";

  beforeAll(async () => {
    const moduleFixture = await createTestingModuleFactory().compile();
    app = await createTestingApp(moduleFixture);
    mongoConnection = await app.get<Promise<Connection>>(getConnectionToken());
  });

  beforeEach(async () => {
    token = await getToken(app.getHttpServer(), {
      username: "proposalIngestor",
      password: TestData.Accounts["proposalIngestor"]["password"],
    });
  });

  afterAll(async () => {
    if (mongoConnection.db) await mongoConnection.db.dropDatabase();
    await app.close();
  });

  it("Check if users info are hidden from dataset", async () => {
    return request(app.getHttpServer())
      .post("/api/v3/policies")
      .send(TestData.PolicyCorrect)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode);
  });
});
