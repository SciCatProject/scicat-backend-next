import { Logger, Module, OnApplicationBootstrap } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DatasetsModule } from "./datasets/datasets.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CaslModule } from "./casl/casl.module";
import configuration from "./config/configuration";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { AttachmentsModule } from "./attachments/attachments.module";
import { OrigdatablocksModule } from "./origdatablocks/origdatablocks.module";
import { DatablocksModule } from "./datablocks/datablocks.module";
import { ProposalsModule } from "./proposals/proposals.module";
import { SamplesModule } from "./samples/samples.module";
import { PublishedDataModule } from "./published-data/published-data.module";
import { LogbooksModule } from "./logbooks/logbooks.module";
import { PoliciesModule } from "./policies/policies.module";
import { InitialDatasetsModule } from "./initial-datasets/initial-datasets.module";
import { JobsModule } from "./jobs/jobs.module";
import { InstrumentsModule } from "./instruments/instruments.module";
import { RabbitMQMessageBroker } from "@user-office-software/duo-message-broker";
import { IProposalAcceptedMessage } from "./common/interfaces/common.interface";
import { CreateProposalDto } from "./proposals/dto/create-proposal.dto";
import { ProposalsService } from "./proposals/proposals.service";

@Module({
  imports: [
    AttachmentsModule,
    AuthModule,
    CaslModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    DatablocksModule,
    DatasetsModule,
    InitialDatasetsModule,
    InstrumentsModule,
    JobsModule,
    LogbooksModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("mongodbUri"),
      }),
      inject: [ConfigService],
    }),
    OrigdatablocksModule,
    PoliciesModule,
    ProposalsModule,
    PublishedDataModule,
    SamplesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (ref) => new JwtAuthGuard(ref),
      inject: [Reflector],
    },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private configService: ConfigService,
    private proposalsService: ProposalsService,
  ) {}

  async onApplicationBootstrap() {
    const rabbitMqEnabled =
      this.configService.get<string>("rabbitMq.enabled") === "yes"
        ? true
        : false;
    if (rabbitMqEnabled) {
      const hostname = this.configService.get<string>("rabbitMq.hostname");
      const username = this.configService.get<string>("rabbitMq.username");
      const password = this.configService.get<string>("rabbitMq.password");

      if (!hostname || !username || !password) {
        Logger.error(
          "RabbitMQ enabled but missing one or more config variables",
          "AppModule",
        );
        return;
      }

      const rabbitMq = new RabbitMQMessageBroker();

      await rabbitMq.setup({
        hostname,
        username,
        password,
      });

      await rabbitMq.listenOnBroadcast(async (type, message: unknown) => {
        if (type === "PROPOSAL_ACCEPTED") {
          Logger.log(
            "PROPOSAL_ACCEPTED: " + JSON.stringify(message),
            "AppModule",
          );

          const proposalAcceptedMessage = message as IProposalAcceptedMessage;

          const proposal: CreateProposalDto = {
            proposalId: proposalAcceptedMessage.shortCode,
            title: proposalAcceptedMessage.title,
            pi_email: proposalAcceptedMessage.proposer?.email,
            pi_firstname: proposalAcceptedMessage.proposer?.firstName,
            pi_lastname: proposalAcceptedMessage.proposer?.lastName,
            email: proposalAcceptedMessage.proposer?.email,
            firstname: proposalAcceptedMessage.proposer?.firstName,
            lastname: proposalAcceptedMessage.proposer?.lastName,
            abstract: proposalAcceptedMessage.abstract,
            ownerGroup: "ess",
            accessGroups: [],
            createdBy: "proposalIngestor",
            updatedBy: "proposalIngestor",
          };

          try {
            const createdProposal = await this.proposalsService.create(
              proposal,
            );
            Logger.log(
              `Proposal created/updated: ${createdProposal.proposalId}`,
              "AppModule",
            );
          } catch (error) {
            Logger.error(
              "Creating/updating proposal failed: " + error,
              "AppModule",
            );
          }
        }
      });
    }
  }
}
