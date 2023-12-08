import { Logger } from "@nestjs/common";
import * as fs from "fs";
import { ApiProperty } from "@nestjs/swagger";
import * as yaml from 'js-yaml';

// TODO extend to more complex triggers/filters
// export type JobTrigger = "create" | "read" | "update" | "delete";

// interface JobAction {
//     run: (request: any) => void
// }

// class JobActionItem {
//     trigger: JobTrigger;
//     authorization?: string[];
//     validate?: any; //TODO
//     method: any;
// }

export class JobConfig {
    type: string;
    // actions: JobActionItem[];

    constructor(type: string) {
        this.type = type;
    }
}

export function loadJobConfig(filePath: string): JobConfig[] {
    // const data = fs.readFileSync(filePath, "utf8");
    // // TODO validate schema
    // const job_configs = JSON.parse(data) as JobConfig[];

    const job_configs = [new JobConfig("beautify")]; // TODO stub
    return job_configs;
}

/*
Questions
- Users.service.ts uses the 'OnModuleInit' to initiate loading from a fixed path.
  Should I do this too?
*/