import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { CaslModule } from "src/casl/casl.module";
//import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { DatasetsService } from "src/datasets/datasets.service";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { UsersService } from "src/users/users.service";

class JobsServiceMock {}
class DatasetsServiceMock {}
class OrigDatablocksServiceMock {}
class UsersServiceMock {}

describe("JobsController", () => {
  let controller: JobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      imports:[CaslModule],
      providers: [
        //CaslAbilityFactory,
        { provide: JobsService, useClass: JobsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: UsersService, useClass: UsersServiceMock},
        { provide: EventEmitter2, useClass: EventEmitter2 },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
