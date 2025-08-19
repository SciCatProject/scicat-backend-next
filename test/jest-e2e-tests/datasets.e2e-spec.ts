import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { faker } from "@faker-js/faker";
import { createTestingModuleFactory } from "./utlis";

describe("HidePersonalInfo test", () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let token: string;
  process.env.MASK_PERSONAL_INFO = "yes";

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
      .send({ username: "admin", password: "27f5fd86ae68fe740eef42b8bbd1d7d5" })
      .set("Accept", "application/json")
      .expect(201)
      .then((response) => (token = response.body.access_token));
  });

  afterAll(async () => {
    if (mongoConnection.db) await mongoConnection.db.dropDatabase();
    await app.close();
  });

  it("Check if users info are hidden from dataset", async () => {
    const dataset = {
      inputDatasets: [faker.string.uuid()],
      usedSoftware: [faker.internet.url()],
      isPublished: true,
      owner: faker.internet.username(),
      contactEmail: faker.internet.email(),
      sourceFolder: faker.system.directoryPath(),
      creationTime: faker.date.past(),
      ownerGroup: faker.string.alphanumeric(6),
      datasetName: `${faker.string.alphanumeric(20)} ${faker.string.sample()}`,
      type: "raw",
      principalInvestigator: faker.internet.username(),
      investigator: faker.internet.username(),
      ownerEmail: "admin@scicat.project",
      orcidOfOwner: faker.string.alphanumeric(6),
      creationLocation: faker.location.city(),
      sampleId: "sample123",
      accessGroups: [faker.internet.email(), faker.internet.email()],
    };

    await request(app.getHttpServer())
      .post("/api/v3/datasets")
      .send(dataset)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(201)
      .then(
        (result) => (
          expect(result.body.contactEmail).toEqual("*****"),
          expect(result.body.ownerEmail).toEqual("admin@scicat.project"),
          expect(result.body.accessGroups).toEqual(["*****"])
        ),
      );

    await request(app.getHttpServer())
      .get("/api/v3/datasets")
      .auth(token, { type: "bearer" })
      .expect(200)
      .then(
        (result) => (
          expect(result.body[0].contactEmail).toEqual("*****"),
          expect(result.body[0].ownerEmail).toEqual("admin@scicat.project"),
          expect(result.body[0].accessGroups).toEqual(["*****"])
        ),
      );
  });

  it("Check if users info are hidden from dataset recursively", async () => {
    const sample = {
      owner: faker.internet.username(),
      description: faker.lorem.sentence(),
      sampleCharacteristics: {
        chemical_formula: {
          value: faker.science.chemicalElement,
          unit: faker.science.unit,
        },
      },
      ownerGroup: faker.string.alphanumeric(6),
      accessGroups: [
        faker.string.alphanumeric(6),
        faker.string.alphanumeric(6),
      ],
      sampleId: "sample123",
    };

    await request(app.getHttpServer())
      .post("/api/v3/samples")
      .send(sample)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v3/samples/${sample.sampleId}/datasets`)
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(200)
      .then(
        (result) => (
          expect(result.body[0].contactEmail).toEqual("*****"),
          expect(result.body[0].ownerEmail).toEqual("admin@scicat.project"),
          expect(result.body[0].accessGroups).toEqual(["*****"])
        ),
      );
  });

  it("Check that users info are not hidden for UserController", async () => {
    await request(app.getHttpServer())
      .get("/api/v3/users/my/self")
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(200)
      .then((result) =>
        expect(result.body.email).toEqual("admin@scicat.project"),
      );
  });

  it("Check that everything is masked when no auth", async () => {
    await request(app.getHttpServer())
      .get("/api/v3/datasets")
      .expect(200)
      .then(
        (result) => (
          expect(result.body[0].contactEmail).toEqual("*****"),
          expect(result.body[0].ownerEmail).toEqual("*****"),
          expect(result.body[0].accessGroups).toEqual(["*****"])
        ),
      );
  });
});
