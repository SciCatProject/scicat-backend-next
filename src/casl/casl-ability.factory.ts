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
// import { Role } from "src/auth/role.enum";
import { Datablock } from "src/datablocks/schemas/datablock.schema";
import { DatasetClass } from "src/datasets/schemas/dataset.schema";
import { ElasticSearchActions } from "src/elastic-search/dto";
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
import { AuthOp } from "./authop.enum";
import configuration from "src/config/configuration";
import { CreateJobAuth, UpdateJobAuth } from "src/jobs/types/jobs-auth.enum";

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
      | typeof ElasticSearchActions
    >
  | "all";

export type AppAbility = Ability<[AuthOp, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[AuthOp, Subjects]>
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
    if (!user) {
      /**
      /*  unauthenticated users
      **/

      // -------------------------------------
      // datasets endpoint authorization
      cannot(AuthOp.DatasetCreate, DatasetClass);
      can(AuthOp.DatasetRead, DatasetClass);
      cannot(AuthOp.DatasetUpdate, DatasetClass);
      // -
      cannot(AuthOp.DatasetAttachmentCreate, DatasetClass);
      can(AuthOp.DatasetAttachmentRead, DatasetClass);
      cannot(AuthOp.DatasetAttachmentUpdate, DatasetClass);
      cannot(AuthOp.DatasetAttachmentDelete, DatasetClass);
      // -
      cannot(AuthOp.DatasetOrigdatablockCreate, DatasetClass);
      can(AuthOp.DatasetOrigdatablockRead, DatasetClass);
      cannot(AuthOp.DatasetOrigdatablockUpdate, DatasetClass);
      // -
      cannot(AuthOp.DatasetDatablockCreate, DatasetClass);
      can(AuthOp.DatasetDatablockRead, DatasetClass);
      cannot(AuthOp.DatasetDatablockUpdate, DatasetClass);
      // -
      cannot(AuthOp.DatasetLogbookRead, DatasetClass);
      // -------------------------------------
      // datasets data instance authorization
      can(AuthOp.DatasetReadManyPublic, DatasetClass);
      can(AuthOp.DatasetReadOnePublic, DatasetClass, {
        isPublished: true,
      });
      // -
      can(AuthOp.DatasetAttachmentReadPublic, DatasetClass, {
        isPublished: true,
      });
      // -
      can(AuthOp.DatasetOrigdatablockReadPublic, DatasetClass, {
        isPublished: true,
      });
      // -
      can(AuthOp.DatasetDatablockReadPublic, DatasetClass, {
        isPublished: true,
      });

      // -------------------------------------
      // origdatablock
      // -------------------------------------
      // endpoint authorization
      can(AuthOp.OrigdatablockRead, OrigDatablock);
      cannot(AuthOp.OrigdatablockCreate, OrigDatablock);
      cannot(AuthOp.OrigdatablockUpdate, OrigDatablock);
      // -------------------------------------
      // data instance authorization
      can(AuthOp.OrigdatablockReadManyAccess, OrigDatablock);
      can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
        isPublished: true,
      });

      cannot(AuthOp.UserReadOwn, User);
      cannot(AuthOp.UserCreateOwn, User);
      cannot(AuthOp.UserUpdateOwn, User);
      cannot(AuthOp.UserDeleteOwn, User);
      cannot(AuthOp.UserReadAny, User);
      cannot(AuthOp.UserCreateAny, User);
      cannot(AuthOp.UserUpdateAny, User);
      cannot(AuthOp.UserDeleteAny, User);
    } else {
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
        can(AuthOp.DatasetDelete, DatasetClass);
        // -
        can(AuthOp.DatasetOrigdatablockDelete, DatasetClass);
        // -
        can(AuthOp.DatasetDatablockDelete, DatasetClass);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.DatasetDeleteAny, DatasetClass);
        // -
        can(AuthOp.DatasetOrigdatablockDeleteAny, DatasetClass);
        // -
        can(AuthOp.DatasetDatablockDeleteAny, DatasetClass);

        // -------------------------------------
        // origdatablock
        // -------------------------------------
        // endpoint authorization
        can(AuthOp.OrigdatablockDelete, OrigDatablock);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.OrigdatablockDeleteAny, OrigDatablock);

        can(AuthOp.Delete, PublishedData);
        can(AuthOp.Delete, Policy);
      } else {
        /*
        /  user that does not belong to any of the group listed in DELETE_GROUPS
        */

        // -------------------------------------
        // datasets
        // -------------------------------------
        // endpoint authorization
        cannot(AuthOp.DatasetDelete, DatasetClass);
        // -
        cannot(AuthOp.DatasetOrigdatablockDelete, DatasetClass);
        // -
        cannot(AuthOp.DatasetDatablockDelete, DatasetClass);

        // -------------------------------------
        // origdatablock
        // -------------------------------------
        // endpoint authorization
        cannot(AuthOp.OrigdatablockDelete, OrigDatablock);
      }

      if (
        user.currentGroups.some((g) => configuration().adminGroups.includes(g))
      ) {
        /*
        / user that belongs to any of the group listed in ADMIN_GROUPS
        */

        // this tests should be all removed, once we are done with authorization review
        //can(AuthOp.ListAll, DatasetClass);
        // can(AuthOp.ListAll, ProposalClass);
        can(AuthOp.ReadAll, UserIdentity);

        // -------------------------------------
        // elasticsearch
        // -------------------------------------
        // endpoint authorization
        can(AuthOp.Manage, ElasticSearchActions);

        // -------------------------------------
        // datasets
        // -------------------------------------
        // endpoint authorization
        can(AuthOp.DatasetCreate, DatasetClass);
        can(AuthOp.DatasetRead, DatasetClass);
        can(AuthOp.DatasetUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetAttachmentCreate, DatasetClass);
        can(AuthOp.DatasetAttachmentRead, DatasetClass);
        can(AuthOp.DatasetAttachmentUpdate, DatasetClass);
        can(AuthOp.DatasetAttachmentDelete, DatasetClass);
        // -
        can(AuthOp.DatasetOrigdatablockCreate, DatasetClass);
        can(AuthOp.DatasetOrigdatablockRead, DatasetClass);
        can(AuthOp.DatasetOrigdatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetDatablockCreate, DatasetClass);
        can(AuthOp.DatasetDatablockRead, DatasetClass);
        can(AuthOp.DatasetDatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetLogbookRead, DatasetClass);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.DatasetCreateAny, DatasetClass);
        can(AuthOp.DatasetReadAny, DatasetClass);
        can(AuthOp.DatasetUpdateAny, DatasetClass);
        // -
        can(AuthOp.DatasetAttachmentCreateAny, DatasetClass);
        can(AuthOp.DatasetAttachmentReadAny, DatasetClass);
        can(AuthOp.DatasetAttachmentUpdateAny, DatasetClass);
        can(AuthOp.DatasetAttachmentDeleteAny, DatasetClass);
        // -
        can(AuthOp.DatasetOrigdatablockCreateAny, DatasetClass);
        can(AuthOp.DatasetOrigdatablockReadAny, DatasetClass);
        can(AuthOp.DatasetOrigdatablockUpdateAny, DatasetClass);
        // -
        can(AuthOp.DatasetDatablockCreateAny, DatasetClass);
        can(AuthOp.DatasetDatablockReadAny, DatasetClass);
        can(AuthOp.DatasetDatablockUpdateAny, DatasetClass);
        // -------------------------------------
        can(AuthOp.DatasetLogbookReadAny, DatasetClass);

        // -------------------------------------
        // origdatablock
        // -------------------------------------
        // endpoint authorization
        can(AuthOp.OrigdatablockRead, OrigDatablock);
        can(AuthOp.OrigdatablockCreate, OrigDatablock);
        can(AuthOp.OrigdatablockUpdate, OrigDatablock);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.OrigdatablockReadAny, OrigDatablock);
        can(AuthOp.OrigdatablockCreateAny, OrigDatablock);
        can(AuthOp.OrigdatablockUpdateAny, OrigDatablock);

        // -------------------------------------
        // user endpoint, including useridentity
        can(AuthOp.UserReadAny, User);
        can(AuthOp.UserReadOwn, User);
        can(AuthOp.UserCreateAny, User);
        can(AuthOp.UserUpdateAny, User);
        can(AuthOp.UserDeleteAny, User);
        can(AuthOp.UserCreateJwt, User);

        // -------------------------------------
        // policies
        can(AuthOp.Update, Policy);
        can(AuthOp.Read, Policy);
        can(AuthOp.Create, Policy);
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
        can(AuthOp.DatasetCreate, DatasetClass);
        can(AuthOp.DatasetRead, DatasetClass);
        can(AuthOp.DatasetUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetAttachmentCreate, DatasetClass);
        can(AuthOp.DatasetAttachmentRead, DatasetClass);
        can(AuthOp.DatasetAttachmentUpdate, DatasetClass);
        can(AuthOp.DatasetAttachmentDelete, DatasetClass);
        // -
        can(AuthOp.DatasetOrigdatablockCreate, DatasetClass);
        can(AuthOp.DatasetOrigdatablockRead, DatasetClass);
        can(AuthOp.DatasetOrigdatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetDatablockCreate, DatasetClass);
        can(AuthOp.DatasetDatablockRead, DatasetClass);
        can(AuthOp.DatasetDatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetLogbookRead, DatasetClass);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.DatasetCreateAny, DatasetClass);
        can(AuthOp.DatasetReadManyAccess, DatasetClass);
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetAttachmentCreateAny, DatasetClass);
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetAttachmentUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentDeleteOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetOrigdatablockCreateAny, DatasetClass);
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetOrigdatablockUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetDatablockCreateAny, DatasetClass);
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetDatablockUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetLogbookReadOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });

        // -------------------------------------
        // origdatablock
        // -------------------------------------
        // endpoint authorization
        can(AuthOp.OrigdatablockRead, OrigDatablock);
        can(AuthOp.OrigdatablockCreate, OrigDatablock);
        can(AuthOp.OrigdatablockUpdate, OrigDatablock);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.OrigdatablockCreateAny, OrigDatablock);
        can(AuthOp.OrigdatablockReadManyAccess, OrigDatablock);
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockUpdateOwner, OrigDatablock, {
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
        can(AuthOp.DatasetCreate, DatasetClass);
        can(AuthOp.DatasetRead, DatasetClass);
        can(AuthOp.DatasetUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetAttachmentCreate, DatasetClass);
        can(AuthOp.DatasetAttachmentRead, DatasetClass);
        can(AuthOp.DatasetAttachmentUpdate, DatasetClass);
        can(AuthOp.DatasetAttachmentDelete, DatasetClass);
        // -
        can(AuthOp.DatasetOrigdatablockCreate, DatasetClass);
        can(AuthOp.DatasetOrigdatablockRead, DatasetClass);
        can(AuthOp.DatasetOrigdatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetDatablockCreate, DatasetClass);
        can(AuthOp.DatasetDatablockRead, DatasetClass);
        can(AuthOp.DatasetDatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetLogbookRead, DatasetClass);
        // -------------------------------------
        // datasets data instance authorization
        can(AuthOp.DatasetCreateOwnerWithPid, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadManyAccess, DatasetClass);
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetAttachmentCreateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetAttachmentUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentDeleteOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetOrigdatablockCreateAny, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetOrigdatablockUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetDatablockCreateAny, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetDatablockUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetLogbookReadOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });

        // -------------------------------------
        // origdatablock
        // -------------------------------------
        // endpoint authorization
        can(AuthOp.OrigdatablockRead, OrigDatablock);
        can(AuthOp.OrigdatablockCreate, OrigDatablock);
        can(AuthOp.OrigdatablockUpdate, OrigDatablock);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.OrigdatablockCreateOwner, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadManyAccess, OrigDatablock);
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          isPublished: true,
        });
        can(AuthOp.OrigdatablockUpdateOwner, OrigDatablock, {
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
        can(AuthOp.DatasetCreate, DatasetClass);
        can(AuthOp.DatasetRead, DatasetClass);
        can(AuthOp.DatasetUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetAttachmentCreate, DatasetClass);
        can(AuthOp.DatasetAttachmentRead, DatasetClass);
        can(AuthOp.DatasetAttachmentUpdate, DatasetClass);
        can(AuthOp.DatasetAttachmentDelete, DatasetClass);
        // -
        can(AuthOp.DatasetOrigdatablockCreate, DatasetClass);
        can(AuthOp.DatasetOrigdatablockRead, DatasetClass);
        can(AuthOp.DatasetOrigdatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetDatablockCreate, DatasetClass);
        can(AuthOp.DatasetDatablockRead, DatasetClass);
        can(AuthOp.DatasetDatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetLogbookRead, DatasetClass);
        // -------------------------------------
        // datasets data instance authorization
        can(AuthOp.DatasetCreateOwnerNoPid, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          pid: { $eq: "" },
        });

        can(AuthOp.DatasetReadManyAccess, DatasetClass);
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetAttachmentCreateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetAttachmentUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentDeleteOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetOrigdatablockCreateAny, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetOrigdatablockUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetDatablockCreateAny, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          isPublished: true,
        });
        can(AuthOp.DatasetDatablockUpdateOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        // -
        can(AuthOp.DatasetLogbookReadOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });

        // -------------------------------------
        // origdatablock
        // -------------------------------------
        // endpoint authorization
        can(AuthOp.OrigdatablockRead, OrigDatablock);
        can(AuthOp.OrigdatablockCreate, OrigDatablock);
        can(AuthOp.OrigdatablockUpdate, OrigDatablock);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.OrigdatablockCreateOwner, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadManyAccess, OrigDatablock);
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          isPublished: true,
        });
        can(AuthOp.OrigdatablockUpdateOwner, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else if (user) {
        /**
        /*  authenticated users
        **/

        // -------------------------------------
        // datasets endpoint authorization
        cannot(AuthOp.DatasetCreate, DatasetClass);
        can(AuthOp.DatasetRead, DatasetClass);
        cannot(AuthOp.DatasetUpdate, DatasetClass);
        // -
        cannot(AuthOp.DatasetAttachmentCreate, DatasetClass);
        can(AuthOp.DatasetAttachmentRead, DatasetClass);
        cannot(AuthOp.DatasetAttachmentUpdate, DatasetClass);
        cannot(AuthOp.DatasetAttachmentDelete, DatasetClass);
        // -
        cannot(AuthOp.DatasetOrigdatablockCreate, DatasetClass);
        can(AuthOp.DatasetOrigdatablockRead, DatasetClass);
        cannot(AuthOp.DatasetOrigdatablockUpdate, DatasetClass);
        // -
        cannot(AuthOp.DatasetDatablockCreate, DatasetClass);
        can(AuthOp.DatasetDatablockRead, DatasetClass);
        cannot(AuthOp.DatasetDatablockUpdate, DatasetClass);
        // -
        can(AuthOp.DatasetLogbookRead, DatasetClass);
        // -------------------------------------
        // datasets data instance authorization
        can(AuthOp.DatasetReadManyAccess, DatasetClass);
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetReadOneAccess, DatasetClass, {
          isPublished: true,
        });
        // -
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetAttachmentReadAccess, DatasetClass, {
          isPublished: true,
        });
        // -
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetOrigdatablockReadAccess, DatasetClass, {
          isPublished: true,
        });
        // -
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.DatasetDatablockReadAccess, DatasetClass, {
          isPublished: true,
        });
        // -
        can(AuthOp.DatasetLogbookReadOwner, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });

        // -------------------------------------
        // origdatablock
        // -------------------------------------
        // endpoint authorization
        can(AuthOp.OrigdatablockRead, OrigDatablock);
        cannot(AuthOp.OrigdatablockCreate, OrigDatablock);
        cannot(AuthOp.OrigdatablockUpdate, OrigDatablock);
        // -------------------------------------
        // data instance authorization
        can(AuthOp.OrigdatablockReadManyAccess, OrigDatablock);
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.OrigdatablockReadOneAccess, OrigDatablock, {
          isPublished: true,
        });
        cannot(AuthOp.UserReadAny, User);
        cannot(AuthOp.UserCreateAny, User);
        cannot(AuthOp.UserUpdateAny, User);
        cannot(AuthOp.UserDeleteAny, User);
        cannot(AuthOp.UserCreateJwt, User);
      }
      can(AuthOp.UserReadOwn, User, { _id: user._id });
      can(AuthOp.UserCreateOwn, User, { _id: user._id });
      can(AuthOp.UserUpdateOwn, User, { _id: user._id });
      can(AuthOp.UserDeleteOwn, User, { _id: user._id });
    }

    // ************************************
    // JOBS AUTHORIZATION
    // ************************************

    if (!user) {
      /**
       * unauthenticated users
       */

      // -------------------------------------
      // loop through the jobs definition and extract the most permissive permission
      // -------------------------------------
      // endpoint authorization
      // job creation
      if (configuration().jobConfiguration.some( (j) => j.create.auth == "#all")) {
        can(AuthOp.JobCreate,JobClass)
      } else {
        cannot(AuthOp.JobCreate,JobClass)
      }
      cannot(AuthOp.JobRead, JobClass);
      if (configuration().jobConfiguration.some( (j) => j.update.auth == "#all")) {
        can(AuthOp.JobStatusUpdate,JobClass)
      } else {
        cannot(AuthOp.JobStatusUpdate, JobClass);
      }
      cannot(AuthOp.JobDelete, JobClass);

      // -------------------------------------
      // instance authorization
      can(AuthOp.JobCreateConfiguration,JobClass, {
        'configuration.create.auth': '#all',
      })
      can(AuthOp.JobCreateConfiguration,JobClass, {
        'configuration.create.auth' : '#datasetPublic',
        'datasetsValidation': true
      })
    } else {
      /**
       * authenticated users
       */

      // check if this user is part of the admin group
      if (
        user.currentGroups.some((g) => configuration().adminGroups.includes(g))
      ) {
        /**
         * authenticated users belonging to any of the group listed in ADMIN_GROUPS
         */

        // -------------------------------------
        // endpoint authorization
        can(AuthOp.JobRead, JobClass);
        can(AuthOp.JobCreate, JobClass);
        can(AuthOp.JobStatusUpdate, JobClass);
      
        // -------------------------------------
        // data instance authorization
        can(AuthOp.JobReadAny, JobClass);
        can(AuthOp.JobCreateAny, JobClass);
        can(AuthOp.JobStatusUpdateAny, JobClass);

      } else {
  
        const jobUserAuthorizationValues = [...user.currentGroups.map((g) => "@" + g), user.username];

        if (
          user.currentGroups.some((g) =>
            configuration().createJobGroups.includes(g),
          )
        ) {
          /**
          * authenticated users belonging to any of the group listed in CREATE_JOBS_GROUPS
          */
        
          // -------------------------------------
          // endpoint authorization
          can(AuthOp.JobRead, JobClass);
          can(AuthOp.JobCreate, JobClass);
        
          // -------------------------------------
          // data instance authorization
          can(AuthOp.JobCreateOwner, JobClass, {
            ownerGroup: { $in: user.currentGroups },
          });
          can(AuthOp.JobReadAccess, JobClass, {
            ownerGroup: { $in: user.currentGroups },
          });
        } else {

          /**
          * authenticated users not belonging to any special group
          */
          const jobCreateEndPointAuthorizationValues = [
            ...Object.values(CreateJobAuth), 
            ...jobUserAuthorizationValues];
          const jobCreateInstanceAuthorizationValues = [
            ...Object.values(CreateJobAuth).filter((v) => ~String(v).includes('#dataset')), 
            ...jobUserAuthorizationValues];
          const jobCreateDatasetAuthorizationValues = [
            ...Object.values(CreateJobAuth).filter((v) => String(v).includes('#dataset'))
          ]
          
          // -------------------------------------
          // endpoint authorization
          can(AuthOp.JobRead, JobClass);
          if (configuration().jobConfiguration.some( 
            (j) => j.create.auth! in jobCreateEndPointAuthorizationValues 
          )) {
            can(AuthOp.JobCreate,JobClass)
          }
              
          // -------------------------------------
          // data instance authorization
          can(AuthOp.JobReadAccess, JobClass, {
            ownerGroup: { $in: user.currentGroups },
            ownerUser: user.username,
          });
          can(AuthOp.JobCreateConfiguration, JobClass, {
            'configuration.create.auth': { $in: jobCreateInstanceAuthorizationValues }  
          });
          can(AuthOp.JobCreateConfiguration, JobClass, {
            'configuration.create.auth': { $in: jobCreateDatasetAuthorizationValues },
            datasetValidation: true  
          });

        }

        if (
          user.currentGroups.some((g) =>
            configuration().updateJobGroups.includes(g),
          )
        ) {
          
          // -------------------------------------
          // endpoint authorization
          can(AuthOp.JobStatusUpdate, JobClass);
        
          // -------------------------------------
          // data instance authorization
          can(AuthOp.JobStatusUpdateOwner, JobClass, {
            $or: [
              {ownerUser: user.username},
              {ownerGroup: { $in: user.currentGroups }},
            ]
          });
        } else {


          const jobUpdateEndPointAuthorizationValues = [
            ...Object.values(UpdateJobAuth), 
            ...jobUserAuthorizationValues];
          const jobUpdateInstanceAuthorizationValues = [
            ...Object.values(UpdateJobAuth).filter((v) => ~String(v).includes('#job')), 
            ...jobUserAuthorizationValues];

          // -------------------------------------
          // endpoint authorization
          if (configuration().jobConfiguration.some( 
            (j) => j.update.auth! in jobUpdateEndPointAuthorizationValues 
          )) {
            can(AuthOp.JobStatusUpdate,JobClass)
          }
              
          // -------------------------------------
          // data instance authorization
          can(AuthOp.JobStatusUpdateConfiguration,JobClass, {
            'configuration.update.auth': { $in: jobUpdateInstanceAuthorizationValues }
          });
          can(AuthOp.JobStatusUpdateConfiguration,JobClass, {
            'configuration.update.auth': '#jobOwnerUser',
            ownerUser: user.username
          });
          can(AuthOp.JobStatusUpdateConfiguration,JobClass, {
            'configuration.update.auth': '#jobOwnerGroup',
            ownerGroup: { $in: user.currentGroups }
          });

        }
      }
    }

    // ************************************
    // PROPOSALS AUTHORIZATION
    // ************************************

    if (!user) {
      /**
       * unauthenticated users
       */

      // -------------------------------------
      // proposals
      // -------------------------------------
      // endpoint authorization
      can(AuthOp.ProposalsRead, ProposalClass);
      cannot(AuthOp.ProposalsCreate, ProposalClass);
      cannot(AuthOp.ProposalsUpdate, ProposalClass);
      cannot(AuthOp.ProposalsDelete, ProposalClass);
      can(AuthOp.ProposalsAttachmentRead, ProposalClass);
      cannot(AuthOp.ProposalsAttachmentCreate, ProposalClass);
      cannot(AuthOp.ProposalsAttachmentUpdate, ProposalClass);
      cannot(AuthOp.ProposalsAttachmentDelete, ProposalClass);

      // -------------------------------------
      // data instance authorization
      can(AuthOp.ProposalsReadManyPublic, ProposalClass);
      can(AuthOp.ProposalsReadOnePublic, ProposalClass, {
        isPublished: true,
      });
      can(AuthOp.ProposalsAttachmentReadPublic, ProposalClass, {
        isPublished: true,
      });
    } else if (
      user.currentGroups.some((g) => configuration().deleteGroups.includes(g))
    ) {
      /*
        / user that belongs to any of the group listed in DELETE_GROUPS
        */

      // -------------------------------------
      // proposals
      // -------------------------------------
      // endpoint authorization
      can(AuthOp.ProposalsDelete, ProposalClass);

      // -------------------------------------
      // data instance authorization

      can(AuthOp.ProposalsDeleteAny, ProposalClass);
    } else if (
      user.currentGroups.some((g) => configuration().adminGroups.includes(g))
    ) {
      /**
       * authenticated users belonging to any of the group listed in ADMIN_GROUPS
       */

      // -------------------------------------
      // proposals
      // -------------------------------------
      // endpoint authorization
      can(AuthOp.ProposalsRead, ProposalClass);
      can(AuthOp.ProposalsCreate, ProposalClass);
      can(AuthOp.ProposalsUpdate, ProposalClass);
      cannot(AuthOp.ProposalsDelete, ProposalClass);
      can(AuthOp.ProposalsAttachmentRead, ProposalClass);
      can(AuthOp.ProposalsAttachmentCreate, ProposalClass);
      can(AuthOp.ProposalsAttachmentUpdate, ProposalClass);
      can(AuthOp.ProposalsAttachmentDelete, ProposalClass);
      // -------------------------------------
      // data instance authorization
      can(AuthOp.ProposalsReadAny, ProposalClass);
      can(AuthOp.ProposalsCreateAny, ProposalClass);
      can(AuthOp.ProposalsUpdateAny, ProposalClass);
      cannot(AuthOp.ProposalsDeleteAny, ProposalClass);
      can(AuthOp.ProposalsAttachmentReadAny, ProposalClass);
      can(AuthOp.ProposalsAttachmentCreateAny, ProposalClass);
      can(AuthOp.ProposalsAttachmentUpdateAny, ProposalClass);
      can(AuthOp.ProposalsAttachmentDeleteAny, ProposalClass);
    } else if (
      user.currentGroups.some((g) => {
        return configuration().proposalGroups.includes(g);
      })
    ) {
      /**
       * authenticated users belonging to any of the group listed in PROPOSAL_GROUPS
       */

      // -------------------------------------
      // proposals
      // -------------------------------------
      // endpoint authorization

      can(AuthOp.ProposalsRead, ProposalClass);
      can(AuthOp.ProposalsCreate, ProposalClass);
      can(AuthOp.ProposalsUpdate, ProposalClass);
      cannot(AuthOp.ProposalsDelete, ProposalClass);
      can(AuthOp.ProposalsAttachmentRead, ProposalClass);
      can(AuthOp.ProposalsAttachmentCreate, ProposalClass);
      can(AuthOp.ProposalsAttachmentUpdate, ProposalClass);
      can(AuthOp.ProposalsAttachmentDelete, ProposalClass);
      cannot(AuthOp.ProposalsDatasetRead, ProposalClass);
      // -------------------------------------
      // data instance authorization
      can(AuthOp.ProposalsCreateAny, ProposalClass);
      can(AuthOp.ProposalsReadManyAccess, ProposalClass);
      can(AuthOp.ProposalsReadOneAccess, ProposalClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsReadOneAccess, ProposalClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsReadOneAccess, ProposalClass, {
        isPublished: true,
      });
      //-
      can(AuthOp.ProposalsAttachmentCreateAny, ProposalClass);
      can(AuthOp.ProposalsAttachmentReadAccess, ProposalClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsAttachmentReadAccess, ProposalClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsAttachmentReadAccess, ProposalClass, {
        isPublished: true,
      });
      can(AuthOp.ProposalsAttachmentUpdateOwner, ProposalClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsAttachmentDeleteOwner, ProposalClass, {
        ownerGroup: { $in: user.currentGroups },
      });
    } else if (user) {
      /**
       * authenticated users
       */

      // -------------------------------------
      // proposals
      // -------------------------------------
      // endpoint authorization
      can(AuthOp.ProposalsRead, ProposalClass);
      cannot(AuthOp.ProposalsCreate, ProposalClass);
      cannot(AuthOp.ProposalsUpdate, ProposalClass);
      cannot(AuthOp.ProposalsDelete, ProposalClass);
      can(AuthOp.ProposalsAttachmentRead, ProposalClass);
      cannot(AuthOp.ProposalsAttachmentCreate, ProposalClass);
      cannot(AuthOp.ProposalsAttachmentUpdate, ProposalClass);
      cannot(AuthOp.ProposalsAttachmentDelete, ProposalClass);
      can(AuthOp.ProposalsDatasetRead, ProposalClass);
      // -------------------------------------
      // data instance authorization
      can(AuthOp.ProposalsReadManyAccess, ProposalClass);
      can(AuthOp.ProposalsReadOneAccess, ProposalClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsReadOneAccess, ProposalClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsReadOneAccess, ProposalClass, {
        isPublished: true,
      });
      // -
      can(AuthOp.ProposalsAttachmentReadAccess, ProposalClass, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsAttachmentReadAccess, ProposalClass, {
        accessGroups: { $in: user.currentGroups },
      });
      can(AuthOp.ProposalsAttachmentReadAccess, ProposalClass, {
        isPublished: true,
      });
    }

    // ************************************
    // SAMPLES AUTHORIZATION
    // ************************************
    if (!user) {
      // -------------------------------------
      // unauthenticated users
      // -------------------------------------

      // -------------------------------------
      // endpoint authorization
      can(AuthOp.SampleRead, SampleClass);
      cannot(AuthOp.SampleCreate, SampleClass);
      cannot(AuthOp.SampleUpdate, SampleClass);
      cannot(AuthOp.SampleDelete, SampleClass);
      can(AuthOp.SampleAttachmentRead, SampleClass);
      cannot(AuthOp.SampleAttachmentCreate, SampleClass);
      cannot(AuthOp.SampleAttachmentUpdate, SampleClass);
      cannot(AuthOp.SampleAttachmentDelete, SampleClass);
      cannot(AuthOp.SampleDatasetRead, SampleClass);

      // -------------------------------------
      // data instance authorization
      can(AuthOp.SampleReadManyPublic, SampleClass);
      can(AuthOp.SampleReadOnePublic, SampleClass, {
        isPublished: true,
      });
      can(AuthOp.SampleAttachmentReadPublic, SampleClass, {
        isPublished: true,
      });
    } else {
      // -------------------------------------
      // authenticated users
      // -------------------------------------

      if (
        user.currentGroups.some((g) => configuration().deleteGroups.includes(g))
      ) {
        // -------------------------------------
        // users that belong to any of the group listed in DELETE_GROUPS
        // -------------------------------------

        // -------------------------------------
        // endpoint authorization
        can(AuthOp.SampleDelete, SampleClass);
        can(AuthOp.SampleAttachmentDelete, SampleClass);

        // -------------------------------------
        // data instance authorization
        can(AuthOp.SampleDeleteAny, SampleClass);
        can(AuthOp.SampleAttachmentDeleteAny, SampleClass);
      } else {
        // -------------------------------------
        // users that do not belong to any of the group listed in DELETE_GROUPS
        // -------------------------------------

        // -------------------------------------
        // endpoint authorization
        cannot(AuthOp.SampleDelete, SampleClass);

        // -------------------------------------
        // data instance authorization
        cannot(AuthOp.SampleDeleteAny, SampleClass);
        cannot(AuthOp.SampleDeleteOwner, SampleClass);
      }

      if (
        user.currentGroups.some((g) => configuration().adminGroups.includes(g))
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in ADMIN_GROUPS
        // -------------------------------------

        // -------------------------------------
        // endpoint authorization
        can(AuthOp.SampleRead, SampleClass);
        can(AuthOp.SampleCreate, SampleClass);
        can(AuthOp.SampleUpdate, SampleClass);
        can(AuthOp.SampleAttachmentRead, SampleClass);
        can(AuthOp.SampleAttachmentCreate, SampleClass);
        can(AuthOp.SampleAttachmentUpdate, SampleClass);
        can(AuthOp.SampleAttachmentDelete, SampleClass);
        can(AuthOp.SampleDatasetRead, SampleClass);

        // -------------------------------------
        // data instance authorization
        can(AuthOp.SampleReadAny, SampleClass);
        can(AuthOp.SampleCreateAny, SampleClass);
        can(AuthOp.SampleUpdateAny, SampleClass);
        can(AuthOp.SampleAttachmentReadAny, SampleClass);
        can(AuthOp.SampleAttachmentCreateAny, SampleClass);
        can(AuthOp.SampleAttachmentUpdateAny, SampleClass);
        can(AuthOp.SampleAttachmentDeleteAny, SampleClass);
      } else if (
        user.currentGroups.some((g) =>
          configuration().samplePrivilegedGroups.includes(g),
        )
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in SAMPLE_GROUPS
        //

        // -------------------------------------
        // endpoint authorization
        can(AuthOp.SampleRead, SampleClass);
        can(AuthOp.SampleCreate, SampleClass);
        can(AuthOp.SampleUpdate, SampleClass);
        can(AuthOp.SampleAttachmentRead, SampleClass);
        can(AuthOp.SampleAttachmentCreate, SampleClass);
        can(AuthOp.SampleAttachmentUpdate, SampleClass);
        can(AuthOp.SampleAttachmentDelete, SampleClass);
        can(AuthOp.SampleDatasetRead, SampleClass);

        // -------------------------------------
        // data instance authorization
        can(AuthOp.SampleCreateAny, SampleClass);
        can(AuthOp.SampleUpdateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleReadManyAccess, SampleClass);
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          isPublished: true,
        });
        can(AuthOp.SampleAttachmentCreateAny, SampleClass);
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          isPublished: true,
        });
        can(AuthOp.SampleAttachmentUpdateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentDeleteOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else if (
        user.currentGroups.some((g) =>
          configuration().sampleGroups.includes(g),
        ) ||
        configuration().sampleGroups.includes("#all")
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in SAMPLE_GROUPS
        //

        // -------------------------------------
        // endpoint authorization
        can(AuthOp.SampleRead, SampleClass);
        can(AuthOp.SampleCreate, SampleClass);
        can(AuthOp.SampleUpdate, SampleClass);
        can(AuthOp.SampleAttachmentRead, SampleClass);
        can(AuthOp.SampleAttachmentCreate, SampleClass);
        can(AuthOp.SampleAttachmentUpdate, SampleClass);
        can(AuthOp.SampleAttachmentDelete, SampleClass);
        can(AuthOp.SampleDatasetRead, SampleClass);

        // -------------------------------------
        // data instance authorization
        can(AuthOp.SampleCreateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleUpdateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleReadManyAccess, SampleClass);
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          isPublished: true,
        });
        can(AuthOp.SampleAttachmentCreateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          isPublished: true,
        });
        can(AuthOp.SampleAttachmentUpdateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentDeleteOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else {
        // -------------------------------------
        // users with no elevated permissions
        // -------------------------------------

        // -------------------------------------
        // endpoint authorization
        can(AuthOp.SampleRead, SampleClass);
        cannot(AuthOp.SampleCreate, SampleClass);
        cannot(AuthOp.SampleUpdate, SampleClass);
        can(AuthOp.SampleAttachmentRead, SampleClass);
        cannot(AuthOp.SampleAttachmentCreate, SampleClass);
        cannot(AuthOp.SampleAttachmentUpdate, SampleClass);
        if (
          !user.currentGroups.some((g) =>
            configuration().deleteGroups.includes(g),
          )
        ) {
          cannot(AuthOp.SampleAttachmentDelete, SampleClass);
        }

        // -------------------------------------
        // data instance authorization
        can(AuthOp.SampleReadManyAccess, SampleClass);
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.SampleReadOneAccess, SampleClass, {
          isPublished: true,
        });
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(AuthOp.SampleAttachmentReadAccess, SampleClass, {
          isPublished: true,
        });
      }
    }

    // ************************************
    // INSTRUMENT AUTHORIZATION
    // ************************************

    if (!user) {
      cannot(AuthOp.InstrumentRead, Instrument);
      cannot(AuthOp.InstrumentCreate, Instrument);
      cannot(AuthOp.InstrumentUpdate, Instrument);
      cannot(AuthOp.InstrumentDelete, Instrument);
    } else if (
      user.currentGroups.some((g) => configuration().deleteGroups.includes(g))
    ) {
      /*
        / user that belongs to any of the group listed in DELETE_GROUPS
        */

      // -------------------------------------
      // instrument
      // -------------------------------------
      // endpoint authorization
      can(AuthOp.InstrumentDelete, Instrument);
    } else if (
      user.currentGroups.some((g) => configuration().adminGroups.includes(g))
    ) {
      /**
       * authenticated users belonging to any of the group listed in ADMIN_GROUPS
       */
      // -------------------------------------
      // instrument
      // -------------------------------------
      // endpoint authorization
      can(AuthOp.InstrumentRead, Instrument);
      can(AuthOp.InstrumentCreate, Instrument);
      can(AuthOp.InstrumentUpdate, Instrument);
      cannot(AuthOp.InstrumentDelete, Instrument);
    } else if (user) {
      can(AuthOp.InstrumentRead, Instrument);
      cannot(AuthOp.InstrumentCreate, Instrument);
      cannot(AuthOp.InstrumentUpdate, Instrument);
      cannot(AuthOp.InstrumentDelete, Instrument);
    }

    // Instrument permissions
    //can(AuthOp.Read, Instrument);
    //if (user.currentGroups.some((g) => adminGroups.includes(g))) {
    //  can(AuthOp.Manage, Instrument);
    //}

    //can(AuthOp.Manage, JobClass);

    can(AuthOp.Read, Logbook);

    can(AuthOp.Read, PublishedData);
    can(AuthOp.Update, PublishedData);
    can(AuthOp.Create, PublishedData);

    // can(AuthOp.Manage, Attachment, {
    //   ownerGroup: { $in: user.currentGroups },
    // });
    // can(AuthOp.Manage, Datablock, {
    //   ownerGroup: { $in: user.currentGroups },
    // });
    // can(AuthOp.Manage, OrigDatablock, {
    //   ownerGroup: { $in: user.currentGroups },
    // });

    // if (user.currentGroups.includes(Role.Admin)) {
    //   can(AuthOp.Manage, "all");
    // }
    // if (user.currentGroups.includes(Role.ArchiveManager)) {
    //   //cannot(AuthOp.Create, DatasetClass);
    //   //cannot(AuthOp.Update, DatasetClass);
    //   //can(AuthOp.Delete, DatasetClass);
    //   cannot(AuthOp.Manage, OrigDatablock);
    //   cannot(AuthOp.Create, OrigDatablock);
    //   cannot(AuthOp.Update, OrigDatablock);
    //   can(AuthOp.Delete, OrigDatablock);
    //   cannot(AuthOp.Manage, Datablock);
    //   cannot(AuthOp.Create, Datablock);
    //   cannot(AuthOp.Update, Datablock);
    //   can(AuthOp.Delete, Datablock);
    //   can(AuthOp.Delete, PublishedData);
    //   //--------------------------------
    //   // instrument
    //   cannot(AuthOp.InstrumentRead, Instrument);
    //   cannot(AuthOp.InstrumentCreate, Instrument);
    //   cannot(AuthOp.InstrumentUpdate, Instrument);
    //   can(AuthOp.InstrumentDelete, Instrument);
    // }
    //if (user.currentGroups.includes(Role.GlobalAccess)) {
    //  can(AuthOp.Read, "all");
    //}
    // if (user.currentGroups.includes(Role.Ingestor)) {
    //   can(AuthOp.Create, Attachment);

    //   //cannot(AuthOp.Delete, DatasetClass);
    //   //can(AuthOp.Create, DatasetClass);
    //   //can(AuthOp.Update, DatasetClass);

    //   can(AuthOp.Create, Instrument);
    //   can(AuthOp.Update, Instrument);
    // }
    // if (user.currentGroups.includes(Role.ProposalIngestor)) {
    //   cannot(AuthOp.Delete, ProposalClass);
    //   can(AuthOp.Create, ProposalClass);
    //   can(AuthOp.Update, ProposalClass);
    //   can(AuthOp.Read, ProposalClass);
    //   can(AuthOp.ListAll, ProposalClass);
    // }

    //can(AuthOp.Create, UserSettings, { userId: user._id });
    //can(AuthOp.Read, UserSettings, { userId: user._id });
    //can(AuthOp.Update, UserSettings, { userId: user._id });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
