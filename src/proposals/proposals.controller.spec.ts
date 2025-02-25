import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsService } from "src/datasets/datasets.service";
import { ProposalsController } from "./proposals.controller";
import { ProposalsService } from "./proposals.service";

class AttachmentsServiceMock {}

class DatasetsServiceMock {}

class ProposalsServiceMock {}

class CaslAbilityFactoryMock {}

describe("ProposalsController", () => {
  let controller: ProposalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalsController],
      providers: [
        { provide: AttachmentsService, useClass: AttachmentsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: ProposalsService, useClass: ProposalsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<ProposalsController>(ProposalsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
