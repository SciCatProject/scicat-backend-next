import { Test, TestingModule } from "@nestjs/testing";
import { OrigDatablocksPublicV4Controller } from "./origdatablocks-public.v4.controller";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { ConfigModule } from "@nestjs/config";

class OrigDatablocksServiceMock {}

describe("OrigDatablocksPublicV4Controller", () => {
  let controller: OrigDatablocksPublicV4Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrigDatablocksPublicV4Controller],
      imports: [ConfigModule],
      providers: [
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
      ],
    }).compile();

    controller = module.get<OrigDatablocksPublicV4Controller>(
      OrigDatablocksPublicV4Controller,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
