import { HttpException, Logger } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { PublishedDataService } from "./published-data.service";
import { PublishedData } from "./schemas/published-data.schema";
import { HttpModule, HttpService } from "@nestjs/axios";
import { AxiosInstance } from "axios";
import fs from "fs";
import { of } from "rxjs";
import { AxiosResponse } from "axios";

const mockPublishedData: PublishedData = {
  doi: "100.10/random-test-uuid-string",
  _id: "100.10/random-test-uuid-string",
  affiliation: "Test affiliation",
  creator: ["Test Creator"],
  publisher: "Test publisher",
  publicationYear: 2022,
  title: "Test Title",
  url: "https://host.com",
  abstract: "Test abstract",
  dataDescription: "Test dataDescription",
  resourceType: "Test resourceType",
  numberOfFiles: 1,
  sizeOfArchive: 1000000,
  pidArray: ["100.10/test-pid-uuid-string"],
  authors: ["Test Author"],
  registeredTime: new Date("2022-02-15T13:00:00"),
  status: "registered",
  scicatUser: "Test scicatUser",
  thumbnail: "Test thumbnail",
  relatedPublications: ["test RelatedPublications"],
  downloadLink: "https://link.download.com",
  createdAt: new Date("2022-02-15T13:00:00"),
  updatedAt: new Date("2022-02-15T13:00:00"),
};

const mockAxiosResponse: Partial<AxiosResponse> = {
  data: "success",
  status: 200,
  statusText: "OK",
};

describe("PublishedDataService", () => {
  let service: PublishedDataService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: Model<PublishedData>;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        PublishedDataService,
        {
          provide: getModelToken("PublishedData"),
          useValue: {
            new: jest.fn().mockResolvedValue(mockPublishedData),
            constructor: jest.fn().mockResolvedValue(mockPublishedData),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: "AXIOS_INSTANCE_TOKEN",
          useValue: {} as AxiosInstance,
        },
      ],
    }).compile();

    service = await module.resolve<PublishedDataService>(PublishedDataService);
    model = module.get<Model<PublishedData>>(getModelToken("PublishedData"));
    httpService = module.get<HttpService>(HttpService);
    Logger.error = jest.fn();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("resyncOAIPublication", () => {
    const id = "test-id";
    const OAIServerUri = "https://oaimockserver.com";
    const doiCredentials = {
      username: "the_username",
      password: "the_password",
    };

    it("should throw HttpException if doiConfigPath file does not exist", async () => {
      jest.mock("fs");
      jest.spyOn(fs, "existsSync").mockReturnValue(false);

      await expect(
        service.resyncOAIPublication(id, mockPublishedData, OAIServerUri),
      ).rejects.toThrowError(HttpException);
    });

    it("should call httpService.request with correct payload", async () => {
      jest.mock("fs");
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest
        .spyOn(fs, "readFileSync")
        .mockReturnValueOnce(JSON.stringify(doiCredentials));
      jest
        .spyOn(httpService, "request")
        .mockReturnValueOnce(of(mockAxiosResponse as AxiosResponse));
      await service.resyncOAIPublication(id, mockPublishedData, OAIServerUri);

      expect(httpService.request).toHaveBeenCalledTimes(1);

      expect(httpService.request).toHaveBeenCalledWith({
        method: "PUT",
        json: true,
        body: mockPublishedData,
        auth: doiCredentials,
        uri: OAIServerUri + "/" + id,
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      });
    });

    it("should throw HttpException if request to oaiProvider raise exception", async () => {
      jest.mock("fs");
      jest.spyOn(fs, "existsSync").mockReturnValueOnce(true);
      jest
        .spyOn(fs, "readFileSync")
        .mockReturnValueOnce(JSON.stringify(doiCredentials));
      jest.spyOn(httpService, "request").mockImplementation(() => {
        throw new Error();
      });

      await expect(
        service.resyncOAIPublication(id, mockPublishedData, OAIServerUri),
      ).rejects.toThrowError(HttpException);

      expect(Logger.error).toBeCalled();
    });
  });
});
