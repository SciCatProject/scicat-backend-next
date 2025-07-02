import { Test, TestingModule } from "@nestjs/testing";
import { OrigDatablocksV4Controller } from "./origdatablocks.v4.controller";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { DatasetsService } from "src/datasets/datasets.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { ConfigModule } from "@nestjs/config";

class OrigDatablocksServiceMock {}

class DatasetsServiceMock {}

class CaslAbilityFactoryMock {}

describe("OrigDatablocksV4Controller", () => {
  let controller: OrigDatablocksV4Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrigDatablocksV4Controller],
      imports: [ConfigModule],
      providers: [
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<OrigDatablocksV4Controller>(
      OrigDatablocksV4Controller,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
