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
import { Job } from "src/jobs/schemas/job.schema";
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
      | typeof Job
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

    // check if the user is an admin or not
    if (
      user.currentGroups.some((g) => configuration().adminGroups.includes(g))
    ) {
      //
      // user that belongs to any of the group listed in ADMIN_GROUPS

      //can(Action.ListAll, DatasetClass);
      can(Action.ListAll, ProposalClass);
      can(Action.ReadAll, UserIdentity);
      
      // -------------------------------------
      // datasets endpoint authorization
      can(Action.DatasetCreate, DatasetClass);
      can(Action.DatasetRead, DatasetClass);
      can(Action.DatasetUpdate, DatasetClass);
      cannot(Action.DatasetDelete, DatasetClass);
      can(Action.DatasetAttachmentCreate, DatasetClass);
      can(Action.DatasetAttachmentRead, DatasetClass);
      can(Action.DatasetAttachmentUpdate, DatasetClass);
      can(Action.DatasetAttachmentDelete, DatasetClass);
      can(Action.DatasetOrigdatablockCreate, DatasetClass);
      can(Action.DatasetOrigdatablockRead, DatasetClass);
      can(Action.DatasetOrigdatablockUpdate, DatasetClass);
      cannot(Action.DatasetOrigdatablockDelete, DatasetClass);
      can(Action.DatasetDatablockCreate, DatasetClass);
      can(Action.DatasetDatablockRead, DatasetClass);
      can(Action.DatasetDatablockUpdate, DatasetClass);
      cannot(Action.DatasetDatablockDelete, DatasetClass);
      can(Action.DatasetLogbookRead, DatasetClass);
      // dataset individual actions authorization
      can(Action.DatasetCreateAny, DatasetClass);
      can(Action.DatasetReadAny, DatasetClass);
      can(Action.DatasetUpdateAny, DatasetClass);
      can(Action.DatasetAttachmentCreateAny, DatasetClass);
      can(Action.DatasetAttachmentReadAny, DatasetClass);
      can(Action.DatasetAttachmentUpdateAny, DatasetClass);
      can(Action.DatasetAttachmentDeleteAny, DatasetClass);
      can(Action.DatasetOrigdatablockCreateAny, DatasetClass);
      can(Action.DatasetOrigdatablockReadAny, DatasetClass);
      can(Action.DatasetOrigdatablockUpdateAny, DatasetClass);
      can(Action.DatasetDatablockCreateAny, DatasetClass);
      can(Action.DatasetDatablockReadAny, DatasetClass);
      can(Action.DatasetDatablockUpdateAny, DatasetClass);
      can(Action.DatasetLogbookReadAny, DatasetClass);

      // -----
      // origdatablock endpoint actions
      can(Action.OrigdatablockRead, OrigDatablock,);
      can(Action.OrigdatablockCreate, OrigDatablock);
      can(Action.OrigdatablockUpdate, OrigDatablock);
      cannot(Action.OrigdatablockDelete, OrigDatablock);
      // origdatablock individual actions authorization
      can(Action.OrigdatablockReadAny, OrigDatablock,);
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
    } else if (user) {
      // authenticated users

      if ( user.currentGroups.some((g) =>
        configuration().createDatasetPrivilegedGroups.includes(g))
      ) {
        // users belonging to CREATE_DATASET_

      
        can(Action.DatasetCreateAny, DatasetClass);
        can(Action.DatasetAttachmentCreateAny, DatasetClass);
        can(Action.DatasetOrigdatablockCreateAny, DatasetClass);
        can(Action.DatasetDatablockCreateAny, DatasetClass);
        can(Action.OrigdatablockCreateAny, OrigDatablock);
        can(Action.DatasetReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetOrigdatablockReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetDatablockReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetLogbookReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.OrigdatablockReadOwn, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentDeleteOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetOrigdatablockUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetDatablockUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        }); 
      } else if (
        user.currentGroups.some((g) =>
          configuration().createDatasetWithPidGroups.includes(g),
        ) ||
        configuration().createDatasetWithPidGroups.includes("#all") ||
        user.currentGroups.some((g) =>
          configuration().createDatasetGroups.includes(g),
        ) ||
        configuration().createDatasetGroups.includes("#all")
      ) {
        // users that can create datasets with and without pids
        // the check on the pid is done in dataset controller
        cannot(Action.DatasetCreateAny, DatasetClass);
        cannot(Action.DatasetAttachmentCreateAny, DatasetClass);
        cannot(Action.DatasetOrigdatablockCreateAny, DatasetClass);
        cannot(Action.DatasetDatablockCreateAny, DatasetClass);
        cannot(Action.OrigdatablockCreateAny, OrigDatablock);
        can(Action.DatasetCreateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentCreateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetOrigdatablockCreateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetDatablockCreateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetOrigdatablockReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetDatablockReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetLogbookReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.OrigdatablockReadOwn, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentDeleteOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetOrigdatablockUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetDatablockUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else {
        //
        // authenticated users that cannot create a dataset

        //
        // Dataset endpoint actions
        cannot(Action.DatasetCreateAny, DatasetClass);
        cannot(Action.DatasetAttachmentCreateAny, DatasetClass);
        cannot(Action.DatasetOrigdatablockCreateAny, DatasetClass);
        cannot(Action.DatasetDatablockCreateAny, DatasetClass);
        cannot(Action.OrigdatablockCreateAny, OrigDatablock);

        cannot(Action.DatasetCreateOwn, DatasetClass);
        cannot(Action.DatasetAttachmentCreateOwn, DatasetClass);
        cannot(Action.DatasetOrigdatablockCreateOwn, DatasetClass);
        cannot(Action.DatasetDatablockCreateOwn, DatasetClass);

        can(Action.DatasetReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetOrigdatablockReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetDatablockReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.DatasetLogbookReadOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.OrigdatablockReadOwn, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
          accessGroups: { $in: user.currentGroups },
        });

        can(Action.DatasetUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetAttachmentDeleteOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetOrigdatablockUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.DatasetDatablockUpdateOwn, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.OrigdatablockReadPublic, OrigDatablock, {
          ownerGroup: { $in: user.currentGroups },
        });
      }

      // datasets actions to be verified
      // can(Action.Read, DatasetClass, { isPublished: true });
      // can(Action.Read, DatasetClass, {
      //   isPublished: false,
      //   ownerGroup: { $in: user.currentGroups },
      // });
      // can(Action.Read, DatasetClass, {
      //   isPublished: false,
      //   accessGroups: { $in: user.currentGroups },
      // });
      // can(Action.Read, DatasetClass, {
      //   sharedWith: user.email,
      // });
      // can(
      //   Action.Update,
      //   DatasetClass,
      //   ["isPublished", "keywords", "scientificMetadata"],
      //   {
      //     ownerGroup: { $in: user.currentGroups },
      //   },
      // );

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

    // Instrument permissions
    //can(Action.Read, Instrument);
    //if (user.currentGroups.some((g) => adminGroups.includes(g))) {
    //  can(Action.Manage, Instrument);
    //}

    can(Action.Manage, Job);

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

    if (user.currentGroups.some((g) => configuration().deleteGroups.includes(g))) {
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
