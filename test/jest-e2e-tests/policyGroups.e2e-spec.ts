import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { createTestingModuleFactory } from "./utlis";

describe("HidePersonalInfo test", () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let token: string;
  process.env.POLICY_GROUPS = "proposalingestor";
  const policy = {
    manager: ["adminIngestor"],
    tapeRedundancy: "low",
    autoArchiveDelay: 7,
    archiveEmailNotification: false,
    archiveEmailsToBeNotified: [],
    retrieveEmailNotification: false,
    retrieveEmailsToBeNotified: [],
    ownerGroup: "p10021",
    accessGroups: [],
  };

  beforeAll(async () => {
    const moduleFixture = await createTestingModuleFactory().compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v3");
    await app.init();
    mongoConnection = await app.get<Promise<Connection>>(getConnectionToken());
  });

  beforeEach(async () => {
    await request(app.getHttpServer())
      .post("/api/v3/auth/login")
      .send({
        username: "proposalIngestor",
        password: "7d8cd858fb9d0e4f5d91c34fd4016167",
      })
      .set("Accept", "application/json")
      .expect(201)
      .then((response) => (token = response.body.access_token));
  });

  afterAll(async () => {
    if (mongoConnection.db) await mongoConnection.db.dropDatabase();
    await app.close();
  });

  it("Check if users info are hidden from dataset", async () => {
    return request(app.getHttpServer())
      .post("/api/v3/policies")
      .send(policy)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(201);
  });
});
