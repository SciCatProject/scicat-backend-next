/**
 * Simple JobAction for logging events.
 * This is intended as an example of the JobAction interface
 * 
 */
import { Logger } from "@nestjs/common";
import { JobAction } from "../jobconfig";
import { JobClass } from "../../jobs/schemas/job.schema";

export class LogJobAction<T> implements JobAction<T>{
    static readonly type = "log";
    
    async validate(dto: T) {
        Logger.log("Validating CREATE job: "+JSON.stringify(dto));
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
