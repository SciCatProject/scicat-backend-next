import {
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
  createMongoAbility,
} from "@casl/ability";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { JWTUser } from "src/auth/interfaces/jwt-user.interface";
import { AccessGroupsType } from "src/config/configuration";
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
import { Action } from "./action.enum";
import { JobConfigService } from "src/config/job-config/jobconfig.service";
import { CreateJobAuth, UpdateJobAuth } from "src/jobs/types/jobs-auth.enum";
import { JobConfig } from "src/config/job-config/jobconfig.interface";

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
      | typeof Datablock
    >
  | "all";
type PossibleAbilities = [Action, Subjects];
type Conditions = MongoQuery;

export type AppAbility = MongoAbility<PossibleAbilities, Conditions>;

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private configService: ConfigService,
    private jobConfigService: JobConfigService,
  ) {
    this.accessGroups =
      this.configService.get<AccessGroupsType>("accessGroups");
  }
  private accessGroups;

  private endpointAccessors: {
    [endpoint: string]: (user: JWTUser) => AppAbility;
  } = {
    datasets: this.datasetEndpointAccess,
    "elastic-search": this.elasticSearchEndpointAccess,
    jobs: this.jobsEndpointAccess,
    instruments: this.instrumentEndpointAccess,
    logbooks: this.logbookEndpointAccess,
    origdatablocks: this.origDatablockEndpointAccess,
    policies: this.policyEndpointAccess,
    proposals: this.proposalsEndpointAccess,
    publisheddata: this.publishedDataEndpointAccess,
    samples: this.samplesEndpointAccess,
    users: this.userEndpointAccess,
    attachments: this.attachmentEndpointAccess,
    datablocks: this.datablockEndpointAccess,
  };

  endpointAccess(endpoint: string, user: JWTUser) {
    const accessFunction = this.endpointAccessors[endpoint];
    if (!accessFunction) {
      throw new InternalServerErrorException(
        `No endpoint access policies defined for subject: ${endpoint}`,
      );
    }
    return accessFunction.call(this, user);
  }

  datasetEndpointAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (!user) {
      /**
      /*  unauthenticated users
      **/

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

      cannot(Action.DatasetCreate, DatasetClass);
      cannot(Action.DatasetRead, DatasetClass);
      cannot(Action.DatasetUpdate, DatasetClass);
      cannot(Action.DatasetLifecycleUpdate, DatasetClass);
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
    } else {
      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        /*
        / user that belongs to any of the group listed in DELETE_GROUPS
        */

        can(Action.DatasetDelete, DatasetClass);
        // -
        can(Action.DatasetOrigdatablockDelete, DatasetClass);
        // -
        can(Action.DatasetDatablockDelete, DatasetClass);
      } else {
        /*
        /  user that does not belong to any of the group listed in DELETE_GROUPS
        */

        cannot(Action.DatasetDelete, DatasetClass);
        // -
        cannot(Action.DatasetOrigdatablockDelete, DatasetClass);
        // -
        cannot(Action.DatasetDatablockDelete, DatasetClass);
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /*
        / user that belongs to any of the group listed in ADMIN_GROUPS
        */

        can(Action.DatasetCreate, DatasetClass);
        can(Action.DatasetRead, DatasetClass);
        can(Action.DatasetUpdate, DatasetClass);
        can(Action.DatasetLifecycleUpdate, DatasetClass);
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
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetPrivileged.includes(g),
        )
      ) {
        /**
        /*  users belonging to CREATE_DATASET_PRIVILEGED_GROUPS
        **/

        can(Action.DatasetCreate, DatasetClass);
        can(Action.DatasetRead, DatasetClass);
        can(Action.DatasetUpdate, DatasetClass);
        can(Action.DatasetLifecycleUpdate, DatasetClass);
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
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetWithPid.includes(g),
        ) ||
        this.accessGroups?.createDatasetWithPid.includes("#all")
      ) {
        /**
        /*  users belonging to CREATE_DATASET_WITH_PID_GROUPS
        **/

        can(Action.DatasetCreate, DatasetClass);
        can(Action.DatasetRead, DatasetClass);
        can(Action.DatasetUpdate, DatasetClass);
        can(Action.DatasetLifecycleUpdate, DatasetClass);
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
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDataset.includes(g),
        ) ||
        this.accessGroups?.createDataset.includes("#all")
      ) {
        /**
        /*  users belonging to CREATE_DATASET_GROUPS
        **/

        can(Action.DatasetCreate, DatasetClass);
        can(Action.DatasetRead, DatasetClass);
        can(Action.DatasetUpdate, DatasetClass);
        can(Action.DatasetLifecycleUpdate, DatasetClass);
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
      } else if (user) {
        /**
        /*  authenticated users
        **/
        if (
          user.currentGroups.some((g) =>
            this.accessGroups?.updateDatasetLifecycle.includes(g),
          )
        ) {
          /**
          /*  users belonging to UPDATE_DATASET_LIFECYCLE_GROUPS
          **/

          can(Action.DatasetLifecycleUpdate, DatasetClass);
        } else {
          cannot(Action.DatasetLifecycleUpdate, DatasetClass);
        }
        cannot(Action.DatasetCreate, DatasetClass);
        can(Action.DatasetRead, DatasetClass);
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
      }
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  elasticSearchEndpointAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (
      user &&
      user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
    ) {
      /*
        / user that belongs to any of the group listed in ADMIN_GROUPS
        */
      can(Action.Manage, ElasticSearchActions);
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  instrumentEndpointAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (!user) {
      can(Action.InstrumentRead, Instrument);
      cannot(Action.InstrumentCreate, Instrument);
      cannot(Action.InstrumentUpdate, Instrument);
      cannot(Action.InstrumentDelete, Instrument);
    } else {
      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        /*
         * user that belongs to any of the group listed in DELETE_GROUPS
         */

        can(Action.InstrumentDelete, Instrument);
      } else {
        cannot(Action.InstrumentDelete, Instrument);
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /**
         * authenticated users belonging to any of the group listed in ADMIN_GROUPS
         */

        can(Action.InstrumentRead, Instrument);
        can(Action.InstrumentCreate, Instrument);
        can(Action.InstrumentUpdate, Instrument);
      } else {
        can(Action.InstrumentRead, Instrument);
        cannot(Action.InstrumentCreate, Instrument);
        cannot(Action.InstrumentUpdate, Instrument);
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  attachmentEndpointAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    /*
     * default allow anyone to read attachments
     */
    can(Action.AttachmentReadEndpoint, Attachment);

    if (user) {
      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        /*
         * user that belongs to any of the group listed in DELETE_GROUPS
         */

        can(Action.AttachmentDeleteEndpoint, Attachment);
      }
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /**
         * authenticated users belonging to any of the group listed in ADMIN_GROUPS
         */

        can(Action.AttachmentCreateEndpoint, Attachment);
        can(Action.AttachmentUpdateEndpoint, Attachment);
        can(Action.AttachmentDeleteEndpoint, Attachment);
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  jobsEndpointAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (!user) {
      /**
       * unauthenticated users
       */

      // job creation
      if (
        Object.values(this.jobConfigService.allJobConfigs).some(
          (j) => j.create.auth == CreateJobAuth.All,
        )
      ) {
        can(Action.JobCreate, JobClass);
      } else {
        cannot(Action.JobCreate, JobClass);
      }
      cannot(Action.JobRead, JobClass);
      if (
        Object.values(this.jobConfigService.allJobConfigs).some(
          (j) => j.update.auth == UpdateJobAuth.All,
        )
      ) {
        can(Action.JobUpdate, JobClass);
      } else {
        cannot(Action.JobUpdate, JobClass);
      }
      cannot(Action.JobDelete, JobClass);
    } else {
      /**
       * authenticated users
       */
      // check if this user is part of the admin group
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /**
         * authenticated users belonging to any of the group listed in ADMIN_GROUPS
         */
        can(Action.JobRead, JobClass);
        can(Action.JobCreate, JobClass);
        can(Action.JobUpdate, JobClass);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createJobPrivileged.includes(g),
        )
      ) {
        /**
         * authenticated users belonging to any of the group listed in CREATE_JOB_PRIVILEGED_GROUPS
         */
        can(Action.JobRead, JobClass);
        can(Action.JobCreate, JobClass);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.updateJobPrivileged.includes(g),
        )
      ) {
        can(Action.JobRead, JobClass);
        can(Action.JobUpdate, JobClass);
      } else {
        const jobUserAuthorizationValues = [
          ...user.currentGroups.map((g) => "@" + g),
          user.username,
        ];

        /**
         * authenticated users not belonging to any special group
         */
        const jobCreateEndPointAuthorizationValues = [
          ...Object.values(CreateJobAuth),
          ...jobUserAuthorizationValues,
        ];
        can(Action.JobRead, JobClass);

        if (
          Object.values(this.jobConfigService.allJobConfigs).some(
            (j) =>
              j.create.auth &&
              jobCreateEndPointAuthorizationValues.includes(
                j.create.auth as string,
              ),
          )
        ) {
          can(Action.JobCreate, JobClass);
        }

        const jobUpdateEndPointAuthorizationValues = [
          ...Object.values(UpdateJobAuth),
          ...jobUserAuthorizationValues,
        ];

        if (
          Object.values(this.jobConfigService.allJobConfigs).some(
            (j) =>
              j.update.auth &&
              jobUpdateEndPointAuthorizationValues.includes(
                j.update.auth as string,
              ),
          )
        ) {
          can(Action.JobUpdate, JobClass);
        }
      }
      if (
        user.currentGroups.some((g) => this.accessGroups?.deleteJob.includes(g))
      ) {
        /**
         * authenticated users belonging to any of the group listed in DELETE_JOB_GROUPS
         */
        can(Action.JobDelete, JobClass);
      } else {
        cannot(Action.JobDelete, JobClass);
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  logbookEndpointAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (user) {
      /*
        / authenticated user
        */
      can(Action.Read, Logbook);
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  origDatablockEndpointAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    if (!user) {
      /**
      /*  unauthenticated users
      **/

      can(Action.OrigdatablockReadManyPublic, OrigDatablock);
      can(Action.OrigdatablockReadOnePublic, OrigDatablock, {
        isPublished: true,
      });
      cannot(Action.OrigdatablockCreate, OrigDatablock);
      cannot(Action.OrigdatablockRead, OrigDatablock);
      cannot(Action.OrigdatablockUpdate, OrigDatablock);
    } else {
      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        /**
        /*  user that belongs to any of the groups listed in DELETE_GROUPS
        **/

        can(Action.OrigdatablockDelete, OrigDatablock);
      } else {
        /**
        /*  user that does not belong to any of the groups listed in DELETE_GROUPS
        **/

        cannot(Action.OrigdatablockDelete, OrigDatablock);
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /**
        /*  user that belongs to any of the group listed in ADMIN_GROUPS
        **/

        can(Action.OrigdatablockCreate, OrigDatablock);
        can(Action.OrigdatablockRead, OrigDatablock);
        can(Action.OrigdatablockUpdate, OrigDatablock);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetPrivileged.includes(g),
        )
      ) {
        /**
        /*  users belonging to CREATE_DATASET_PRIVILEGED_GROUPS
        **/

        can(Action.OrigdatablockCreate, OrigDatablock);
        can(Action.OrigdatablockRead, OrigDatablock);
        can(Action.OrigdatablockUpdate, OrigDatablock);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetWithPid.includes(g),
        ) ||
        this.accessGroups?.createDatasetWithPid.includes("#all")
      ) {
        /**
        /*  users belonging to CREATE_DATASET_WITH_PID_GROUPS
        **/

        can(Action.OrigdatablockCreate, OrigDatablock);
        can(Action.OrigdatablockRead, OrigDatablock);
        can(Action.OrigdatablockUpdate, OrigDatablock);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDataset.includes(g),
        ) ||
        this.accessGroups?.createDataset.includes("#all")
      ) {
        /**
        /*  users belonging to CREATE_DATASET_GROUPS
        **/

        can(Action.OrigdatablockCreate, OrigDatablock);
        can(Action.OrigdatablockRead, OrigDatablock);
        can(Action.OrigdatablockUpdate, OrigDatablock);
      } else if (user) {
        /**
        /*  authenticated users
        **/

        cannot(Action.OrigdatablockCreate, OrigDatablock);
        can(Action.OrigdatablockRead, OrigDatablock);
        cannot(Action.OrigdatablockUpdate, OrigDatablock);
      }
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  datablockEndpointAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    if (user) {
      can(Action.DatablockCreateEndpoint, Datablock);
      can(Action.DatablockReadEndpoint, Datablock);
      can(Action.DatablockUpdateEndpoint, Datablock);

      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        can(Action.DatablockDeleteEndpoint, Datablock);
      } else {
        cannot(Action.DatablockDeleteEndpoint, Datablock);
      }
    } else {
      cannot(Action.DatablockCreateEndpoint, Datablock);
      cannot(Action.DatablockReadEndpoint, Datablock);
      cannot(Action.DatablockUpdateEndpoint, Datablock);
      cannot(Action.DatablockDeleteEndpoint, Datablock);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  policyEndpointAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    if (
      user &&
      user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
    ) {
      /*
        / user that belongs to any of the group listed in DELETE_GROUPS
        */
      can(Action.Delete, Policy);
    } else if (
      user &&
      user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
    ) {
      /*
        / user that belongs to any of the group listed in ADMIN_GROUPS
        */

      can(Action.Update, Policy);
      can(Action.Read, Policy);
      can(Action.Create, Policy);
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  proposalsEndpointAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    if (!user) {
      /**
       * unauthenticated users
       */

      can(Action.ProposalsRead, ProposalClass);
      cannot(Action.ProposalsCreate, ProposalClass);
      cannot(Action.ProposalsUpdate, ProposalClass);
      cannot(Action.ProposalsDelete, ProposalClass);
      can(Action.ProposalsAttachmentRead, ProposalClass);
      cannot(Action.ProposalsAttachmentCreate, ProposalClass);
      cannot(Action.ProposalsAttachmentUpdate, ProposalClass);
      cannot(Action.ProposalsAttachmentDelete, ProposalClass);
    } else {
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /**
         * authenticated users belonging to any of the group listed in ADMIN_GROUPS
         */

        can(Action.ProposalsRead, ProposalClass);
        can(Action.ProposalsCreate, ProposalClass);
        can(Action.ProposalsUpdate, ProposalClass);
        can(Action.ProposalsAttachmentRead, ProposalClass);
        can(Action.ProposalsAttachmentCreate, ProposalClass);
        can(Action.ProposalsAttachmentUpdate, ProposalClass);
        can(Action.ProposalsAttachmentDelete, ProposalClass);
      } else if (
        user.currentGroups.some((g) => {
          return this.accessGroups?.proposal.includes(g);
        })
      ) {
        /**
         * authenticated users belonging to any of the group listed in PROPOSAL_GROUPS
         */

        can(Action.ProposalsRead, ProposalClass);
        can(Action.ProposalsCreate, ProposalClass);
        can(Action.ProposalsUpdate, ProposalClass);
        can(Action.ProposalsAttachmentRead, ProposalClass);
        can(Action.ProposalsAttachmentCreate, ProposalClass);
        can(Action.ProposalsAttachmentUpdate, ProposalClass);
        can(Action.ProposalsAttachmentDelete, ProposalClass);
        cannot(Action.ProposalsDatasetRead, ProposalClass);
      } else if (user) {
        /**
         * authenticated users
         */

        can(Action.ProposalsRead, ProposalClass);
        cannot(Action.ProposalsCreate, ProposalClass);
        cannot(Action.ProposalsUpdate, ProposalClass);
        can(Action.ProposalsAttachmentRead, ProposalClass);
        cannot(Action.ProposalsAttachmentCreate, ProposalClass);
        cannot(Action.ProposalsAttachmentUpdate, ProposalClass);
        cannot(Action.ProposalsAttachmentDelete, ProposalClass);
        can(Action.ProposalsDatasetRead, ProposalClass);
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        /*
        / user that belongs to any of the group listed in DELETE_GROUPS
        */

        can(Action.ProposalsDelete, ProposalClass);
      } else {
        /*
        /  user that does not belong to any of the group listed in DELETE_GROUPS
        */

        cannot(Action.ProposalsDelete, ProposalClass);
      }
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  publishedDataEndpointAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    if (user) {
      can(Action.Read, PublishedData);
      can(Action.Update, PublishedData);
      can(Action.Create, PublishedData);
    }

    if (
      user &&
      user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
    ) {
      /*
        / user that belongs to any of the group listed in DELETE_GROUPS
        */
      can(Action.Delete, PublishedData);
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  samplesEndpointAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (!user) {
      // -------------------------------------
      // unauthenticated users
      // -------------------------------------

      can(Action.SampleRead, SampleClass);
      cannot(Action.SampleCreate, SampleClass);
      cannot(Action.SampleUpdate, SampleClass);
      cannot(Action.SampleDelete, SampleClass);
      can(Action.SampleAttachmentRead, SampleClass);
      cannot(Action.SampleAttachmentCreate, SampleClass);
      cannot(Action.SampleAttachmentUpdate, SampleClass);
      cannot(Action.SampleAttachmentDelete, SampleClass);
      cannot(Action.SampleDatasetRead, SampleClass);
    } else {
      // -------------------------------------
      // authenticated users
      // -------------------------------------

      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        // -------------------------------------
        // users that belong to any of the group listed in DELETE_GROUPS
        // -------------------------------------

        can(Action.SampleDelete, SampleClass);
        can(Action.SampleAttachmentDelete, SampleClass);
      } else {
        // -------------------------------------
        // users that do not belong to any of the group listed in DELETE_GROUPS
        // -------------------------------------

        cannot(Action.SampleDelete, SampleClass);
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in ADMIN_GROUPS
        // -------------------------------------

        can(Action.SampleRead, SampleClass);
        can(Action.SampleCreate, SampleClass);
        can(Action.SampleUpdate, SampleClass);
        can(Action.SampleAttachmentRead, SampleClass);
        can(Action.SampleAttachmentCreate, SampleClass);
        can(Action.SampleAttachmentUpdate, SampleClass);
        can(Action.SampleAttachmentDelete, SampleClass);
        can(Action.SampleDatasetRead, SampleClass);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.samplePrivileged.includes(g),
        )
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in SAMPLE_GROUPS
        //

        can(Action.SampleRead, SampleClass);
        can(Action.SampleCreate, SampleClass);
        can(Action.SampleUpdate, SampleClass);
        can(Action.SampleAttachmentRead, SampleClass);
        can(Action.SampleAttachmentCreate, SampleClass);
        can(Action.SampleAttachmentUpdate, SampleClass);
        can(Action.SampleAttachmentDelete, SampleClass);
        can(Action.SampleDatasetRead, SampleClass);
      } else if (
        user.currentGroups.some((g) => this.accessGroups?.sample.includes(g)) ||
        this.accessGroups?.sample.includes("#all")
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in SAMPLE_GROUPS
        //

        can(Action.SampleRead, SampleClass);
        can(Action.SampleCreate, SampleClass);
        can(Action.SampleUpdate, SampleClass);
        can(Action.SampleAttachmentRead, SampleClass);
        can(Action.SampleAttachmentCreate, SampleClass);
        can(Action.SampleAttachmentUpdate, SampleClass);
        can(Action.SampleAttachmentDelete, SampleClass);
        can(Action.SampleDatasetRead, SampleClass);
      } else {
        // -------------------------------------
        // users with no elevated permissions
        // -------------------------------------

        can(Action.SampleRead, SampleClass);
        cannot(Action.SampleCreate, SampleClass);
        cannot(Action.SampleUpdate, SampleClass);
        can(Action.SampleAttachmentRead, SampleClass);
        cannot(Action.SampleAttachmentCreate, SampleClass);
        cannot(Action.SampleAttachmentUpdate, SampleClass);
        if (
          !user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
        ) {
          cannot(Action.SampleAttachmentDelete, SampleClass);
        }
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  userEndpointAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (!user) {
      /**
      /*  unauthenticated users
      **/

      cannot(Action.UserReadOwn, User);
      cannot(Action.UserCreateOwn, User);
      cannot(Action.UserUpdateOwn, User);
      cannot(Action.UserDeleteOwn, User);
      cannot(Action.UserReadAny, User);
      cannot(Action.UserCreateAny, User);
      cannot(Action.UserUpdateAny, User);
      cannot(Action.UserDeleteAny, User);
    } else {
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /*
        / user that belongs to any of the group listed in ADMIN_GROUPS
        */

        // can(Action.ReadAll, UserIdentity); NOT used?

        // -------------------------------------
        // user endpoint, including useridentity
        can(Action.UserReadAny, User);
        can(Action.UserReadOwn, User);
        can(Action.UserCreateAny, User);
        can(Action.UserUpdateAny, User);
        can(Action.UserDeleteAny, User);
        can(Action.UserCreateJwt, User);

        // -------------------------------------
      } else if (user) {
        /**
        /*  authenticated users
        **/
        cannot(Action.UserReadAny, User);
        cannot(Action.UserCreateAny, User);
        cannot(Action.UserUpdateAny, User);
        cannot(Action.UserDeleteAny, User);
        cannot(Action.UserCreateJwt, User);
      }
      can(Action.UserReadOwn, User, { _id: user._id });
      can(Action.UserCreateOwn, User, { _id: user._id });
      can(Action.UserUpdateOwn, User, { _id: user._id });
      can(Action.UserDeleteOwn, User, { _id: user._id });
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  datasetInstanceAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (!user) {
      /**
      /*  unauthenticated users
      **/

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
    } else {
      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        /*
        / user that belongs to any of the group listed in DELETE_GROUPS
        */

        can(Action.DatasetDeleteAny, DatasetClass);
        // -
        can(Action.DatasetOrigdatablockDeleteAny, DatasetClass);
        // -
        can(Action.DatasetDatablockDeleteAny, DatasetClass);
      }
      if (
        user.currentGroups.some((g) =>
          this.accessGroups?.updateDatasetLifecycle.includes(g),
        )
      ) {
        /*
        / user that belongs to any of the group listed in UPDATE_DATASET_LIFECYCLE_GROUPS
        */
        can(Action.DatasetReadAny, DatasetClass);
        can(Action.DatasetLifecycleUpdateAny, DatasetClass);
      }
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /*
        / user that belongs to any of the group listed in ADMIN_GROUPS
        */

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
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetPrivileged.includes(g),
        )
      ) {
        /**
        /*  users belonging to CREATE_DATASET_PRIVILEGED_GROUPS
        **/

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
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetWithPid.includes(g),
        ) ||
        this.accessGroups?.createDatasetWithPid.includes("#all")
      ) {
        /**
        /*  users belonging to CREATE_DATASET_WITH_PID_GROUPS
        **/

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
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDataset.includes(g),
        ) ||
        this.accessGroups?.createDataset.includes("#all")
      ) {
        /**
        /*  users belonging to CREATE_DATASET_GROUPS
        **/

        can(Action.DatasetCreateOwnerNoPid, DatasetClass, {
          ownerGroup: { $in: user.currentGroups },
          pid: { $eq: "" },
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
      } else if (user) {
        /**
        /*  authenticated users
        **/

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
      }
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  origDatablockInstanceAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    if (!user) {
      /**
      /*  unauthenticated users
      **/

      can(Action.OrigdatablockReadManyPublic, OrigDatablock);
      can(Action.OrigdatablockReadOnePublic, OrigDatablock, {
        isPublished: true,
      });
      can(Action.DatasetOrigdatablockReadPublic, OrigDatablock, {
        isPublished: true,
      });
    } else {
      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        /**
        /* user that belongs to any of the group listed in DELETE_GROUPS
        **/

        can(Action.OrigdatablockDeleteAny, OrigDatablock);
      }
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /**
        /* user that belongs to any of the group listed in ADMIN_GROUPS
        **/

        can(Action.OrigdatablockCreateAny, OrigDatablock);
        can(Action.OrigdatablockReadAny, OrigDatablock);
        can(Action.OrigdatablockUpdateAny, OrigDatablock);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetPrivileged.includes(g),
        )
      ) {
        /**
        /*  users belonging to CREATE_DATASET_PRIVILEGED_GROUPS
        **/

        can(Action.OrigdatablockCreateAny, OrigDatablock);
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
          this.accessGroups?.createDatasetWithPid.includes(g),
        ) ||
        this.accessGroups?.createDatasetWithPid.includes("#all")
      ) {
        /**
        /*  users belonging to CREATE_DATASET_WITH_PID_GROUPS
        **/

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
          this.accessGroups?.createDataset.includes(g),
        ) ||
        this.accessGroups?.createDataset.includes("#all")
      ) {
        /**
        /*  users belonging to CREATE_DATASET_GROUPS
        **/

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
      }
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  jobsInstanceAccess(user: JWTUser, jobConfiguration: JobConfig) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (!user) {
      /**
       * unauthenticated users
       */
      if (jobConfiguration.create.auth === CreateJobAuth.All) {
        can(Action.JobCreateConfiguration, JobClass);
      }
      if (jobConfiguration.create.auth === CreateJobAuth.DatasetPublic) {
        can(Action.JobCreateConfiguration, JobClass);
      }
      if (jobConfiguration.update.auth === UpdateJobAuth.All) {
        can(Action.JobUpdateConfiguration, JobClass, {
          ownerGroup: undefined,
        });
      }
    } else {
      /**
       * authenticated users
       */
      // check if this user is part of the admin group
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /**
         * authenticated users belonging to any of the group listed in ADMIN_GROUPS
         */
        can(Action.JobReadAny, JobClass);
        can(Action.JobCreateAny, JobClass);
        can(Action.JobUpdateAny, JobClass);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createJobPrivileged.includes(g),
        )
      ) {
        can(Action.JobReadAny, JobClass);
        can(Action.JobCreateAny, JobClass);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.updateJobPrivileged.includes(g),
        )
      ) {
        can(Action.JobUpdateAny, JobClass);
        can(Action.JobReadAny, JobClass);
      } else {
        /**
         * authenticated users not belonging to any special group
         */
        const jobUserAuthorizationValues = [
          ...user.currentGroups.map((g) => "@" + g),
          user.username,
        ];
        can(Action.JobReadAccess, JobClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.JobReadAccess, JobClass, {
          ownerUser: user.username,
        });

        const jobCreateInstanceAuthorizationValues = [
          ...Object.values(CreateJobAuth).filter(
            (v) => !String(v).includes("#dataset"),
          ),
          ...jobUserAuthorizationValues,
        ];
        const jobCreateDatasetAuthorizationValues = [
          ...Object.values(CreateJobAuth).filter((v) =>
            String(v).includes("#dataset"),
          ),
        ];

        if (
          jobCreateInstanceAuthorizationValues.some(
            (a) => jobConfiguration.create.auth === a,
          )
        ) {
          can(Action.JobCreateConfiguration, JobClass);
        }
        if (
          jobCreateDatasetAuthorizationValues.some(
            (a) => jobConfiguration.create.auth === a,
          )
        ) {
          can(Action.JobCreateConfiguration, JobClass);
        }

        const jobUpdateInstanceAuthorizationValues = [
          ...Object.values(UpdateJobAuth).filter(
            (v) => !String(v).includes("#job"),
          ),
          ...jobUserAuthorizationValues,
        ];
        if (
          jobUpdateInstanceAuthorizationValues.some(
            (a) => jobConfiguration.update.auth === a,
          )
        ) {
          can(Action.JobUpdateConfiguration, JobClass);
        }
        if (jobConfiguration.update.auth === "#jobOwnerUser") {
          can(Action.JobUpdateConfiguration, JobClass, {
            ownerUser: user.username,
          });
        }
        if (jobConfiguration.update.auth === "#jobOwnerGroup") {
          can(Action.JobUpdateConfiguration, JobClass, {
            ownerGroup: { $in: user.currentGroups },
          });
        }
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  proposalsInstanceAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    if (!user) {
      /**
       * unauthenticated users
       */

      can(Action.ProposalsReadManyPublic, ProposalClass);
      can(Action.ProposalsReadOnePublic, ProposalClass, {
        isPublished: true,
      });
      can(Action.ProposalsAttachmentReadPublic, ProposalClass, {
        isPublished: true,
      });
    } else {
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        /**
         * authenticated users belonging to any of the group listed in ADMIN_GROUPS
         */

        can(Action.ProposalsReadAny, ProposalClass);
        can(Action.ProposalsCreateAny, ProposalClass);
        can(Action.ProposalsUpdateAny, ProposalClass);
        can(Action.ProposalsAttachmentReadAny, ProposalClass);
        can(Action.ProposalsAttachmentCreateAny, ProposalClass);
        can(Action.ProposalsAttachmentUpdateAny, ProposalClass);
        can(Action.ProposalsAttachmentDeleteAny, ProposalClass);
      } else if (
        user.currentGroups.some((g) => {
          return this.accessGroups?.proposal.includes(g);
        })
      ) {
        /**
         * authenticated users belonging to any of the group listed in PROPOSAL_GROUPS
         */

        can(Action.ProposalsCreateAny, ProposalClass);
        can(Action.ProposalsUpdateAny, ProposalClass);
        can(Action.ProposalsReadManyAccess, ProposalClass);
        can(Action.ProposalsReadOneAccess, ProposalClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.ProposalsReadOneAccess, ProposalClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.ProposalsReadOneAccess, ProposalClass, {
          isPublished: true,
        });
        //-
        can(Action.ProposalsAttachmentCreateAny, ProposalClass);
        can(Action.ProposalsAttachmentReadAccess, ProposalClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.ProposalsAttachmentReadAccess, ProposalClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.ProposalsAttachmentReadAccess, ProposalClass, {
          isPublished: true,
        });
        can(Action.ProposalsAttachmentUpdateOwner, ProposalClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.ProposalsAttachmentDeleteOwner, ProposalClass, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else if (user) {
        /**
         * authenticated users
         */

        can(Action.ProposalsReadManyAccess, ProposalClass);
        can(Action.ProposalsReadOneAccess, ProposalClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.ProposalsReadOneAccess, ProposalClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.ProposalsReadOneAccess, ProposalClass, {
          isPublished: true,
        });
        // -
        can(Action.ProposalsAttachmentReadAccess, ProposalClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.ProposalsAttachmentReadAccess, ProposalClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.ProposalsAttachmentReadAccess, ProposalClass, {
          isPublished: true,
        });
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        /*
        / user that belongs to any of the group listed in DELETE_GROUPS
        */
        can(Action.ProposalsDeleteAny, ProposalClass);
      } else {
        /*
        / user that does not belong to any of the group listed in DELETE_GROUPS
        */
        cannot(Action.ProposalsDeleteAny, ProposalClass);
      }
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  samplesInstanceAccess(user: JWTUser) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );

    if (!user) {
      // -------------------------------------
      // unauthenticated users
      // -------------------------------------

      can(Action.SampleReadManyPublic, SampleClass);
      can(Action.SampleReadOnePublic, SampleClass, {
        isPublished: true,
      });
      can(Action.SampleAttachmentReadPublic, SampleClass, {
        isPublished: true,
      });
    } else {
      // -------------------------------------
      // authenticated users
      // -------------------------------------

      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        // -------------------------------------
        // users that belong to any of the group listed in DELETE_GROUPS
        // -------------------------------------

        can(Action.SampleDeleteAny, SampleClass);
        can(Action.SampleAttachmentDeleteAny, SampleClass);
      } else {
        // -------------------------------------
        // users that do not belong to any of the group listed in DELETE_GROUPS
        // -------------------------------------

        cannot(Action.SampleDeleteAny, SampleClass);
        cannot(Action.SampleDeleteOwner, SampleClass);
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in ADMIN_GROUPS
        // -------------------------------------

        can(Action.SampleReadAny, SampleClass);
        can(Action.SampleCreateAny, SampleClass);
        can(Action.SampleUpdateAny, SampleClass);
        can(Action.SampleAttachmentReadAny, SampleClass);
        can(Action.SampleAttachmentCreateAny, SampleClass);
        can(Action.SampleAttachmentUpdateAny, SampleClass);
        can(Action.SampleAttachmentDeleteAny, SampleClass);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.samplePrivileged.includes(g),
        )
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in SAMPLE_GROUPS
        //

        can(Action.SampleCreateAny, SampleClass);
        can(Action.SampleUpdateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleReadManyAccess, SampleClass);
        can(Action.SampleReadOneAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleReadOneAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.SampleReadOneAccess, SampleClass, {
          isPublished: true,
        });
        can(Action.SampleAttachmentCreateAny, SampleClass);
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          isPublished: true,
        });
        can(Action.SampleAttachmentUpdateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentDeleteOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else if (
        user.currentGroups.some((g) => this.accessGroups?.sample.includes(g)) ||
        this.accessGroups?.sample.includes("#all")
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in SAMPLE_GROUPS
        //

        can(Action.SampleCreateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleUpdateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleReadManyAccess, SampleClass);
        can(Action.SampleReadOneAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleReadOneAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.SampleReadOneAccess, SampleClass, {
          isPublished: true,
        });
        can(Action.SampleAttachmentCreateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          isPublished: true,
        });
        can(Action.SampleAttachmentUpdateOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentDeleteOwner, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else {
        // -------------------------------------
        // users with no elevated permissions
        // -------------------------------------

        can(Action.SampleReadManyAccess, SampleClass);
        can(Action.SampleReadOneAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleReadOneAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.SampleReadOneAccess, SampleClass, {
          isPublished: true,
        });
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.SampleAttachmentReadAccess, SampleClass, {
          isPublished: true,
        });
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  attachmentInstanceAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    // -------------------------------------
    // any user can read public attachments
    // -------------------------------------
    can(Action.AttachmentReadInstance, Attachment, {
      isPublished: true,
    });
    if (user) {
      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        // -------------------------------------
        // users that belong to any of the group listed in DELETE_GROUPS
        // -------------------------------------

        can(Action.AttachmentDeleteInstance, Attachment);
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in ADMIN_GROUPS
        // -------------------------------------

        can(Action.AttachmentReadInstance, Attachment);
        can(Action.AttachmentCreateInstance, Attachment);
        can(Action.AttachmentUpdateInstance, Attachment);
        can(Action.AttachmentDeleteInstance, Attachment);

        can(Action.accessAny, Attachment);
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.attachmentPrivileged.includes(g),
        )
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in ATTACHMENT_GROUPS
        //

        can(Action.AttachmentCreateInstance, Attachment);
        can(Action.AttachmentReadInstance, Attachment, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.AttachmentReadInstance, Attachment, {
          accessGroups: { $in: user.currentGroups },
        });

        can(Action.AttachmentUpdateInstance, Attachment, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.AttachmentDeleteInstance, Attachment, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else if (
        user.currentGroups.some((g) =>
          this.accessGroups?.attachment.includes(g),
        ) ||
        this.accessGroups?.attachment.includes("#all")
      ) {
        // -------------------------------------
        // users belonging to any of the group listed in ATTACHMENT_GROUPS
        //

        can(Action.AttachmentCreateInstance, Attachment, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.AttachmentReadInstance, Attachment, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.AttachmentReadInstance, Attachment, {
          accessGroups: { $in: user.currentGroups },
        });
        can(Action.AttachmentReadInstance, Attachment, {
          isPublished: true,
        });
        can(Action.AttachmentUpdateInstance, Attachment, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.AttachmentDeleteInstance, Attachment, {
          ownerGroup: { $in: user.currentGroups },
        });
      } else {
        // -------------------------------------
        // users with no elevated permissions
        // -------------------------------------

        can(Action.AttachmentReadInstance, Attachment, {
          ownerGroup: { $in: user.currentGroups },
        });
        can(Action.AttachmentReadInstance, Attachment, {
          accessGroups: { $in: user.currentGroups },
        });
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  datablockInstanceAccess(user: JWTUser) {
    const { can, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>,
    );
    if (user) {
      // Can read if user is in ownerGroup/accessGroup or if published
      can(Action.DatablockReadInstance, Datablock, {
        ownerGroup: { $in: user.currentGroups },
      });
      can(Action.DatablockReadInstance, Datablock, {
        accessGroups: { $in: user.currentGroups },
      });
      can(Action.DatablockReadInstance, Datablock, { isPublished: true });

      // Can update if in ownerGroup
      can(Action.DatablockUpdateInstance, Datablock, {
        accessGroups: { $in: user.currentGroups },
      });

      // Ingestor group is allowed to create/update
      if (
        user.currentGroups.some((g) =>
          this.accessGroups?.createDataset.includes(g),
        ) ||
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetPrivileged.includes(g),
        ) ||
        user.currentGroups.some((g) =>
          this.accessGroups?.createDatasetWithPid.includes(g),
        )
      ) {
        can(Action.DatablockCreateInstance, Datablock);
        can(Action.DatablockUpdateAny, Datablock);
      }

      if (
        user.currentGroups.some((g) => this.accessGroups?.delete.includes(g))
      ) {
        can(Action.DatablockReadAny, Datablock);
        can(Action.DatablockUpdateAny, Datablock);
        can(Action.DatablockDeleteAny, Datablock);
      }
      if (
        user.currentGroups.some((g) => this.accessGroups?.admin.includes(g))
      ) {
        can(Action.DatablockCreateInstance, Datablock);
        can(Action.DatablockReadAny, Datablock);
        can(Action.DatablockUpdateAny, Datablock);
      }
    }
    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
