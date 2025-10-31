import { Test, TestingModule } from "@nestjs/testing";
import { OrigDatablocksController } from "./origdatablocks.controller";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { DatasetsService } from "src/datasets/datasets.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { ConfigModule } from "@nestjs/config";
import { NotFoundException, HttpException } from "@nestjs/common";
import { Request } from "express";

class OrigDatablocksServiceMock {
  findOne = jest.fn();
  findByIdAndUpdate = jest.fn();
}

class DatasetsServiceMock {}

class CaslAbilityFactoryMock {}

describe("OrigDatablocksController", () => {
  let controller: OrigDatablocksController;
  let origDatablocksService: OrigDatablocksServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrigDatablocksController],
      imports: [ConfigModule],
      providers: [
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<OrigDatablocksController>(OrigDatablocksController);
    origDatablocksService = module.get<OrigDatablocksService>(
      OrigDatablocksService,
    );

    // Mock internal methods
    controller["checkPermissionsForOrigDatablock"] = jest.fn();
    controller["updateDatasetSizeAndFiles"] = jest.fn();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("update", () => {
    const mockRequest = {} as Request;
    const mockHeaders = {
      "if-unmodified-since": new Date().toUTCString(),
    };
    const mockDto = { name: "Updated Name" };
    const mockDatablock = {
      _id: "123",
      updatedAt: new Date(Date.now() - 1000),
      datasetId: "ds1",
    };

    it("should throw NotFoundException if datablock not found before update", async () => {
      origDatablocksService.findOne.mockResolvedValue(null);

      await expect(
        controller.update(mockRequest, "123", mockHeaders, mockDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw PreconditionFailed if header date <= updatedAt", async () => {
      origDatablocksService.findOne.mockResolvedValue({
        ...mockDatablock,
        updatedAt: new Date(),
      });

      await expect(
        controller.update(mockRequest, "123", mockHeaders, mockDto),
      ).rejects.toThrow(HttpException);
    });

    it("should throw NotFoundException if datablock not found after update", async () => {
      origDatablocksService.findOne.mockResolvedValue(mockDatablock);
      origDatablocksService.findByIdAndUpdate.mockResolvedValue(null);

      await expect(
        controller.update(mockRequest, "123", mockHeaders, mockDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should return updated datablock on success", async () => {
      const updatedDatablock = { ...mockDatablock, name: "Updated Name" };

      origDatablocksService.findOne.mockResolvedValue(mockDatablock);
      origDatablocksService.findByIdAndUpdate.mockResolvedValue(
        updatedDatablock,
      );

      const result = await controller.update(
        mockRequest,
        "123",
        mockHeaders,
        mockDto,
      );

      expect(result).toEqual(updatedDatablock);
      expect(controller["updateDatasetSizeAndFiles"]).toHaveBeenCalledWith(
        "ds1",
      );
    });

    describe("update", () => {
      const mockRequest = {} as Request;
      const mockDto = { name: "Updated Name" };
      const mockDatablock = {
        _id: "123",
        updatedAt: new Date(),
        datasetId: "ds1",
      };
      const updatedDatablock = { ...mockDatablock, name: "Updated Name" };

      beforeEach(() => {
        origDatablocksService.findOne.mockResolvedValue(mockDatablock);
        origDatablocksService.findByIdAndUpdate.mockResolvedValue(
          updatedDatablock,
        );
      });

      it("should proceed with update if 'if-unmodified-since' header is missing", async () => {
        const headers = {}; // No header

        const result = await controller.update(
          mockRequest,
          "123",
          headers,
          mockDto,
        );

        expect(result).toEqual(updatedDatablock);
        expect(controller["updateDatasetSizeAndFiles"]).toHaveBeenCalledWith(
          "ds1",
        );
      });

      it("should proceed with update if 'if-unmodified-since' header is malformed", async () => {
        const headers = { "if-unmodified-since": "not-a-date" }; // Invalid date format

        const result = await controller.update(
          mockRequest,
          "123",
          headers,
          mockDto,
        );

        expect(result).toEqual(updatedDatablock);
        expect(controller["updateDatasetSizeAndFiles"]).toHaveBeenCalledWith(
          "ds1",
        );
      });
    });
  });
});
