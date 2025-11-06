import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { createTestingApp, createTestingModuleFactory } from "./utlis";
import { HttpService } from "@nestjs/axios";
import { of } from "rxjs";
import { AxiosResponse } from "@nestjs/terminus/dist/health-indicator/http/axios.interfaces";
import { getToken } from "../LoginUtils";
import { TestData } from "../TestData";

describe("Published data datacite test", () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let token: string;
  let httpService: HttpService;

  let doi: string;

  beforeAll(async () => {
    const moduleFixture = await createTestingModuleFactory().compile();
    app = await createTestingApp(moduleFixture);
    mongoConnection = await app.get<Promise<Connection>>(getConnectionToken());
    httpService = moduleFixture.get<HttpService>(HttpService);
  });

  beforeAll(async () => {
    token = await getToken(app.getHttpServer(), {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });
  });

  beforeAll(async () => {
    await request(app.getHttpServer())
      .post("/api/v4/PublishedData")
      .send(TestData.PublishedDataV4)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${token}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => (doi = encodeURIComponent(res.body["doi"])));
  });

  afterAll(async () => {
    if (mongoConnection.db) await mongoConnection.db.dropDatabase();
    await app.close();
  });

  it("Should register this new published data", async () => {
    const mockAxiosResponse: AxiosResponse = {
      data: {},
      status: TestData.SuccessfulGetStatusCode,
      statusText: "OK",
      headers: {},
      config: {},
    };
    jest.spyOn(httpService, "request").mockReturnValue(of(mockAxiosResponse));
    await request(app.getHttpServer())
      .post("/api/v4/PublishedData/" + doi + "/register")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${token}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/);
  });

  it("Should fetch this new published data", async () => {
    await request(app.getHttpServer())
      .get("/api/v4/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${token}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.status).toEqual("registered");
      });
  });

  it("Should not be able to delete published data in registrated", async () => {
    const archiveManagerToken = await getToken(app.getHttpServer(), {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
    });
    await request(app.getHttpServer())
      .delete("/api/v4/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${archiveManagerToken}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/);
  });

  it("Should amend this new registered published data", async () => {
    await request(app.getHttpServer())
      .post("/api/v4/PublishedData/" + doi + "/amend")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${token}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/);
  });

  it("Should fetch this amended published data", async () => {
    await request(app.getHttpServer())
      .get("/api/v4/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${token}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.status).toEqual("amended");
      });
  });
});
