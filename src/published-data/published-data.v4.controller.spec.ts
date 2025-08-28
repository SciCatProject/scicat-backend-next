import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsService } from "src/datasets/datasets.service";
import { ProposalsService } from "src/proposals/proposals.service";
import { PublishedDataV4Controller } from "./published-data.v4.controller";
import { PublishedDataV4Service } from "./published-data.v4.service";

class AttachmentsServiceMock {}

class DatasetsServiceMock {}

class HttpServiceMock {}

class ProposalsServiceMock {}

class PublishedDataServiceMock {}

class CaslAbilityFactoryMock {}

describe("PublishedDataController", () => {
  let controller: PublishedDataV4Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishedDataV4Controller],
      providers: [
        ConfigService,
        { provide: AttachmentsService, useClass: AttachmentsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: HttpService, useClass: HttpServiceMock },
        { provide: ProposalsService, useClass: ProposalsServiceMock },
        { provide: PublishedDataV4Service, useClass: PublishedDataServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<PublishedDataV4Controller>(
      PublishedDataV4Controller,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
