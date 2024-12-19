import { Test, TestingModule } from "@nestjs/testing";
import { CaslModule } from "src/casl/casl.module";
import { DatasetsService } from "./datasets.service";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { ConfigModule } from "@nestjs/config";
import { DatasetsV4Controller } from "./datasets.v4.controller";

class DatasetsServiceMock {}

class LogbooksServiceMock {}

describe("DatasetsController", () => {
  let controller: DatasetsV4Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetsV4Controller],
      imports: [CaslModule, ConfigModule],
      providers: [
        { provide: LogbooksService, useClass: LogbooksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
      ],
    }).compile();

    controller = module.get<DatasetsV4Controller>(DatasetsV4Controller);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
