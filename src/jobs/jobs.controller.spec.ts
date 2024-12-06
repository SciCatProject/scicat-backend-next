import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { CaslModule } from "src/casl/casl.module";
import { DatasetsService } from "src/datasets/datasets.service";
import { OrigDatablocksService } from "src/origdatablocks/origdatablocks.service";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { UsersService } from "src/users/users.service";
import { MailerModule, MailerService } from "@nestjs-modules/mailer";

import { JobConfigService } from "src/config/job-config/jobconfig.service";
import { ConfigModule } from "@nestjs/config";

class JobsServiceMock {}
class DatasetsServiceMock {}
class OrigDatablocksServiceMock {}
class UsersServiceMock {}
class MailerServiceMock {}
class JobsConfigMock {}

describe("JobsController", () => {
  let controller: JobsController;

  beforeEach(async () => {
    const path = "test/config/jobconfig.yaml";
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      imports: [
        ConfigModule.forRoot({
          load: [() => ({ jobConfigurationFile: path })],
        }),
        MailerModule.forRoot(),
        CaslModule,
      ],
      providers: [
        { provide: JobConfigService, useClass: JobsConfigMock },
        { provide: JobsService, useClass: JobsServiceMock },
        { provide: DatasetsService, useClass: DatasetsServiceMock },
        { provide: OrigDatablocksService, useClass: OrigDatablocksServiceMock },
        { provide: UsersService, useClass: UsersServiceMock },
        { provide: EventEmitter2, useClass: EventEmitter2 },
      ],
    })
      .overrideProvider(MailerService)
      .useClass(MailerServiceMock)
      .compile();

    controller = module.get<JobsController>(JobsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
