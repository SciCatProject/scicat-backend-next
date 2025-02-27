import { Test, TestingModule } from "@nestjs/testing";
import { DatasetsService } from "./datasets.service";
import { DatasetsPublicV4Controller } from "./datasets-public.v4.controller";
import { ConfigModule } from "@nestjs/config";

class DatasetsServiceMock {}

describe("DatasetsController", () => {
  let controller: DatasetsPublicV4Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetsPublicV4Controller],
      imports: [ConfigModule],
      providers: [{ provide: DatasetsService, useClass: DatasetsServiceMock }],
    }).compile();

    controller = module.get<DatasetsPublicV4Controller>(
      DatasetsPublicV4Controller,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
