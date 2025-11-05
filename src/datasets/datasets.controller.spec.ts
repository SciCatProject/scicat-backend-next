import { Test, TestingModule } from "@nestjs/testing";
import { AttachmentsService } from "src/attachments/attachments.service";
import { DatablocksService } from "src/datablocks/datablocks.service";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";
import { HistoryService } from "src/history/history.service";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import {
  ForbiddenException,
  HttpException,
  NotFoundException,
} from "@nestjs/common";
import { DatasetType } from "./types/dataset-type.enum";
import { Request } from "express";

class AttachmentsServiceMock {}

class DatablocksServiceMock {}

class OrigDatablocksServiceMock {}

class LogbooksServiceMock {}

class DatasetsServiceMock {
  findOne = jest.fn();
  findByIdAndUpdate = jest.fn();
}

class CaslAbilityFactoryMock {
  datasetInstanceAccess = jest.fn();
}

class HistoryServiceMock {}

describe("DatasetsController", () => {
  let controller: DatasetsController;
  let datasetsService: DatasetsServiceMock;
  let caslAbilityFactory: CaslAbilityFactoryMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetsController],
      imports: [ConfigModule, HttpModule],
      providers: [
        { provide: AttachmentsService, useClass: AttachmentsServiceMock },
        { provide: LogbooksService, useClass: LogbooksServiceMock },
        { provide: DatablocksService, useClass: DatablocksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
        { provide: HistoryService, useClass: HistoryServiceMock },
      ],
    }).compile();

    controller = module.get<DatasetsController>(DatasetsController);
    datasetsService = module.get(DatasetsService);
    caslAbilityFactory = module.get(CaslAbilityFactory);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findByIdAndUpdate", () => {
    it("should throw NotFoundException if dataset not found", async () => {
      datasetsService.findOne.mockResolvedValue(null);

      await expect(
        controller.findByIdAndUpdate(
          { user: {} } as Request,
          "some-pid",
          { "if-unmodified-since": "2023-01-01T00:00:00Z" },
          {},
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw PreconditionFailed if header date <= updatedAt", async () => {
      const mockDataset = {
        pid: "some-pid",
        updatedAt: new Date("2023-01-02T00:00:00Z"),
        type: DatasetType.Raw,
      };
      datasetsService.findOne.mockResolvedValue(mockDataset);

      await expect(
        controller.findByIdAndUpdate(
          { user: {} } as Request,
          "some-pid",
          { "if-unmodified-since": "2023-01-01T00:00:00Z" },
          {},
        ),
      ).rejects.toThrow(HttpException);
    });

    it("should throw ForbiddenException if user cannot update", async () => {
      const mockDataset = {
        pid: "some-pid",
        updatedAt: new Date("2023-01-01T00:00:00Z"),
        type: DatasetType.Raw,
      };
      datasetsService.findOne.mockResolvedValue(mockDataset);
      jest.spyOn(controller, "validateDatasetObsolete").mockResolvedValue({});
      jest
        .spyOn(controller, "generateDatasetInstanceForPermissions")
        .mockResolvedValue({});
      caslAbilityFactory.datasetInstanceAccess.mockReturnValue({
        can: () => false,
      });

      await expect(
        controller.findByIdAndUpdate(
          { user: {} } as Request,
          "some-pid",
          { "if-unmodified-since": "2023-01-02T00:00:00Z" },
          {},
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should return updated dataset if all conditions pass", async () => {
      const mockDataset = {
        pid: "some-pid",
        updatedAt: new Date("2023-01-01T00:00:00Z"),
        type: DatasetType.Raw,
      };
      const updatedDataset = { pid: "some-pid", name: "Updated" };

      datasetsService.findOne.mockResolvedValue(mockDataset);
      jest.spyOn(controller, "validateDatasetObsolete").mockResolvedValue({});
      jest
        .spyOn(controller, "generateDatasetInstanceForPermissions")
        .mockResolvedValue({});
      caslAbilityFactory.datasetInstanceAccess.mockReturnValue({
        can: () => true,
      });
      jest
        .spyOn(controller, "convertObsoleteToCurrentSchema")
        .mockReturnValue({});
      datasetsService.findByIdAndUpdate.mockResolvedValue(updatedDataset);
      jest
        .spyOn(controller, "convertCurrentToObsoleteSchema")
        .mockReturnValue(updatedDataset);

      const result = await controller.findByIdAndUpdate(
        { user: {} } as Request,
        "some-pid",
        { "if-unmodified-since": "2023-01-02T00:00:00Z" },
        {},
      );

      expect(result).toEqual(updatedDataset);
    });

    it("should proceed with update if if-unmodified-since header is missing or invalid", async () => {
      const mockDataset = {
        pid: "some-pid",
        updatedAt: new Date("2023-01-01T00:00:00Z"),
        type: DatasetType.Raw,
      };
      const updatedDataset = { pid: "some-pid", name: "Updated" };

      datasetsService.findOne.mockResolvedValue(mockDataset);
      jest.spyOn(controller, "validateDatasetObsolete").mockResolvedValue({});
      jest
        .spyOn(controller, "generateDatasetInstanceForPermissions")
        .mockResolvedValue({});
      caslAbilityFactory.datasetInstanceAccess.mockReturnValue({
        can: () => true,
      });
      jest
        .spyOn(controller, "convertObsoleteToCurrentSchema")
        .mockReturnValue({});
      datasetsService.findByIdAndUpdate.mockResolvedValue(updatedDataset);
      jest
        .spyOn(controller, "convertCurrentToObsoleteSchema")
        .mockReturnValue(updatedDataset);

      const result = await controller.findByIdAndUpdate(
        { user: {} } as Request,
        "some-pid",
        { "if-unmodified-since": "not-a-valid-date" }, // invalid header
        {},
      );

      expect(result).toEqual(updatedDataset);
    });
  });
});
