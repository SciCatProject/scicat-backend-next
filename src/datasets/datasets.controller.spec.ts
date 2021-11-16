import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";

describe("DatasetsController", () => {
  let controller: DatasetsController;
  let attachmentsService: AttachmentsService;
  let datasetsService: DatasetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetsController],
      providers: [AttachmentsService, DatasetsService],
    }).compile();

    controller = module.get<DatasetsController>(DatasetsController);
    attachmentsService = await module.resolve(AttachmentsService);
    datasetsService = await module.resolve(DatasetsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
