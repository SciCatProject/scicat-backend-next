import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { CaslModule } from "src/casl/casl.module";
import { ProposalsController } from "./proposals.controller";
import { ProposalsService } from "./proposals.service";

class AttachmentsServiceMock {}

class ProposalsServiceMock {}

describe("ProposalsController", () => {
  let controller: ProposalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalsController],
      imports: [CaslModule],
      providers: [
        { provide: AttachmentsService, useClass: AttachmentsServiceMock },
        { provide: ProposalsService, useClass: ProposalsServiceMock },
      ],
    }).compile();

    controller = module.get<ProposalsController>(ProposalsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
