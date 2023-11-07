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
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { Instrument } from "src/instruments/schemas/instrument.schema";
import { JobClass } from "src/jobs/schemas/job.schema";
import { Logbook } from "src/logbooks/schemas/logbook.schema";
import { OrigDatablock } from "src/origdatablocks/schemas/origdatablock.schema";
import { Policy } from "src/policies/schemas/policy.schema";
import { ProposalClass } from "src/proposals/schemas/proposal.schema";
import { PublishedData } from "src/published-data/schemas/published-data.schema";
import { SampleClass } from "src/samples/schemas/sample.schema";
import { UserIdentity } from "src/users/schemas/user-identity.schema";
import { UserSettings } from "src/users/schemas/user-settings.schema";
import { User } from "src/users/schemas/user.schema";
import { Action } from "./action.enum";
import configuration from "src/config/configuration";

type Subjects =
  | string
  | InferSubjects<
      | typeof Attachment
      | typeof Datablock
      | typeof DatasetClass
      | typeof Instrument
      | typeof JobClass
      | typeof Logbook
      | typeof OrigDatablock
      | typeof Policy
      | typeof ProposalClass
      | typeof PublishedData
      | typeof SampleClass
      | typeof User
      | typeof UserIdentity
      | typeof UserSettings
    >
  | "all";

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    // // admin groups
    // const stringAdminGroups = process.env.ADMIN_GROUPS || "";
    // const adminGroups: string[] = stringAdminGroups
    //   ? stringAdminGroups.split(",").map((v) => v.trim())
    //   : [];
    // // delete groups
    // const stringDeleteGroups = process.env.DELETE_GROUPS || "";
    // const deleteGroups: string[] = stringDeleteGroups
    //   ? stringDeleteGroups.split(",").map((v) => v.trim())
    //   : [];
    // // create dataset groups
    // const stringCreateDatasetGroups =
    //   process.env.CREATE_DATASET_GROUPS || "all";
    // const createDatasetGroups: string[] = stringCreateDatasetGroups
    //   .split(",")
    //   .map((v) => v.trim());

    /*
    / Set permissions for different type of users for the following subsystems:
    / - Datasets (https://scicatproject.github.io/documentation/Development/v4.x/backend/authorization/authorization_datasets.html)
    / - OrigDatablocks (https://scicatproject.github.io/documentation/Development/v4.x/backend/authorization/authorization_origdatablocks.html)
     */
    if (
      user.currentGroups.some((g) => configuration().deleteGroups.includes(g))
    ) {
      /*
      / user that belongs to any of the group listed in DELETE_GROUPS
      */

      // -------------------------------------
      // datasets
      // -------------------------------------
      // endpoint authorization
      can(Action.DatasetDelete, DatasetClass);
      // -
      can(Action.DatasetOrigdatablockDelete, DatasetClass);
      // -
      can(Action.DatasetDatablockDelete, DatasetClass);
      // -------------------------------------
      // data instance authorization
      can(Action.DatasetDeleteAny, DatasetClass);
      // -
      can(Action.DatasetOrigdatablockDeleteAny, DatasetClass);
      // -
      can(Action.DatasetDatablockDeleteAny, DatasetClass);

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      can(Action.OrigdatablockDelete, DatasetClass);
      // -------------------------------------
      // data instance authorization
      can(Action.OrigdatablockDeleteAny, DatasetClass);
    } else {
      /*
      / unauthorized user or user that does not belong to any of the group listed in DELETE_GROUPS
      */

      // -------------------------------------
      // datasets
      // -------------------------------------
      // endpoint authorization
      cannot(Action.DatasetDelete, DatasetClass);
      // -
      cannot(Action.DatasetOrigdatablockDelete, DatasetClass);
      // -
      cannot(Action.DatasetDatablockDelete, DatasetClass);

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      cannot(Action.OrigdatablockDelete, DatasetClass);
    }

    if (
      user.currentGroups.some((g) => configuration().adminGroups.includes(g))
    ) {
      /*
      / user that belongs to any of the group listed in ADMIN_GROUPS
      */

      // this tests should be all removed, once we are done with authorization review
      //can(Action.ListAll, DatasetClass);
      can(Action.ListAll, ProposalClass);
      can(Action.ReadAll, UserIdentity);

      // -------------------------------------
      // datasets
      // -------------------------------------
      // endpoint authorization
      can(Action.DatasetCreate, DatasetClass);
      can(Action.DatasetRead, DatasetClass);
      can(Action.DatasetUpdate, DatasetClass);
      // -
      can(Action.DatasetAttachmentCreate, DatasetClass);
      can(Action.DatasetAttachmentRead, DatasetClass);
      can(Action.DatasetAttachmentUpdate, DatasetClass);
      can(Action.DatasetAttachmentDelete, DatasetClass);
      // -
      can(Action.DatasetOrigdatablockCreate, DatasetClass);
      can(Action.DatasetOrigdatablockRead, DatasetClass);
      can(Action.DatasetOrigdatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetDatablockCreate, DatasetClass);
      can(Action.DatasetDatablockRead, DatasetClass);
      can(Action.DatasetDatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetLogbookRead, DatasetClass);
      // -------------------------------------
      // data instance authorization
      can(Action.DatasetCreateAny, DatasetClass);
      can(Action.DatasetReadAny, DatasetClass);
      can(Action.DatasetUpdateAny, DatasetClass);
      // -
      can(Action.DatasetAttachmentCreateAny, DatasetClass);
      can(Action.DatasetAttachmentReadAny, DatasetClass);
      can(Action.DatasetAttachmentUpdateAny, DatasetClass);
      can(Action.DatasetAttachmentDeleteAny, DatasetClass);
      // -
      can(Action.DatasetOrigdatablockCreateAny, DatasetClass);
      can(Action.DatasetOrigdatablockReadAny, DatasetClass);
      can(Action.DatasetOrigdatablockUpdateAny, DatasetClass);
      // -
      can(Action.DatasetDatablockCreateAny, DatasetClass);
      can(Action.DatasetDatablockReadAny, DatasetClass);
      can(Action.DatasetDatablockUpdateAny, DatasetClass);
      // -------------------------------------
      can(Action.DatasetLogbookReadAny, DatasetClass);

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      can(Action.OrigdatablockRead, OrigDatablock);
      can(Action.OrigdatablockCreate, OrigDatablock);
      can(Action.OrigdatablockUpdate, OrigDatablock);
      // -------------------------------------
      // data instance authorization
      can(Action.OrigdatablockReadAny, OrigDatablock);
      can(Action.OrigdatablockCreateAny, OrigDatablock);
      can(Action.OrigdatablockUpdateAny, OrigDatablock);

      // -------------------------------------
      // user endpoint, including useridentity
      can(Action.UserReadAny, User);
      can(Action.UserCreateAny, User);
      can(Action.UserUpdateAny, User);
      can(Action.UserDeleteAny, User);
      can(Action.UserCreateJwt, User);
      // -------------------------------------
      // instrument
      can(Action.InstrumentRead, Instrument);
      can(Action.InstrumentCreate, Instrument);
      can(Action.InstrumentUpdate, Instrument);
      cannot(Action.InstrumentDelete, Instrument);
      // -------------------------------------
      // policies
      can(Action.Update, Policy);
    } else if (
      user.currentGroups.some((g) =>
        configuration().createDatasetPrivilegedGroups.includes(g),
      )
    ) {
      /**
      /*  users belonging to CREATE_DATASET_PRIVILEGED_GROUPS
      **/

      // -------------------------------------
      // datasets
      // -------------------------------------
      // endpoint authorization
      can(Action.DatasetCreate, DatasetClass);
      can(Action.DatasetRead, DatasetClass);
      can(Action.DatasetUpdate, DatasetClass);
      // -
      can(Action.DatasetAttachmentCreate, DatasetClass);
      can(Action.DatasetAttachmentRead, DatasetClass);
      can(Action.DatasetAttachmentUpdate, DatasetClass);
      can(Action.DatasetAttachmentDelete, DatasetClass);
      // -
      can(Action.DatasetOrigdatablockCreate, DatasetClass);
      can(Action.DatasetOrigdatablockRead, DatasetClass);
      can(Action.DatasetOrigdatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetDatablockCreate, DatasetClass);
      can(Action.DatasetDatablockRead, DatasetClass);
      can(Action.DatasetDatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetLogbookRead, DatasetClass);
      // -------------------------------------
      // data instance authorization
      can(Action.DatasetCreateAny, DatasetClass);
      can(Action.DatasetReadManyAccess, DatasetClass);
      can(Action.DatasetReadOneAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetReadOneAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetReadOneAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetAttachmentCreateAny, DatasetClass);
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetAttachmentUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentDeleteOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetOrigdatablockCreateAny, DatasetClass);
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetOrigdatablockUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetDatablockCreateAny, DatasetClass);
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetDatablockUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetLogbookReadOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      can(Action.OrigdatablockRead, OrigDatablock);
      can(Action.OrigdatablockCreate, OrigDatablock);
      can(Action.OrigdatablockUpdate, OrigDatablock);
      // -------------------------------------
      // data instance authorization
      can(Action.OrigdatablockCreateAny, OrigDatablock);
      can(Action.OrigdatablockReadManyAccess, OrigDatablock);
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockUpdateOwner, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
    } else if (
      user.currentGroups.some((g) =>
        configuration().createDatasetWithPidGroups.includes(g),
      ) ||
      configuration().createDatasetWithPidGroups.includes("#all")
    ) {
      /**
      /*  users belonging to CREATE_DATASET_WITH_PID_GROUPS
      **/

      // -------------------------------------
      // datasets endpoint authorization
      can(Action.DatasetCreate, DatasetClass);
      can(Action.DatasetRead, DatasetClass);
      can(Action.DatasetUpdate, DatasetClass);
      // -
      can(Action.DatasetAttachmentCreate, DatasetClass);
      can(Action.DatasetAttachmentRead, DatasetClass);
      can(Action.DatasetAttachmentUpdate, DatasetClass);
      can(Action.DatasetAttachmentDelete, DatasetClass);
      // -
      can(Action.DatasetOrigdatablockCreate, DatasetClass);
      can(Action.DatasetOrigdatablockRead, DatasetClass);
      can(Action.DatasetOrigdatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetDatablockCreate, DatasetClass);
      can(Action.DatasetDatablockRead, DatasetClass);
      can(Action.DatasetDatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetLogbookRead, DatasetClass);
      // -------------------------------------
      // datasets data instance authorization
      can(Action.DatasetCreateOwnerWithPid, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetReadManyAccess, DatasetClass);
      can(Action.DatasetReadOneAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetReadOneAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetReadOneAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetAttachmentCreateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetAttachmentUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentDeleteOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetOrigdatablockCreateAny, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetOrigdatablockUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetDatablockCreateAny, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetDatablockUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetLogbookReadOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      can(Action.OrigdatablockRead, OrigDatablock);
      can(Action.OrigdatablockCreate, OrigDatablock);
      can(Action.OrigdatablockUpdate, OrigDatablock);
      // -------------------------------------
      // data instance authorization
      can(Action.OrigdatablockCreateOwner, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadManyAccess, OrigDatablock);
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        isPublished: true,
      });
      can(Action.OrigdatablockUpdateOwner, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
    } else if (
      user.currentGroups.some((g) =>
        configuration().createDatasetGroups.includes(g),
      ) ||
      configuration().createDatasetGroups.includes("#all")
    ) {
      /**
      /*  users belonging to CREATE_DATASET_GROUPS
      **/

      // -------------------------------------
      // datasets endpoint authorization
      can(Action.DatasetCreate, DatasetClass);
      can(Action.DatasetRead, DatasetClass);
      can(Action.DatasetUpdate, DatasetClass);
      // -
      can(Action.DatasetAttachmentCreate, DatasetClass);
      can(Action.DatasetAttachmentRead, DatasetClass);
      can(Action.DatasetAttachmentUpdate, DatasetClass);
      can(Action.DatasetAttachmentDelete, DatasetClass);
      // -
      can(Action.DatasetOrigdatablockCreate, DatasetClass);
      can(Action.DatasetOrigdatablockRead, DatasetClass);
      can(Action.DatasetOrigdatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetDatablockCreate, DatasetClass);
      can(Action.DatasetDatablockRead, DatasetClass);
      can(Action.DatasetDatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetLogbookRead, DatasetClass);
      // -------------------------------------
      // datasets data instance authorization
      can(Action.DatasetCreateOwnerNoPid, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
        pid: { $exists: false },
      });
      can(Action.DatasetReadManyAccess, DatasetClass);
      can(Action.DatasetReadOneAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetReadOneAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetReadOneAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetAttachmentCreateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetAttachmentUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentDeleteOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetOrigdatablockCreateAny, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetOrigdatablockUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetDatablockCreateAny, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetDatablockUpdateOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      // -
      can(Action.DatasetLogbookReadOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      can(Action.OrigdatablockRead, OrigDatablock);
      can(Action.OrigdatablockCreate, OrigDatablock);
      can(Action.OrigdatablockUpdate, OrigDatablock);
      // -------------------------------------
      // data instance authorization
      can(Action.OrigdatablockCreateOwner, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadManyAccess, OrigDatablock);
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        isPublished: true,
      });
      can(Action.OrigdatablockUpdateOwner, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
    } else if (user) {
      /**
      /*  authenticated users
      **/

      // -------------------------------------
      // datasets endpoint authorization
      cannot(Action.DatasetCreate, DatasetClass);
      can(Action.DatasetRead, DatasetClass);
      cannot(Action.DatasetUpdate, DatasetClass);
      // -
      cannot(Action.DatasetAttachmentCreate, DatasetClass);
      can(Action.DatasetAttachmentRead, DatasetClass);
      cannot(Action.DatasetAttachmentUpdate, DatasetClass);
      cannot(Action.DatasetAttachmentDelete, DatasetClass);
      // -
      cannot(Action.DatasetOrigdatablockCreate, DatasetClass);
      can(Action.DatasetOrigdatablockRead, DatasetClass);
      cannot(Action.DatasetOrigdatablockUpdate, DatasetClass);
      // -
      cannot(Action.DatasetDatablockCreate, DatasetClass);
      can(Action.DatasetDatablockRead, DatasetClass);
      cannot(Action.DatasetDatablockUpdate, DatasetClass);
      // -
      can(Action.DatasetLogbookRead, DatasetClass);
      // -------------------------------------
      // datasets data instance authorization
      can(Action.DatasetReadManyAccess, DatasetClass);
      can(Action.DatasetReadOneAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetReadOneAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetReadOneAccess, DatasetClass, {
        isPublished: true,
      });
      // -
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetAttachmentReadAccess, DatasetClass, {
        isPublished: true,
      });
      // -
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetOrigdatablockReadAccess, DatasetClass, {
        isPublished: true,
      });
      // -
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatasetDatablockReadAccess, DatasetClass, {
        isPublished: true,
      });
      // -
      can(Action.DatasetLogbookReadOwner, DatasetClass, {
        ownerGroup: { $in: user.currentGroups },
      });

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      can(Action.OrigdatablockRead, OrigDatablock);
      cannot(Action.OrigdatablockCreate, OrigDatablock);
      cannot(Action.OrigdatablockUpdate, OrigDatablock);
      // -------------------------------------
      // data instance authorization
      can(Action.OrigdatablockReadManyAccess, OrigDatablock);
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        isPublished: true,
      });
    } else {
      /**
      /*  unauthenticated users
      **/

      // -------------------------------------
      // datasets endpoint authorization
      cannot(Action.DatasetCreate, DatasetClass);
      can(Action.DatasetRead, DatasetClass);
      cannot(Action.DatasetUpdate, DatasetClass);
      // -
      cannot(Action.DatasetAttachmentCreate, DatasetClass);
      can(Action.DatasetAttachmentRead, DatasetClass);
      cannot(Action.DatasetAttachmentUpdate, DatasetClass);
      cannot(Action.DatasetAttachmentDelete, DatasetClass);
      // -
      cannot(Action.DatasetOrigdatablockCreate, DatasetClass);
      can(Action.DatasetOrigdatablockRead, DatasetClass);
      cannot(Action.DatasetOrigdatablockUpdate, DatasetClass);
      // -
      cannot(Action.DatasetDatablockCreate, DatasetClass);
      can(Action.DatasetDatablockRead, DatasetClass);
      cannot(Action.DatasetDatablockUpdate, DatasetClass);
      // -
      cannot(Action.DatasetLogbookRead, DatasetClass);
      // -------------------------------------
      // datasets data instance authorization
      can(Action.DatasetReadManyPublic, DatasetClass);
      can(Action.DatasetReadOnePublic, DatasetClass, {
        isPublished: true,
      });
      // -
      can(Action.DatasetAttachmentReadPublic, DatasetClass, {
        isPublished: true,
      });
      // -
      can(Action.DatasetOrigdatablockReadPublic, DatasetClass, {
        isPublished: true,
      });
      // -
      can(Action.DatasetDatablockReadPublic, DatasetClass, {
        isPublished: true,
      });

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      can(Action.OrigdatablockRead, OrigDatablock);
      cannot(Action.OrigdatablockCreate, OrigDatablock);
      cannot(Action.OrigdatablockUpdate, OrigDatablock);
      // -------------------------------------
      // data instance authorization
      can(Action.OrigdatablockReadManyAccess, OrigDatablock);
      can(Action.OrigdatablockReadOneAccess, OrigDatablock, {
        isPublished: true,
      });
    }

    if (
      user.currentGroups.some((g) => configuration().adminGroups.includes(g))
    ) {
      /**
       * authenticated users belonging to any of the group listed in ADMIN_GROUPS
       */

      // -------------------------------------
      // jobs
      // -------------------------------------
      // endpoint authorization
      can(Action.JobsRead, JobClass);
      can(Action.JobsCreate, JobClass);
      can(Action.JobsUpdate, JobClass);
      // -------------------------------------
      // data instance authorization
      can(Action.JobsReadAny, JobClass);
      can(Action.JobsCreateAny, JobClass);
      can(Action.JobsUpdateAny, JobClass);
    } else if (
      user.currentGroups.some((g) =>
        configuration().createJobsGroups.includes(g),
      )
    ) {
      /**
       * authenticated users belonging to any of the group listed in CREATE_JOBS_GROUPS
       */

      // -------------------------------------
      // jobs
      // -------------------------------------
      // endpoint authorization
      can(Action.JobsRead, JobClass);
      can(Action.JobsCreate, JobClass);
      can(Action.JobsUpdate, JobClass);
      // -------------------------------------
      // data instance authorization
      can(Action.JobsCreateAny, JobClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.JobsReadAccess, JobClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.JobsUpdateAny, JobClass, {
        ownerGroup: { $in: user.currentGroups },
      });
    } else if (
      user.currentGroups.some((g) =>
        configuration().updateJobsGroups.includes(g),
      )
    ) {
      /**
       * authenticated users belonging to any of the group listed in UPDATE_JOBS_GROUPS
       */

      // -------------------------------------
      // jobs
      // -------------------------------------
      // endpoint authorization
      cannot(Action.JobsRead, JobClass);
      cannot(Action.JobsCreate, JobClass);
      can(Action.JobsUpdate, JobClass);
      // -------------------------------------
      // data instance authorization
      can(Action.JobsUpdateAny, JobClass, {
        ownerGroup: { $in: user.currentGroups },
      });
    } else if (user) {
      /**
       * authenticated users
       */

      // -------------------------------------
      // jobs
      // -------------------------------------
      // endpoint authorization
      can(Action.JobsRead, JobClass);
      cannot(Action.JobsCreate, JobClass);
      cannot(Action.JobsUpdate, JobClass);
      // -------------------------------------
      // data instance authorization
      can(Action.JobsReadAccess, JobClass, {
        ownerGroup: { $in: user.currentGroups },
      });
    } else {
      /**
       * unauthenticated users
       */

      // -------------------------------------
      // jobs
      // -------------------------------------
      // endpoint authorization
      cannot(Action.JobsRead, JobClass);
      cannot(Action.JobsCreate, JobClass);
      cannot(Action.JobsUpdate, JobClass);
    }

    /*
      can(Action.ListOwn, ProposalClass);

      // -------------------------------------
      // user endpoint, including useridentity
      // User can view, create, delete and update own user information
      can(Action.UserReadOwn, User, { _id: user._id });
      can(Action.UserCreateOwn, User, { _id: user._id });
      can(Action.UserUpdateOwn, User, { _id: user._id });
      can(Action.UserDeleteOwn, User, { _id: user._id });
      cannot(Action.UserReadAny, User);
      cannot(Action.UserCreateAny, User);
      cannot(Action.UserUpdateAny, User);
      cannot(Action.UserDeleteAny, User);
      cannot(Action.UserCreateJwt, User);
      // -------------------------------------
      // instrument
      can(Action.InstrumentRead, Instrument);
      cannot(Action.InstrumentCreate, Instrument);
      cannot(Action.InstrumentUpdate, Instrument);
      cannot(Action.InstrumentDelete, Instrument);



      ||
      user.currentGroups.some((g) =>
        configuration().createDatasetGroups.includes(g),
      ) ||
      configuration().createDatasetGroups.includes("#all")
        
    } else {
      // anonymous users
      //
      // Dataset endpoints actions
      can(Action.DatasetReadPublic, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetAttachmentReadPublic, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetOrigdatablockReadPublic, DatasetClass, {
        isPublished: true,
      });
      can(Action.DatasetDatablockReadPublic, DatasetClass, {
        isPublished: true,
      });
      
      cannot(Action.DatasetCreateAny, DatasetClass);
      cannot(Action.DatasetAttachmentCreateAny, DatasetClass);
      cannot(Action.DatasetOrigdatablockCreateAny, DatasetClass);
      cannot(Action.DatasetDatablockCreateAny, DatasetClass);
      cannot(Action.DatasetReadAny, DatasetClass);
      cannot(Action.DatasetAttachmentReadAny, DatasetClass);
      cannot(Action.DatasetOrigdatablockReadAny, DatasetClass);
      cannot(Action.DatasetDatablockReadAny, DatasetClass);
      cannot(Action.DatasetLogbookReadAny, DatasetClass);
      cannot(Action.DatasetUpdateAny, DatasetClass);
      cannot(Action.DatasetAttachmentUpdateAny, DatasetClass);
      cannot(Action.DatasetAttachmentDeleteAny, DatasetClass);
      cannot(Action.DatasetOrigdatablockUpdateAny, DatasetClass);
      cannot(Action.DatasetDatablockUpdateAny, DatasetClass);

      cannot(Action.DatasetCreateOwn, DatasetClass);
      cannot(Action.DatasetAttachmentCreateOwn, DatasetClass);
      cannot(Action.DatasetOrigdatablockCreateOwn, DatasetClass);
      cannot(Action.DatasetDatablockCreateOwn, DatasetClass);
      cannot(Action.DatasetReadOwn, DatasetClass);
      cannot(Action.DatasetAttachmentReadOwn, DatasetClass);
      cannot(Action.DatasetOrigdatablockReadOwn, DatasetClass);
      cannot(Action.DatasetDatablockReadOwn, DatasetClass);
      cannot(Action.DatasetLogbookReadOwn, DatasetClass);
      cannot(Action.DatasetUpdateOwn, DatasetClass);
      cannot(Action.DatasetAttachmentUpdateOwn, DatasetClass);
      cannot(Action.DatasetAttachmentDeleteOwn, DatasetClass);
      cannot(Action.DatasetOrigdatablockUpdateOwn, DatasetClass);
      cannot(Action.DatasetDatablockUpdateOwn, DatasetClass);

      // origdatablocks endpoint actions
      can(Action.OrigdatablockReadPublic, OrigDatablock, {
        isPublished: true,
      });
      cannot(Action.OrigdatablockCreateOwn, OrigDatablock);
      cannot(Action.OrigdatablockReadOwn, OrigDatablock);
      cannot(Action.OrigdatablockUpdateOwn, OrigDatablock);
    }
    */

    // Instrument permissions
    //can(Action.Read, Instrument);
    //if (user.currentGroups.some((g) => adminGroups.includes(g))) {
    //  can(Action.Manage, Instrument);
    //}

    //can(Action.Manage, JobClass);

    can(Action.Read, Logbook);

    can(Action.Manage, Policy, { ownerGroup: { $in: user.currentGroups } });

    can(Action.Read, ProposalClass, {
      ownerGroup: { $in: user.currentGroups },
    });
    can(Action.Read, ProposalClass, {
      accessGroups: { $in: user.currentGroups },
    });

    can(Action.Read, PublishedData);
    can(Action.Update, PublishedData);
    can(Action.Create, PublishedData);

    can(Action.Create, SampleClass);
    can(Action.Read, SampleClass, { ownerGroup: { $in: user.currentGroups } });
    can(Action.Read, SampleClass, {
      accessGroups: { $in: user.currentGroups },
    });

    can(Action.Manage, Attachment, { ownerGroup: { $in: user.currentGroups } });
    can(Action.Manage, Datablock, { ownerGroup: { $in: user.currentGroups } });
    can(Action.Manage, OrigDatablock, {
      ownerGroup: { $in: user.currentGroups },
    });

    if (user.currentGroups.includes(Role.Admin)) {
      can(Action.Manage, "all");
    }
    if (user.currentGroups.includes(Role.ArchiveManager)) {
      //cannot(Action.Create, DatasetClass);
      //cannot(Action.Update, DatasetClass);
      //can(Action.Delete, DatasetClass);
      cannot(Action.Manage, OrigDatablock);
      cannot(Action.Create, OrigDatablock);
      cannot(Action.Update, OrigDatablock);
      can(Action.Delete, OrigDatablock);
      cannot(Action.Manage, Datablock);
      cannot(Action.Create, Datablock);
      cannot(Action.Update, Datablock);
      can(Action.Delete, Datablock);
      can(Action.Delete, PublishedData);
      //--------------------------------
      // instrument
      cannot(Action.InstrumentRead, Instrument);
      cannot(Action.InstrumentCreate, Instrument);
      cannot(Action.InstrumentUpdate, Instrument);
      can(Action.InstrumentDelete, Instrument);
    }
    //if (user.currentGroups.includes(Role.GlobalAccess)) {
    //  can(Action.Read, "all");
    //}
    if (user.currentGroups.includes(Role.Ingestor)) {
      can(Action.Create, Attachment);

      //cannot(Action.Delete, DatasetClass);
      //can(Action.Create, DatasetClass);
      //can(Action.Update, DatasetClass);

      can(Action.Create, Instrument);
      can(Action.Update, Instrument);
    }
    if (user.currentGroups.includes(Role.ProposalIngestor)) {
      cannot(Action.Delete, ProposalClass);
      can(Action.Create, ProposalClass);
      can(Action.Update, ProposalClass);
      can(Action.Read, ProposalClass);
      can(Action.ListAll, ProposalClass);
    }

    //can(Action.Create, UserSettings, { userId: user._id });
    //can(Action.Read, UserSettings, { userId: user._id });
    //can(Action.Update, UserSettings, { userId: user._id });

    if (
      user.currentGroups.some((g) => configuration().deleteGroups.includes(g))
    ) {
      can(Action.Delete, OrigDatablock);
      can(Action.Delete, Datablock);
      can(Action.Delete, PublishedData);
      can(Action.Delete, Instrument);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
