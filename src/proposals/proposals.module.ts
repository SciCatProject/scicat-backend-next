import { Module } from "@nestjs/common";
import { ProposalsService } from "./proposals.service";
import { ProposalsController } from "./proposals.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Proposal, ProposalSchema } from "./schemas/proposal.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { DatasetsModule } from "src/datasets/datasets.module";

@Module({
  imports: [
    AttachmentsModule,
    DatasetsModule,
    MongooseModule.forFeatureAsync([
      {
        name: Proposal.name,
        useFactory: () => {
          const schema = ProposalSchema;

          schema.pre<Proposal>("save", function (next) {
            // if _id is empty or different than proposalId,
            // set _id to proposalId
            if (!this._id) {
              this._id = this.proposalId;
            }
            next();
          });
          return schema;
        },
      },
    ]),
  ],
  exports: [ProposalsService],
  controllers: [ProposalsController],
  providers: [ProposalsService, CaslAbilityFactory],
})
export class ProposalsModule {}
