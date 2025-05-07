import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/app.module";
import { OidcAuthGuard } from "src/auth/guards/oidc.guard";
import { getConnectionToken } from "@nestjs/mongoose";
import { Collection } from "mongodb";
import { Connection } from "mongoose";
import { ConfigService } from "@nestjs/config";

["mongo", "memory"].forEach((store) => {
  describe(`OIDC test ${store}`, () => {
    let app: INestApplication;
    let sessions: Collection;

    class ConfigServiceMock extends ConfigService {
      get(key: string) {
        if (key === "expressSession.store") return store;
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
      const mongoConnection =
        await app.get<Promise<Connection>>(getConnectionToken());
      sessions = mongoConnection.db!.collection("sessions");
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    afterEach(async () => {
      await sessions.deleteMany({});
    });

    it("Check session is created in DB", async function () {
      await request(app.getHttpServer())
        .get("/api/v3/auth/oidc")
        .set("Accept", "text/html")
        .expect(200);

      const session = await sessions.findOne();
      if (store === "mongo") expect(session).not.toBe(null);
      else expect(session).toBe(null);
    });
  });
});
