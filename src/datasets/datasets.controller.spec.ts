import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { DatablocksService } from "src/datablocks/datablocks.service";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { ConfigModule } from "@nestjs/config";

class AttachmentsServiceMock {}

class DatablocksServiceMock {}

class DatasetsServiceMock {}

class OrigDatablocksServiceMock {}

class LogbooksServiceMock {}

class CaslAbilityFactoryMock {}

describe("DatasetsController", () => {
  let controller: DatasetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetsController],
      imports: [ConfigModule],
      providers: [
        { provide: AttachmentsService, useClass: AttachmentsServiceMock },
        { provide: LogbooksService, useClass: LogbooksServiceMock },
        { provide: DatablocksService, useClass: DatablocksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<DatasetsController>(DatasetsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
