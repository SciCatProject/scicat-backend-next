import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { createTestingApp, createTestingModuleFactory } from "./utlis";
import { TestData } from "../TestData";
import { getToken } from "../LoginUtils";

describe("HidePersonalInfo test", () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let token: string;
  const user1email = TestData.Accounts["user1"]["email"];
  process.env.MASK_PERSONAL_INFO = "yes";

  beforeAll(async () => {
    const moduleFixture = await createTestingModuleFactory().compile();

    app = await createTestingApp(moduleFixture);
    mongoConnection = await app.get<Promise<Connection>>(getConnectionToken());
  });

  beforeEach(async () => {
    token = await getToken(app.getHttpServer(), {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
    });
  });

  afterAll(async () => {
    if (mongoConnection.db) await mongoConnection.db.dropDatabase();
    await app.close();
  });

  it("Check if users info are hidden from dataset", async () => {
    const dataset = {
      ...TestData.RawCorrectMin,
      isPublished: true,
      contactEmail: "user2@your.site",
      ownerGroup: "group1",
      ownerEmail: user1email,
      sampleId: "sample123",
      accessGroups: ["access1@group.site", "access2@group.site"],
      datasetlifecycle: {
        _id: "68b85b9cf830ebdccde06a0e",
      },
    };

    await request(app.getHttpServer())
      .post("/api/v3/datasets")
      .send(dataset)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode)
      .then(
        (result) => (
          expect(result.body.contactEmail).toEqual("*****"),
          expect(result.body.ownerEmail).toEqual(user1email),
          expect(result.body.accessGroups).toEqual(["*****"])
        ),
      );

    await request(app.getHttpServer())
      .get("/api/v3/datasets")
      .auth(token, { type: "bearer" })
      .expect(TestData.SuccessfulGetStatusCode)
      .then(
        (result) => (
          expect(result.body[0].contactEmail).toEqual("*****"),
          expect(result.body[0].ownerEmail).toEqual(user1email),
          expect(result.body[0].accessGroups).toEqual(["*****"]),
          expect(result.body[0].datasetlifecycle._id).toEqual(
            "68b85b9cf830ebdccde06a0e",
          )
        ),
      );
  });

  it("Check if users info are hidden from dataset recursively", async () => {
    const sample = {
      ...TestData.SampleCorrect,
      ownerGroup: "group1",
      sampleId: "sample123",
    };

    await request(app.getHttpServer())
      .post("/api/v3/samples")
      .send(sample)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode);

    await request(app.getHttpServer())
      .get(`/api/v3/samples/${sample.sampleId}/datasets`)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulGetStatusCode)
      .then(
        (result) => (
          expect(result.body[0].contactEmail).toEqual("*****"),
          expect(result.body[0].ownerEmail).toEqual(user1email),
          expect(result.body[0].accessGroups).toEqual(["*****"])
        ),
      );
  });

  it("Check that users info are not hidden for UserController", async () => {
    await request(app.getHttpServer())
      .get("/api/v3/users/my/self")
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulGetStatusCode)
      .then(
        (result) => (
          expect(result.body.email).toEqual(user1email),
          expect(result.body.id).toBeDefined(),
          expect(result.body._id).toBeDefined()
        ),
      );
  });

  it("Check that everything is masked when no auth", async () => {
    await request(app.getHttpServer())
      .get("/api/v3/datasets")
      .expect(TestData.SuccessfulGetStatusCode)
      .then(
        (result) => (
          expect(result.body[0].contactEmail).toEqual("*****"),
          expect(result.body[0].ownerEmail).toEqual("*****"),
          expect(result.body[0].accessGroups).toEqual(["*****"])
        ),
      );
  });

  it("Check that nothing is masked when admin", async () => {
    const adminToken = await getToken(app.getHttpServer(), {
      username: "admin",
      password: TestData.Accounts["admin"]["password"],
    });
    await request(app.getHttpServer())
      .get("/api/v3/datasets")
      .auth(adminToken, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulGetStatusCode)
      .then(
        (result) => (
          expect(result.body[0].contactEmail).toEqual("user2@your.site"),
          expect(result.body[0].ownerEmail).toEqual(user1email),
          expect(result.body[0].accessGroups).toEqual([
            "access1@group.site",
            "access2@group.site",
          ])
        ),
      );
  });
});
