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
import { OrigDatablocksModule } from "./origdatablocks/origdatablocks.module";
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
import { MailerModule } from "@nestjs-modules/mailer";
import { join } from "path";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { formatCamelCase, unwrapJSON } from "./common/handlebars-helpers";
import { CommonModule } from "./common/common.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AdminModule } from "./admin/admin.module";
import { HealthModule } from "./health/health.module";
import { LoggerModule } from "./loggers/logger.module";

@Module({
  imports: [
    AttachmentsModule,
    AuthModule,
    CaslModule,
    CommonModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    LoggerModule,
    DatablocksModule,
    DatasetsModule,
    InitialDatasetsModule,
    InstrumentsModule,
    JobsModule,
    LogbooksModule,
    EventEmitterModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const port = configService.get<string>("smtp.port");
        return {
          transport: {
            host: configService.get<string>("smtp.host"),
            port: port ? parseInt(port) : undefined,
            secure:
              configService.get<string>("smtp.secure") === "yes" ? true : false,
          },
          defaults: {
            from: configService.get<string>("smtp.messageFrom"),
          },
          template: {
            dir: join(__dirname, "./common/email-templates"),
            adapter: new HandlebarsAdapter({
              unwrapJSON: (json) => unwrapJSON(json),
              keyToWord: (string) => formatCamelCase(string),
              eq: (a, b) => a === b,
            }),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("mongodbUri"),
      }),
      inject: [ConfigService],
    }),
    OrigDatablocksModule,
    PoliciesModule,
    ProposalsModule,
    PublishedDataModule,
    SamplesModule,
    UsersModule,
    AdminModule,
    HealthModule,
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
          };

          try {
            const createdProposal =
              await this.proposalsService.create(proposal);
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
