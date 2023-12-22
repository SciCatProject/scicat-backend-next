/**
 * Simple JobAction for logging events.
 * This is intended as an example of the JobAction interface
 * 
 */
import { Logger } from "@nestjs/common";
import { JobCreateAction, registerCreateAction } from "../jobconfig";
import { JobClass } from "../../jobs/schemas/job.schema";
import { CreateJobDto } from "../../jobs/dto/create-job.dto";

export class LogJobAction implements JobCreateAction {
    static readonly type = "log";
    
    async validate(createJobDto: CreateJobDto) {
        Logger.log("Validating CREATE job: "+JSON.stringify(createJobDto));
    }

    async performJob(job: JobClass) {
        Logger.log("Performing CREATE job: "+JSON.stringify(job));
        return job;
    }

    constructor(data: Record<string, any>) {
        Logger.log("Initializing LogJobAction. Params: " + JSON.stringify(data));
    }
}

//registerCreateAction(LogJobAction.type, (data) => new LogJobAction(data))
