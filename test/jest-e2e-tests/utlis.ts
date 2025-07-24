import { faker } from "@faker-js/faker/.";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
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
