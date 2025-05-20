import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/app.module";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/schemas/user.schema";

describe("Access groups test", () => {
  let app: INestApplication;
  let usersService: UsersService;
  let u: User;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v3");
    await app.init();

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
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await usersService.removeUserIdentity(u._id);
  }, 30000);

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
      .expect(200)
      .expect("Content-Type", /json/);
  });

  // NOTE: This is not a valid one because now in the new backend userIdentity is created from a model and accessGroups are always an array even if we try to force it's value to be a number.
  // it("Make a request with user that has not an Array as accessGroups in his profile should fail", async () => {
  //   await usersService.createUserIdentity({
  //     userId: u._id,
  //     profile: {
  //       username: u.username,
  //       email: u.email,
  //       accessGroups: 1,
  //     },
  //   });
  //   const loginResponse = await request(app.getHttpServer())
  //     .post("/api/v3/Users/Login?include=user")
  //     .send({
  //       username: "noGroup",
  //       password: "aman",
  //     })
  //     .set("Accept", "application/json");

  //   return request(app.getHttpServer())
  //     .get("/api/v3/Datasets")
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${loginResponse.body.id}` })
  //     .expect(500)
  //     .expect("Content-Type", /json/);
  // });

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
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
