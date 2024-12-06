import { MailerModule, MailerService } from "@nestjs-modules/mailer";
import { CaslAbilityFactory } from "./casl-ability.factory";
import { Test, TestingModule } from "@nestjs/testing";
import { CaslModule } from "./casl.module";

class MailerServiceMock {}

describe("CaslAbilityFactory", () => {
  let casl: CaslAbilityFactory;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MailerModule.forRoot(), CaslModule],
    })
      .overrideProvider(MailerService)
      .useClass(MailerServiceMock)
      .compile();

    casl = module.get<CaslAbilityFactory>(CaslAbilityFactory);
  });

  it("should be defined", () => {
    expect(casl).toBeDefined();
  });
});
