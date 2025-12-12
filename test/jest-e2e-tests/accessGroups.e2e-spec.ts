import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/schemas/user.schema";
import { createTestingApp, createTestingModuleFactory } from "./utlis";
import { TestData } from "../TestData";
import { getToken } from "../LoginUtils";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";

describe("Access groups test", () => {
  let app: INestApplication;
  let usersService: UsersService;
  let u: User;
  let mongoConnection: Connection;
  process.env.READ_PRIVILEGED_BY_USERNAME_GROUPS = "group1";

  beforeAll(async () => {
    const moduleFixture = await createTestingModuleFactory().compile();

    app = await createTestingApp(moduleFixture);

    usersService = app.get<UsersService>(UsersService);
    u = (await usersService.findOrCreate({
      username: "noGroup",
      password: "aman",
      email: "no.group@your-site.com",
      authStrategy: "local",
      global: false,
    })) as User;

    if (!u) {
      throw new Error("User was not created successfully");
    }
    mongoConnection = await app.get<Promise<Connection>>(getConnectionToken());
  });

  beforeAll(async () => {
    const token = await getToken(app.getHttpServer(), {
      username: "admin",
      password: TestData.Accounts["admin"]["password"],
    });
    await request(app.getHttpServer())
      .post("/api/v3/datasets")
      .send({ ...TestData.RawCorrectMin, accessGroups: ["user1"] })
      .auth(token, { type: "bearer" })
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode);
  });

  afterAll(async () => {
    if (mongoConnection.db) await mongoConnection.db.dropDatabase();
    await app.close();
  });

  afterEach(async () => {
    await usersService.removeUserIdentity(u._id);
  });

  it("Make a request with user that has no accessGroups in his profile should succeed", async () => {
    await usersService.createUserIdentity({
      userId: u._id,
      profile: {
        username: u.username,
        email: u.email,
        accessGroups: [],
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post("/api/v3/Users/Login?include=user")
      .send({
        username: "noGroup",
        password: "aman",
      })
      .set("Accept", "application/json");

    return request(app.getHttpServer())
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${loginResponse.body.id}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/);
  });

  it("Make a request with user that has an Array as accessGroups in his profile should succeed", async function () {
    await usersService.createUserIdentity({
      userId: u._id,
      profile: {
        username: u.username,
        email: u.email,
        accessGroups: ["group1", "group2"],
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post("/api/v3/Users/Login?include=user")
      .send({
        username: "noGroup",
        password: "aman",
      })
      .set("Accept", "application/json");

    return request(app.getHttpServer())
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${loginResponse.body.id}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/);
  });

  it("Make a request with a role that can read datasets based on username accessGroup", async () => {
    const token = await getToken(app.getHttpServer(), {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
    });

    return request(app.getHttpServer())
      .get("/api/v3/datasets")
      .set("Accept", "application/json")
      .auth(token, { type: "bearer" })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.length).toBe(1);
      });
  });
});
