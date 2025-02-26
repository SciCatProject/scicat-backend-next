import { Test, TestingModule } from "@nestjs/testing";
import { DatasetsService } from "./datasets.service";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { ConfigModule } from "@nestjs/config";
import { DatasetsV4Controller } from "./datasets.v4.controller";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";

class DatasetsServiceMock {}

class CaslAbilityFactoryMock {}

class LogbooksServiceMock {}

describe("DatasetsController", () => {
  let controller: DatasetsV4Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetsV4Controller],
      imports: [ConfigModule],
      providers: [
        { provide: LogbooksService, useClass: LogbooksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<DatasetsV4Controller>(DatasetsV4Controller);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
