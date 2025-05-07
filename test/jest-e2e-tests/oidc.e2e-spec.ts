import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/app.module";
import { OidcAuthGuard } from "src/auth/guards/oidc.guard";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { ConfigService } from "@nestjs/config";

["mongo", "memory"].forEach((store) => {
  describe(`OIDC test ${store}`, () => {
    let app: INestApplication;
    let mongoConnection: Connection;

    class ConfigServiceMock extends ConfigService {
      get(key: string) {
        if (key === "expressSession.store") return store;
        if (key === "mongodbUri") {
          const uriParts = super.get(key).split("/");
          uriParts[3] = "scicat-e2e-test";
          return uriParts.join("/");
        }
        return super.get(key);
      }
    }

    beforeAll(async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(ConfigService)
        .useClass(ConfigServiceMock)
        .overrideGuard(OidcAuthGuard)
        .useValue({ canActivate: jest.fn(() => true) })
        .compile();

      app = moduleFixture.createNestApplication();
      app.setGlobalPrefix("api/v3");
      mongoConnection =
        await app.get<Promise<Connection>>(getConnectionToken());
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    afterEach(async () => {
      await mongoConnection.db!.dropDatabase();
    });

    it("Check session is created in DB", async function () {
      await request(app.getHttpServer())
        .get("/api/v3/auth/oidc")
        .set("Accept", "text/html")
        .expect(200);

      const sessions = mongoConnection.db!.collection("sessions");
      const session = await sessions.findOne();
      if (store === "mongo") expect(session).not.toBe(null);
      else expect(session).toBe(null);
    });
  });
});
