import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { Role } from "src/auth/role.enum";
import { Datablock } from "src/datablocks/schemas/datablock.schema";
import { Dataset } from "src/datasets/schemas/dataset.schema";
import { Logbook } from "src/logbooks/schemas/logbook.schema";
import { OrigDatablock } from "src/origdatablocks/schemas/origdatablock.schema";
import { Policy } from "src/policies/schemas/policy.schema";
import { Proposal } from "src/proposals/schemas/proposal.schema";
import { PublishedData } from "src/published-data/schemas/published-data.schema";
import { Sample } from "src/samples/schemas/sample.schema";
import { UserIdentity } from "src/users/schemas/user-identity.schema";
import { User } from "src/users/schemas/user.schema";
import { Action } from "./action.enum";

type Subjects =
  | InferSubjects<
      | typeof Attachment
      | typeof Datablock
      | typeof Dataset
      | typeof Logbook
      | typeof OrigDatablock
      | typeof Policy
      | typeof Proposal
      | typeof PublishedData
      | typeof Sample
      | typeof User
      | typeof UserIdentity
    >
  | "all";

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    can(Action.Read, Dataset, { isPublished: true });
    can(Action.Read, Dataset, {
      isPublished: false,
      ownerGroup: { $in: user.currentGroups },
    });
    can(Action.Read, Dataset, {
      isPublished: false,
      accessGroups: { $in: user.currentGroups },
    });
    can(Action.Read, Dataset, {
      sharedWith: user.email,
    });

    can(
      Action.Update,
      Dataset,
      ["isPublished", "keywords", "scientificMetadata"],
      {
        ownerGroup: { $in: user.currentGroups },
      },
    );

    can(Action.Read, Logbook);

    can(Action.Manage, Policy, { ownerGroup: { $in: user.currentGroups } });

    can(Action.Read, Proposal, { ownerGroup: { $in: user.currentGroups } });
    can(Action.Read, Proposal, { accessGroups: { $in: user.currentGroups } });

    can(Action.Read, PublishedData);
    can(Action.Update, PublishedData);

    can(Action.Create, Sample);
    can(Action.Read, Sample, { ownerGroup: { $in: user.currentGroups } });
    can(Action.Read, Sample, { accessGroups: { $in: user.currentGroups } });

    can(Action.Manage, Attachment, { ownerGroup: { $in: user.currentGroups } });
    can(Action.Manage, Datablock, { ownerGroup: { $in: user.currentGroups } });
    can(Action.Manage, OrigDatablock, {
      ownerGroup: { $in: user.currentGroups },
    });

    if (user.currentGroups.includes(Role.Admin)) {
      can(Action.Manage, "all");
    }
    if (user.currentGroups.includes(Role.ArchiveManager)) {
      cannot(Action.Create, Dataset);
      cannot(Action.Update, Dataset);
      can(Action.Delete, Dataset);
    }
    if (user.currentGroups.includes(Role.GlobalAccess)) {
      can(Action.Read, "all");
    }
    if (user.currentGroups.includes(Role.Ingestor)) {
      cannot(Action.Delete, Dataset);
      can(Action.Create, Dataset);
      can(Action.Update, Dataset);

      can(Action.Create, Attachment);
    }
    if (user.currentGroups.includes(Role.ProposalIngestor)) {
      cannot(Action.Delete, Proposal);
      can(Action.Create, Proposal);
      can(Action.Update, Proposal);
    }

    can(Action.Read, UserIdentity, { userId: user._id });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
