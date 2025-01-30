import { ConfigService } from "@nestjs/config";
import { CaslAbilityFactory } from "./casl-ability.factory";

describe("CaslAbilityFactory", () => {
  it("should be defined", () => {
    expect(new CaslAbilityFactory(new ConfigService())).toBeDefined();
  });
});
