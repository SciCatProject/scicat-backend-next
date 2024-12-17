import { Injectable } from "@nestjs/common";
import {
  JobActionCreator,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { isRabbitMQJobActionOptions } from "./rabbitmqaction.interface";
import { RabbitMQJobAction } from "./rabbitmqaction";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RabbitMQJobActionCreator implements JobActionCreator<JobDto> {
  constructor(private configService: ConfigService) {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isRabbitMQJobActionOptions(options)) {
      throw new Error("Invalid options for RabbitMQJobAction.");
    }
    return new RabbitMQJobAction(this.configService, options);
  }
}
