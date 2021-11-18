import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { CaslModule } from "src/casl/casl.module";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";

class AttachmentsServiceMock {}

class DatasetsServiceMock {}

describe("DatasetsController", () => {
  let controller: DatasetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetsController],
      imports: [CaslModule],
      providers: [
        { provide: AttachmentsService, useClass: AttachmentsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
      ],
    }).compile();

    controller = module.get<DatasetsController>(DatasetsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
