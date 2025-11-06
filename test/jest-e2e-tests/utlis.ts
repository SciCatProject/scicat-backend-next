import { faker } from "@faker-js/faker";
import { VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";

export class ConfigServiceDbMock extends ConfigService {
  get(key: string) {
    if (key === "mongodbUri") {
      const uriParts = super.get(key).split("/");
      uriParts[3] = `scicat-e2e-test-${faker.number.int()}`;
      return uriParts.join("/");
    }
    return super.get(key);
  }
}

export function createTestingModuleFactory(ConfigMock = ConfigServiceDbMock) {
  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useClass(ConfigMock);
}

export async function createTestingApp(moduleFixture: TestingModule) {
  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "3",
  });
  await app.init();
  return app;
}
