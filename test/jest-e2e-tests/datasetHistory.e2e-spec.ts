import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { createTestingApp, createTestingModuleFactory } from "./utlis";
import { getToken } from "../LoginUtils";
import { TestData } from "../TestData";

describe("Test v3 history in datasetLifecycle", () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let token: string;
  process.env.TRACKABLES = "Dataset";
  process.env.TRACKABLE_STRATEGY = "delta";
  process.env.HISTORY_ACCESS_DATASET_GROUPS = "";

  let dsId: string;

  beforeAll(async () => {
    const moduleFixture = await createTestingModuleFactory().compile();
    app = await createTestingApp(moduleFixture);
    mongoConnection = await app.get<Promise<Connection>>(getConnectionToken());
  });

  beforeAll(async () => {
    token = await getToken(app.getHttpServer(), {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
    });
  });

  beforeAll(async () => {
    const dataset = {
      ...TestData.RawCorrectMin,
      ownerGroup: "group1",
      accessGroups: ["access1@group.site", "access2@group.site"],
    };

    const ds = await request(app.getHttpServer())
      .post("/api/v3/datasets")
      .send(dataset)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode);
    dsId = ds.body._id;
  });

  afterAll(async () => {
    if (mongoConnection.db) await mongoConnection.db.dropDatabase();
    await app.close();
  });

  it("Should check v3 built history", async () => {
    await request(app.getHttpServer())
      .patch(`/api/v3/datasets/${encodeURIComponent(dsId)}/datasetlifecycle`)
      .send({ archivable: false })
      .auth(token, { type: "bearer" })
      .expect(TestData.SuccessfulGetStatusCode);

    await request(app.getHttpServer())
      .get(`/api/v3/datasets/${encodeURIComponent(dsId)}`)
      .auth(token, { type: "bearer" })
      .expect(TestData.SuccessfulGetStatusCode)
      .then((res) => {
        expect(res.body.history.length).toBe(1);
        const lifecycle = res.body.history[0].datasetlifecycle;
        expect(lifecycle.previousValue.archivable).toBe(true);
        expect(lifecycle.currentValue.archivable).toBe(false);
        expect(lifecycle.previousValue.retrievable).toBeDefined();
        expect(lifecycle.currentValue.retrievable).not.toBeDefined();
        expect(typeof lifecycle.previousValue._id).toBe("string");
      });
  });
});
