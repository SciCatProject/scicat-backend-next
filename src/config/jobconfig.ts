/**
 * Job configuration
 * 
 * Upon startup, first modules and plugins implementing JobAction should register
 * themselves with the various `register*Action` methods.
 * 
 * Calling `configuration()` from configuration.ts causes the JobConfig to be
 * instantiated for each job type (archive, retrieve, etc). The actions for this
 * JobConfig are also instantiated by calling `parse` on the registered action with
 * matching action type. This is passed the JSON configuration object.
 * 
 * Upon receiving an API request to create, read, or update a job, all configured
 * actions for that job/action combination are called to first verify the request body
 * and then perform the appropriate action.
 */
import { Logger } from "@nestjs/common";
import * as fs from "fs";
import { ApiProperty } from "@nestjs/swagger";
import * as yaml from 'js-yaml';
import { JobClass } from "../jobs/schemas/job.schema";
import { CreateJobDto } from "../jobs/dto/create-job.dto";
import { UpdateJobStatusDto } from "../jobs/dto/update-jobstatus.dto";


/**
 * Job types with special meanings in SciCat
 */
export enum JobType {
    Archive = "archive",
    Retrieve = "retrieve",
    Reset = "reset",
}

/**
 * Encapsulates all responses to a particular job type (eg "archive")
 */
export class JobConfig {
    type: string;

    create: JobCreateAction[];
    // read: JobReadAction[];
    update: JobUpdateAction[];

    constructor(type: string, create: JobCreateAction[]=[], read=[], update: JobUpdateAction[]=[]) {
        this.type = type;
        this.create = create;
        // this.read = read;
        this.update = update;
    }

    /**
     * Parse job configuration json by dispatching to currently registered JobActions
     * @param data JSON
     * @returns
     */
    static parse(data: Record<string, any>) {
        const type = data["type"];
        const create = "create" in data ? oneOrMore(data["create"]).map((json) => parseCreateAction(json["action"])) : [];
        const read = undefined; //"read" in data ? oneOrMore(data["read"]).map((json) => parseReadAction(json["action"])) : [];
        const update = "update" in data ? oneOrMore(data["update"]).map((json) => parseUpdateAction(json["action"])) : [];
        return new JobConfig(type, create, read, update);
    }
}

function oneOrMore<T>(x: T[]|T): T[]  {
    return Array.isArray(x) ? x : [x];
}

/**
 * Superclass for all responses to Job changes
 */
export interface JobAction<DtoType> {
    // TODO should this be static? how to type that?
    /**
     * Action type, eg "url".
     * 
     * Not to be confused with JobConfig.type
     */
    //type: string;
    /**
     * Validate the DTO, throwing an error for problems
     */
    validate: (dto: DtoType) => Promise<void>;
    /**
     * Respond to the action
     */
    performJob: (job: JobClass) => Promise<JobClass>;
}

export type JobCreateAction = JobAction<CreateJobDto>;
// export type JobReadAction = JobAction<ReadJobDto>;
export type JobUpdateAction = JobAction<UpdateJobStatusDto>;


/// Action registration

type JobActionCtor<T> = (json: Record<string,any>) => JobAction<T>;

const createActions: Record<string, JobActionCtor<CreateJobDto>> = {};
// const readActions: Record<string, JobActionCtor<ReadJobDto>> = {};
const updateActions: Record<string, JobActionCtor<UpdateJobStatusDto>> = {};
/**
 * Registers an action to handle jobs of a particular type
 * @param action 
 */
export function registerCreateAction(action_type: string, action: JobActionCtor<CreateJobDto> ) {
    createActions[action_type] = action;
}
/**
 * List of action types with a registered action
 * @returns 
 */
export function getRegisteredCreateActions(): string[] {
    return Object.keys(createActions);
}
// /**
//  * Registers an action to handle jobs of a particular type
//  * @param action 
//  */
// export function registerReadAction(action_type: string, action: JobActionCtor<ReadJobDto> ) {
//     reportErroreadActions[action_type] = action;
// }
// /**
//  * List of action types with a registered action
//  * @returns 
//  */
// export function getRegisteredReadActions(): string[] {
//     return Object.keys(readActions);
// }
/**
 * Registers an action to handle jobs of a particular type
 * @param action 
 */
export function registerUpdateAction(action_type: string, action: JobActionCtor<UpdateJobStatusDto> ) {
    updateActions[action_type] = action;
}
/**
 * List of action types with a registered action
 * @returns 
 */
export function getRegisteredUpdateActions(): string[] {
    return Object.keys(updateActions);
}
/// Parsing


/**
 * Load jobconfig.json file.
 * Expects one or more JobConfig configurations (see JobConfig.parse)
 * @param filePath path to json config file
 * @returns 
 */
export async function loadJobConfig(filePath: string): Promise<JobConfig[]> {
    const json = await fs.promises.readFile(filePath, "utf8");
    var data = JSON.parse(json);
    
    // TODO validate schema
    
    if(!Array.isArray(data)) {
        data = [data];
    }
    
    return data.map(JobConfig.parse);
}

/**
 * Given a JSON object configuring a JobConfigAction.
 * 
 * This is dispatched to registered constructors (see registerCreateAction) based on
 * the "type" field of data. Other parameters are action-specific.
 * @param data JSON configuration data
 * @returns 
 */
function parseCreateAction(data: Record<string, any>): JobCreateAction {
    if(!("type" in data))
        throw SyntaxError(`No action.type in ${JSON.stringify(data)}`);
    
    const type = data.type;
    if(!(type in createActions))
        throw SyntaxError(`No handler found for actions of type ${type}`)

    return createActions[type](data);
}
// /**
//  * Given a JSON object configuring a JobConfigAction.
//  * 
//  * This is dispatched to registered constructors (see registerCreateAction) based on
//  * the "type" field of data. Other parameters are action-specific.
//  * @param data JSON configuration data
//  * @returns 
//  */
// function parseReadAction(data: Record<string, any>): JobReadAction {
//     if(!("type" in data))
//         throw SyntaxError(`No action.type in ${JSON.stringify(data)}`);
    
//     const type = data.type;
//     if(!(type in readActions))
//         throw SyntaxError(`No handler found for actions of type ${type}`)

//     return readActions[type](data);
// }
/**
 * Given a JSON object configuring a JobConfigAction.
 * 
 * This is dispatched to registered constructors (see registerUpdateAction) based on
 * the "type" field of data. Other parameters are action-specific.
 * @param data JSON configuration data
 * @returns 
 */
function parseUpdateAction(data: Record<string, any>): JobUpdateAction {
    if(!("type" in data))
        throw SyntaxError(`No action.type in ${JSON.stringify(data)}`);
    
    const type = data.type;
    if(!(type in updateActions))
        throw SyntaxError(`No handler found for actions of type ${type}`)

    return updateActions[type](data);
}

