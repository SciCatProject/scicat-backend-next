import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { ProposalsService } from "./proposals.service";
import { Proposal } from "./schemas/proposal.schema";

const mockProposal: Proposal = {
  pi_email: "testPi@email.com",
  pi_firstname: "testPiFirstname",
  pi_lastname: "testPiLastname",
  email: "testName@email.com",
  firstname: "testFirstname",
  lastname: "testLastname",
  title: "Test Proposal Title",
  abstract: "Test abstract.",
  startTime: new Date(),
  endTime: new Date(),
  ownerGroup: "testOwnerGroup",
  accessGroups: ["testAccessGroup"],
  createdBy: "proposalIngestor",
  updatedBy: "proposalIngestor",
};

describe("ProposalsService", () => {
  let service: ProposalsService;
  let model: Model<Proposal>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalsService,
        {
          provide: getModelToken("Proposal"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockProposal),
            constructor: jest.fn().mockResolvedValue(mockProposal),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProposalsService>(ProposalsService);
    model = module.get<Model<Proposal>>(getModelToken("Proposal"));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
