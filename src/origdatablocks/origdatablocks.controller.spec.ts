import { Test, TestingModule } from "@nestjs/testing";
import { OrigDatablocksController } from "./origdatablocks.controller";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { DatasetsService } from "src/datasets/datasets.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { ConfigModule } from "@nestjs/config";

class OrigDatablocksServiceMock {}

class DatasetsServiceMock {}

class CaslAbilityFactoryMock {}

describe("OrigDatablocksController", () => {
  let controller: OrigDatablocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrigDatablocksController],
      imports: [ConfigModule],
      providers: [
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<OrigDatablocksController>(OrigDatablocksController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
