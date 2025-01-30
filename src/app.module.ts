import { Logger, Module, OnApplicationBootstrap } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DatasetsModule } from "./datasets/datasets.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConditionalModule, ConfigModule, ConfigService } from "@nestjs/config";
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
import { HttpModule, HttpService } from "@nestjs/axios";
import { MSGraphMailTransport } from "./common/graph-mail";
import { TransportType } from "@nestjs-modules/mailer/dist/interfaces/mailer-options.interface";
import { MetricsModule } from "./metrics/metrics.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
    }),
    AuthModule,
    CaslModule,
    AttachmentsModule,
    CommonModule,
    // NOTE: `ConditionalModule.registerWhen` directly uses `process.env` as it does not support
    // dependency injection for `ConfigService`. This approach ensures compatibility while
    // leveraging environment variables for conditional module loading.
    ConditionalModule.registerWhen(
      MetricsModule,
      (env: NodeJS.ProcessEnv) => env.METRICS_ENABLED === "yes",
    ),
    LoggerModule,
    DatablocksModule,
    DatasetsModule,
    InitialDatasetsModule,
    InstrumentsModule,
    JobsModule,
    LogbooksModule,
    EventEmitterModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule, HttpModule],
      useFactory: async (
        configService: ConfigService,
        httpService: HttpService,
      ) => {
        let transport: TransportType;
        const transportType = configService
          .get<string>("email.type")
          ?.toLowerCase();
        if (transportType === "smtp") {
          transport = {
            host: configService.get<string>("email.smtp.host"),
            port: configService.get<number>("email.smtp.port"),
            secure: configService.get<boolean>("email.smtp.secure"),
          };
        } else if (transportType === "ms365") {
          const tenantId = configService.get<string>("email.ms365.tenantId"),
            clientId = configService.get<string>("email.ms365.clientId"),
            clientSecret = configService.get<string>(
              "email.ms365.clientSecret",
            );
          if (tenantId === undefined) {
            throw new Error("Missing MS365_TENANT_ID");
          }
          if (clientId === undefined) {
            throw new Error("Missing MS365_CLIENT_ID");
          }
          if (clientSecret === undefined) {
            throw new Error("Missing MS365_CLIENT_SECRET");
          }
          transport = new MSGraphMailTransport(httpService, {
            tenantId,
            clientId,
            clientSecret,
          });
        } else {
          throw new Error(
            `Invalid EMAIL_TYPE: ${transportType}. Expect on of "smtp" or "ms365"`,
          );
        }

        return {
          transport: transport,
          defaults: {
            from: configService.get<string>("email.from"),
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
      inject: [ConfigService, HttpService],
    }),
    MongooseModule.forRootAsync({
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
