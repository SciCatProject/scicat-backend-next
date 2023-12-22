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


/**
 * Encapsulates all responses to a particular job type (eg "archive")
 */
export class JobConfig {
    type: string;

    create: JobCreateAction[];
    // read: JobReadAction[];
    // update: JobUpdateAction[];

    constructor(type: string, create: JobCreateAction[]=[], read=[], update=[]) {
        this.type = type;
        this.create = create;
        // this.read = read;
        // this.update = update;
    }

    /**
     * Parse job configuration json by dispatching to currently registered JobActions
     * @param data JSON
     * @returns
     */
    static parse(data: Record<string, any>) {
        const type = data["type"];
        const create = "create" in data ? oneOrMore(data["create"]).map((json) => parseCreateAction(json["action"])) : [];
        const read = undefined;
        const update = undefined;
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


/// Action registration

type JobCreateActionCtor = (json: Record<string,any>) => JobCreateAction;

const createActions: Record<string, JobCreateActionCtor> = {};
/**
 * Registers an action to handle jobs of a particular type
 * @param action 
 */
export function registerCreateAction(action_type: string, action: JobCreateActionCtor ) {
    createActions[action_type] = action;
}
export function getRegisteredCreateActions() {
    return Object.keys(createActions);
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

