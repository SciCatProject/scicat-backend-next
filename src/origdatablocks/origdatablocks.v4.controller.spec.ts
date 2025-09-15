import { Test, TestingModule } from "@nestjs/testing";
import { OrigDatablocksV4Controller } from "./origdatablocks.v4.controller";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { DatasetsService } from "src/datasets/datasets.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { ConfigModule } from "@nestjs/config";
import { NotFoundException, HttpException } from "@nestjs/common";
import { Request } from "express";

class OrigDatablocksServiceMock {
  findOne = jest.fn();
  findByIdAndUpdate = jest.fn();
  findOneComplete = jest.fn();
}

class DatasetsServiceMock {
  findOneComplete = jest.fn();
}

class CaslAbilityFactoryMock {}

describe("OrigDatablocksV4Controller", () => {
  let controller: OrigDatablocksV4Controller;
  let origDatablocksService: OrigDatablocksServiceMock;
  let datasetsService: DatasetsServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrigDatablocksV4Controller],
      imports: [ConfigModule],
      providers: [
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
      ],
    }).compile();

    controller = module.get<OrigDatablocksV4Controller>(
      OrigDatablocksV4Controller,
    );
    origDatablocksService = module.get(OrigDatablocksService);
    datasetsService = module.get(DatasetsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findByIdAndUpdate", () => {
    const mockRequest = {
      user: { id: "user123" },
    } as unknown as Request;

    const mockHeaders = {
      "if-unmodified-since": new Date().toISOString(),
    };

    const mockUpdateDto = {
      name: "Updated Name",
    };

    const mockDatablock = {
      _id: "db123",
      updatedAt: new Date(Date.now() - 1000),
      datasetId: "ds123",
    };

    const updatedDatablock = {
      ...mockDatablock,
      name: "Updated Name",
    };

    beforeEach(() => {
      jest
        .spyOn(controller, "checkPermissionsForOrigDatablockWrite")
        .mockResolvedValue(mockDatablock);
      jest
        .spyOn(controller, "updateDatasetSizeAndFiles")
        .mockResolvedValue(undefined);
    });

    it("should throw NotFoundException if datablock not found", async () => {
      jest.spyOn(origDatablocksService, "findOne").mockResolvedValue(null);

      await expect(
        controller.findByIdAndUpdate(
          mockRequest,
          "db123",
          mockHeaders,
          mockUpdateDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw HttpException if header date is older than updatedAt", async () => {
      jest.spyOn(origDatablocksService, "findOne").mockResolvedValue({
        ...mockDatablock,
        updatedAt: new Date(),
      });

      const oldDate = new Date(Date.now() - 10000).toISOString();
      const headers = { "if-unmodified-since": oldDate };

      await expect(
        controller.findByIdAndUpdate(
          mockRequest,
          "db123",
          headers,
          mockUpdateDto,
        ),
      ).rejects.toThrow(HttpException);
    });

    it("should throw NotFoundException if update returns null", async () => {
      jest
        .spyOn(origDatablocksService, "findOne")
        .mockResolvedValue(mockDatablock);
      jest
        .spyOn(origDatablocksService, "findByIdAndUpdate")
        .mockResolvedValue(null);

      await expect(
        controller.findByIdAndUpdate(mockRequest, "db123", {}, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should return updated datablock on success", async () => {
      jest
        .spyOn(origDatablocksService, "findOne")
        .mockResolvedValue(mockDatablock);
      jest
        .spyOn(origDatablocksService, "findByIdAndUpdate")
        .mockResolvedValue(updatedDatablock);

      const result = await controller.findByIdAndUpdate(
        mockRequest,
        "db123",
        {},
        mockUpdateDto,
      );
      expect(result).toEqual(updatedDatablock);
    });

    it("should succeed if 'if-unmodified-since' header is missing", async () => {
      jest
        .spyOn(origDatablocksService, "findOne")
        .mockResolvedValue(mockDatablock);
      jest
        .spyOn(origDatablocksService, "findByIdAndUpdate")
        .mockResolvedValue(updatedDatablock);

      const result = await controller.findByIdAndUpdate(
        mockRequest,
        "db123",
        {},
        mockUpdateDto,
      );
      expect(result).toEqual(updatedDatablock);
    });

    it("should succeed if 'if-unmodified-since' header is malformed", async () => {
      const malformedHeaders = {
        "if-unmodified-since": "not-a-date",
      };

      jest
        .spyOn(origDatablocksService, "findOne")
        .mockResolvedValue(mockDatablock);
      jest
        .spyOn(origDatablocksService, "findByIdAndUpdate")
        .mockResolvedValue(updatedDatablock);

      const result = await controller.findByIdAndUpdate(
        mockRequest,
        "db123",
        malformedHeaders,
        mockUpdateDto,
      );
      expect(result).toEqual(updatedDatablock);
    });
  });
});
