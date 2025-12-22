import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { LogbooksService } from "src/logbooks/logbooks.service";
import { MetadataKeysV4Service } from "./metadatakeys.v4.service";

@ApiBearerAuth()
@ApiTags("metadata keys v4")
@Controller({ path: "metadatakeys", version: "4" })
export class MetadataKeysV4Controller {
  constructor(
    private metadatakeysService: MetadataKeysV4Service,
    private caslAbilityFactory: CaslAbilityFactory,
    private logbooksService: LogbooksService,
  ) {}
}