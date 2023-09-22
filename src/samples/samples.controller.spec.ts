import {Test, TestingModule} from "@nestjs/testing";
import {AttachmentsService} from "src/attachments/attachments.service";
import {CaslModule} from "src/casl/casl.module";
import {DatasetsService} from "src/datasets/datasets.service";
import {SamplesController} from "./samples.controller";
import {SamplesService} from "./samples.service";

class AttachmentsServiceMock {}

class DatasetsServiceMock {}

class SamplesServiceMock {}

describe("SamplesController", () => {
  let controller: SamplesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SamplesController],
      imports: [CaslModule],
      providers: [
        {provide: AttachmentsService, useClass: AttachmentsServiceMock},
        {provide: DatasetsService, useClass: DatasetsServiceMock},
        {provide: SamplesService, useClass: SamplesServiceMock},
      ],
    }).compile();

    controller = module.get<SamplesController>(SamplesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
