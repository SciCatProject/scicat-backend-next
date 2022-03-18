import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { AttachmentsService } from "./attachments.service";
import { Attachment } from "./schemas/attachment.schema";

const mockAttachment: Attachment = {
  _id: "testId",
  thumbnail: "testThumbnail",
  caption: "Test caption",
  datasetId: "testDatasetId",
  proposalId: "testProposalId",
  sampleId: "testSampleId",
  ownerGroup: "test",
  accessGroups: ["accessTest"],
  instrumentGroup: "testInstrument",
  createdBy: "testUser",
  updatedBy: "testUser",
};

describe("AttachmentsService", () => {
  let service: AttachmentsService;
  let attachmentModel: Model<Attachment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        {
          provide: getModelToken("Attachment"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockAttachment),
            constructor: jest.fn().mockResolvedValue(mockAttachment),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttachmentsService>(AttachmentsService);
    attachmentModel = module.get<Model<Attachment>>(
      getModelToken("Attachment"),
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
