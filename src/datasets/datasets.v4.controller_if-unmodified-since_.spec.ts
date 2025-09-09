import {DatasetsService} from "./datasets.service";
import {DatasetsV4Controller} from "./datasets.v4.controller";
import {CaslAbilityFactory} from "src/casl/casl-ability.factory";
import {PartialUpdateDatasetDto} from "./dto/update-dataset.dto";
import {Request} from "express";

describe("DatasetsController (manual instantiate)", () => {
  let controller: DatasetsV4Controller;

  // ---- Mocks ----

  const mockUser = {id: "u-1", roles: ["admin"]};

  const datasetsService = {
    findOne: jest.fn().mockResolvedValue({
      pid: "test-dataset-id",
      updatedAt: new Date("2025-01-01T00:00:00Z"),
      scientificMetadata: {
        temperature: {value: 295, unit: "K"},
      },
    }),
    findByIdAndUpdate: jest.fn().mockImplementation((pid: string, updateDto: any) => ({
      pid,
      ...updateDto,
    })),
  } as unknown as jest.Mocked<DatasetsService>;

  // CASL factory mock (kept for completeness; permission check is stubbed anyway)
  const caslAbilityFactory = {
    createForUser: jest.fn().mockReturnValue({
      can: () => true,
      cannot: () => false,
    }),
    datasetInstanceAccess: jest.fn().mockReturnValue(true),
  } as unknown as jest.Mocked<CaslAbilityFactory>;

  class LogbooksServiceMock {
  }

  let checkSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new (DatasetsV4Controller as any)(
      datasetsService,
      new LogbooksServiceMock(),
      caslAbilityFactory
    );

    // Force the permission check to always pass in these unit tests
    checkSpy = jest
      .spyOn(controller as any, "checkPermissionsForDatasetExtended")
      .mockResolvedValue(undefined);
  });

  it("should update dataset and return updated result (happy path with fresh header)", async () => {
    const pid = "test-dataset-id";
    const updateDto: PartialUpdateDatasetDto = {
      scientificMetadata: {temperature: {value: 300, unit: "K"}},
    };

    const req = {
      headers: {"content-type": "application/json"},
      user: mockUser,
    } as unknown as Request;

    // Header is *after* updatedAt -> allowed
    const headers = {"if-unmodified-since": "2026-01-01T00:00:00Z"};

    const result = await controller.findByIdAndUpdate(req, pid, headers, updateDto);

    expect(result).toBeDefined();
    expect((result as any).pid).toBe(pid);
    expect((result as any).scientificMetadata.temperature.value).toBe(300);

    expect(datasetsService.findOne).toHaveBeenCalledWith({where: {pid}});
    expect(datasetsService.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(checkSpy).toHaveBeenCalledTimes(1);
  });


  it.each([
    {title: "missing header", header: {} as Record<string, string>},
    {
      title: "invalid header",
      header: {"if-unmodified-since": "not-a-date"} as Record<string, string>
    },
  ])("should update when if-unmodified-since is $title", async ({header}) => {
    const pid = "test-dataset-id";
    const updateDto: PartialUpdateDatasetDto = {
      scientificMetadata: {temperature: {value: 305, unit: "K"}},
    };

    const req = {
      headers: {"content-type": "application/json"},
      user: mockUser,
    } as unknown as Request;

    const result = await controller.findByIdAndUpdate(req, pid, header, updateDto);

    expect(result).toBeDefined();
    expect((result as any).pid).toBe(pid);
    expect((result as any).scientificMetadata.temperature.value).toBe(305);

    expect(datasetsService.findOne).toHaveBeenCalledWith({where: {pid}});
    expect(datasetsService.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(checkSpy).toHaveBeenCalledTimes(1);
  });

  it("should NOT update and throw 412 when if-unmodified-since is older than updatedAt", async () => {
    const pid = "test-dataset-id";
    const updateDto: PartialUpdateDatasetDto = {
      scientificMetadata: {temperature: {value: 310, unit: "K"}},
    };

    const req = {
      headers: {"content-type": "application/json"},
      user: mockUser,
    } as unknown as Request;

    // Header is *before* updatedAt -> should fail with PRECONDITION_FAILED (412)
    const headers = {"if-unmodified-since": "2024-12-31T12:00:00Z"};

    const promise = controller.findByIdAndUpdate(req, pid, headers, updateDto);

    await expect(promise).rejects.toThrow("Update error due to failed if-modified-since condition");

    expect(datasetsService.findOne).toHaveBeenCalledWith({where: {pid}});
    expect(datasetsService.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(checkSpy).toHaveBeenCalledTimes(1);
  });
});






