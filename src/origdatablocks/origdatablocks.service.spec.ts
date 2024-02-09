import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { OrigDatablocksService } from "./origdatablocks.service";
import { OrigDatablock } from "./schemas/origdatablock.schema";

const mockOrigDatablock: OrigDatablock = {
  _id: "testId",
  datasetId: "testPid",
  size: 1000,
  ownerGroup: "testOwner",
  accessGroups: ["testAccess"],
  instrumentGroup: "testInstrument",
  createdBy: "testUser",
  updatedBy: "testUser",
  chkAlg: "sha1",
  createdAt: new Date(),
  updatedAt: new Date(),
  isPublished: false,
  dataFileList: [
    {
      path: "testFile.hdf5",
      size: 1000,
      time: new Date(),
      chk: "testChk",
      uid: "testUid",
      gid: "testGid",
      perm: "testPerm",
    },
  ],
};

describe("OrigdatablocksService", () => {
  let service: OrigDatablocksService;
  let model: Model<OrigDatablock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrigDatablocksService,
        {
          provide: getModelToken("OrigDatablock"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockOrigDatablock),
            constructors: jest.fn().mockResolvedValue(mockOrigDatablock),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = await module.resolve<OrigDatablocksService>(
      OrigDatablocksService,
    );
    model = module.get<Model<OrigDatablock>>(getModelToken("OrigDatablock"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
