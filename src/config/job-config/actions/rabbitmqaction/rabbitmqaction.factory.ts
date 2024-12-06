import { Injectable } from "@nestjs/common";
import {
  JobActionFactory,
  JobActionOptions,
  JobDto,
} from "../../jobconfig.interface";
import { isRabbitMQJobActionOptions } from "../rabbitmqaction/rabbitmqaction.interface";
import { RabbitMQJobAction } from "./rabbitmqaction";

@Injectable()
export class RabbitMQJobActionFactory implements JobActionFactory<JobDto> {
  constructor() {}

  public create<Options extends JobActionOptions>(options: Options) {
    if (!isRabbitMQJobActionOptions(options)) {
      throw new Error("Invalid options for RabbitMQJobAction.");
    }
    return new RabbitMQJobAction(options);
  }
}
