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
import { Dataset } from "src/datasets/schemas/dataset.schema";
import { UserIdentity } from "src/users/schemas/user-identity.schema";
import { User } from "src/users/schemas/user.schema";
import { Action } from "./action.enum";

type Subjects =
  | InferSubjects<
      typeof Attachment | typeof Dataset | typeof User | typeof UserIdentity
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

    can(
      Action.Update,
      Dataset,
      ["isPublished", "keywords", "scientificMetadata"],
      {
        ownerGroup: { $in: user.currentGroups },
      },
    );

    can(Action.Manage, Attachment, { ownerGroup: { $in: user.currentGroups } });

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

    can(Action.Read, UserIdentity, { userId: user._id });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
