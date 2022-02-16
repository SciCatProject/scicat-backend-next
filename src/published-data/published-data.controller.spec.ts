import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { CaslModule } from "src/casl/casl.module";
import { DatasetsService } from "src/datasets/datasets.service";
import { ProposalsService } from "src/proposals/proposals.service";
import { PublishedDataController } from "./published-data.controller";
import { PublishedDataService } from "./published-data.service";

class AttachmentsServiceMock {}

class DatasetsServiceMock {}

class ProposalsServiceMock {}

class PublishedDataServiceMock {}

describe("PublishedDataController", () => {
  let controller: PublishedDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishedDataController],
      imports: [CaslModule],
      providers: [
        { provide: AttachmentsService, useClass: AttachmentsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: ProposalsService, useClass: ProposalsServiceMock },
        { provide: PublishedDataService, useClass: PublishedDataServiceMock },
      ],
    }).compile();

    controller = module.get<PublishedDataController>(PublishedDataController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
