import { Module } from "@nestjs/common";
import { LogJobActionFactory } from "./logaction/logaction.factory";
import { LogJobActionModule } from "./logaction/logaction.module";
import { EmailJobActionFactory } from "./emailaction/emailaction.factory";
import { EmailJobActionModule } from "./emailaction/emailaction.module";
import { actionType as logActionType } from "./logaction/logaction.interface";
import { actionType as emailActionType } from "./emailaction/emailaction.interface";
import { ValidateJobActionModule } from "./validateaction/validateaction.module";
import { actionType as validateActionType } from "./validateaction/validateaction.interface";
import { ValidateJobActionFactory } from "./validateaction/validateaction.factory";
import { URLJobActionModule } from "./urlaction/urlaction.module";
import { URLJobActionFactory } from "./urlaction/urlaction.factory";
import { actionType as urlActionType } from "./urlaction/urlaction.interface";
import { RabbitMQJobActionModule } from "./rabbitmqaction/rabbitmqaction.module";
import { actionType as rabbitmqActionType } from "./rabbitmqaction/rabbitmqaction.interface";
import { RabbitMQJobActionFactory } from "./rabbitmqaction/rabbitmqaction.factory";
import {
  CREATE_JOB_ACTION_FACTORIES,
  UPDATE_JOB_ACTION_FACTORIES,
} from "../jobconfig.interface";

/**
 * Provide a list of built-in job action factories.
 *
 * CREATE_JOB_ACTION_FACTORIES and UPDATE_JOB_ACTION_FACTORIES be extended (eg by a
 * plugin) with additional factories.
 */
@Module({
  imports: [
    EmailJobActionModule,
    LogJobActionModule,
    ValidateJobActionModule,
    URLJobActionModule,
    RabbitMQJobActionModule,
  ],
  providers: [
    {
      provide: CREATE_JOB_ACTION_FACTORIES,
      useFactory: (
        logJobActionFactory,
        emailJobActionFactory,
        validateJobActionFactory,
        urlJobActionFactory,
        rabbitMQJobActionFactory,
      ) => {
        return {
          [logActionType]: logJobActionFactory,
          [emailActionType]: emailJobActionFactory,
          [validateActionType]: validateJobActionFactory,
          [urlActionType]: urlJobActionFactory,
          [rabbitmqActionType]: rabbitMQJobActionFactory,
        };
      },
      inject: [
        LogJobActionFactory,
        EmailJobActionFactory,
        ValidateJobActionFactory,
        URLJobActionFactory,
        RabbitMQJobActionFactory,
      ],
    },
    {
      provide: UPDATE_JOB_ACTION_FACTORIES,
      useFactory: (
        logJobActionFactory,
        emailJobActionFactory,
        validateJobActionFactory,
        urlJobActionFactory,
        rabbitMQJobActionFactory,
      ) => {
        return {
          [logActionType]: logJobActionFactory,
          [emailActionType]: emailJobActionFactory,
          [validateActionType]: validateJobActionFactory,
          [urlActionType]: urlJobActionFactory,
          [rabbitmqActionType]: rabbitMQJobActionFactory,
        };
      },
      inject: [
        LogJobActionFactory,
        EmailJobActionFactory,
        ValidateJobActionFactory,
        URLJobActionFactory,
        RabbitMQJobActionFactory,
      ],
    },
  ],
  exports: [CREATE_JOB_ACTION_FACTORIES, UPDATE_JOB_ACTION_FACTORIES],
})
export class DefaultJobActionFactories {}
