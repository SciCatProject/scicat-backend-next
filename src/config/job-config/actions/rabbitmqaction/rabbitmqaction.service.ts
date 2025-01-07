import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { isRabbitMQJobActionOptions } from "./rabbitmqaction.interface";
import { RabbitMQJobAction } from "./rabbitmqaction";
import { RabbitMQService } from "src/common/rabbitmq/rabbitmq.service";

@Injectable()
export class RabbitMQJobActionCreator implements JobActionCreator<JobDto> {
  constructor(
    private configService: ConfigService,
    private rabbitMQService: RabbitMQService,
  ) {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isRabbitMQJobActionOptions(options)) {
      throw new Error("Invalid options for RabbitMQJobAction.");
    }
    return new RabbitMQJobAction(
      this.configService,
      this.rabbitMQService,
      options,
    );
  }
}
