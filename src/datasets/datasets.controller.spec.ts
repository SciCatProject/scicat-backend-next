import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { CaslModule } from "src/casl/casl.module";
import { DatablocksService } from "src/datablocks/datablocks.service";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";

class AttachmentsServiceMock {}

class DatablocksServiceMock {}

class DatasetsServiceMock {}

class OrigDatablocksServiceMock {}

describe("DatasetsController", () => {
  let controller: DatasetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetsController],
      imports: [CaslModule],
      providers: [
        { provide: AttachmentsService, useClass: AttachmentsServiceMock },
        { provide: DatablocksService, useClass: DatablocksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
      ],
    }).compile();

    controller = module.get<DatasetsController>(DatasetsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
