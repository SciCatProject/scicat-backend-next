import { Test, TestingModule } from "@nestjs/testing";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { JobsControllerUtils } from "./jobs.controller.utils";
import { RabbitMQService } from "src/common/rabbitmq/rabbitmq.service";
import { MailerModule, MailerService } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";

class JobsServiceMock {}
class JobsControllerUtilsMock {}
class MailerServiceMock {}
class RabbitMQMock {}
class CaslAbilityFactoryMock {}

describe("JobsController", () => {
  let controller: JobsController;

  beforeEach(async () => {
    const path = "test/config/jobconfig.yaml";
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              jobConfigurationFile: path,
              rabbitMq: {
                enabled: "yes",
                hostname: "rabbitmq",
                port: 5672,
                username: "guest",
                password: "guest",
              },
            }),
          ],
        }),
        MailerModule.forRoot(),
      ],
      providers: [
        { provide: JobsService, useClass: JobsServiceMock },
        { provide: JobsControllerUtils, useClass: JobsControllerUtilsMock },
        { provide: CaslAbilityFactory, useClass: CaslAbilityFactoryMock },
        { provide: RabbitMQService, useClass: RabbitMQMock },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === "rabbitMq.enabled") {
                return true;
              }
              return null;
            }),
          },
        },
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
