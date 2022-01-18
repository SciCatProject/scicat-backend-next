import { Module } from "@nestjs/common";
import { ProposalsService } from "./proposals.service";
import { ProposalsController } from "./proposals.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Proposal, ProposalSchema } from "./schemas/proposal.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { AttachmentsModule } from "src/attachments/attachments.module";

@Module({
  imports: [
    AttachmentsModule,
    MongooseModule.forFeature([
      {
        name: Proposal.name,
        schema: ProposalSchema,
      },
    ]),
  ],
  controllers: [ProposalsController],
  providers: [ProposalsService, CaslAbilityFactory],
})
export class ProposalsModule {}
