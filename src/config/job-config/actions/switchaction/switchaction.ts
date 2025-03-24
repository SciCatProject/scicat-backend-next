import {
  CREATE_JOB_ACTION_CREATORS,
  JobAction,
  JobActionCreator,
  JobActionOptions,
  JobDto,
  performActions,
  validateActions,
} from "../../jobconfig.interface";
import { JobClass } from "../../../../jobs/schemas/job.schema";
import { JSONPath } from "jsonpath-plus";
import Ajv, { ValidateFunction } from "ajv";
import {
  actionType,
  CaseOptions,
  SwitchJobActionOptions,
  SwitchScope,
} from "./switchaction.interface";
import { CreateJobDto } from "src/jobs/dto/create-job.dto";
import { ModuleRef } from "@nestjs/core";
import {
  JSONData,
  loadDatasets,
  resolveDatasetService,
  toObject,
} from "../actionutils";
import { makeHttpException } from "src/common/utils";
import { HttpStatus, Logger } from "@nestjs/common";

/**
 * A Case gets matched against some target property.
 *
 * This base Case matches everything and is intended as a default option.
 */
class Case<Dto extends JobDto> {
  public actions: JobAction<Dto>[];

  constructor(
    options: CaseOptions,
    creators: Record<string, JobActionCreator<Dto>>,
  ) {
    this.actions = Case.parseActions<Dto>(options.actions || [], creators);
  }

  private static parseActions<Dto extends JobDto>(
    options: JobActionOptions[],
    creators: Record<string, JobActionCreator<Dto>>,
  ) {
    return options.map((opt) => {
      if (!(opt.actionType in creators)) {
        throw new Error(`Unknown action type '${opt.actionType}'`);
      }
      return creators[opt.actionType].create(opt);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public matches(json: JSONData): boolean {
    // default Case matches everything
    return true;
  }
}

/**
 * Match either a regex or a string literal
 */
class RegexCase<Dto extends JobDto> extends Case<Dto> {
  private match: RegExp | string;
  constructor(
    options: { match: string; actions: JobActionOptions[] },
    creators: Record<string, JobActionCreator<Dto>>,
  ) {
    super(options, creators);
    this.match = this.parseMatch(options.match);
  }

  private parseMatch(str: string): RegExp | string {
    // Try to parse the string as a slash-delimited regex
    const match = str.match(/^\/(.*)\/([a-z]*)$/);
    if (match) {
      return new RegExp(match[1], match[2]);
    }
    // Default to string
    return str;
  }

  public matches(target: JSONData) {
    if (typeof target !== "string") {
      throw makeHttpException(
        `Property ${target} was expected to be a string.`,
      );
    }
    // exact string match
    if (typeof this.match === "string") {
      return this.match == target;
    }
    // regex match
    return this.match.test(target);
  }
}

/**
 * Match against a JSON schema
 */
class SchemaCase<Dto extends JobDto> extends Case<Dto> {
  private schema: ValidateFunction;
  constructor(
    options: { schema: object; actions: JobActionOptions[] },
    creators: Record<string, JobActionCreator<Dto>>,
    ajv: Ajv,
  ) {
    super(options, creators);
    this.schema = ajv.compile(options.schema);
  }
  public matches(target: JSONData) {
    // Validate JSON schema
    return this.schema(target);
  }
}

export class SwitchJobAction<Dto extends JobDto> implements JobAction<Dto> {
  private scope: SwitchScope;
  private property: string;
  private cases: Promise<Case<Dto>[]>;

  getActionType(): string {
    return actionType;
  }

  constructor(
    protected moduleRef: ModuleRef,
    options: SwitchJobActionOptions,
    creators_token: symbol | string,
    ajv?: Ajv,
  ) {
    const ajvDefined =
      ajv ||
      new Ajv({
        strictSchema: false,
        strictTypes: false,
      });
    this.scope = options.scope;
    this.property = options.property;
    const creators = this.resolveActionCreators(creators_token);

    //const x: {a:string} = {a:"a", b:1};
    // Define an interface with an index signature
    this.cases = creators.then((creators) => {
      return options.cases.map((caseOptions: CaseOptions) => {
        if ("schema" in caseOptions) {
          return new SchemaCase<Dto>(caseOptions, creators, ajvDefined);
        } else if ("match" in caseOptions) {
          return new RegexCase<Dto>(caseOptions, creators);
        } else {
          return new Case<Dto>(caseOptions, creators);
        }
      });
    });
  }

  protected async resolveTarget(
    scope: SwitchScope,
    job: Dto | JobClass,
  ): Promise<JSONData> {
    if (scope == SwitchScope.Request) {
      return toObject(job);
    } else {
      throw makeHttpException(`Unsupported switch.scope '${scope}'`);
    }
  }

  protected async resolveActions(
    job: JSONData,
    target: JSONData,
  ): Promise<JobAction<Dto>[]> {
    // Apply the JSONPath to extract matching properties
    const result: JSONData[] = JSONPath<JSONData[]>({
      path: this.property,
      json: target,
    });
    if (result == null || result?.length == 0) {
      throw makeHttpException(
        `No value for '${this.property}' in ${this.scope} scope.'`,
      );
    }
    if (result.length > 1) {
      throw makeHttpException(
        `Ambiguous value for '${this.property}' in ${this.scope} scope.'`,
      );
    }
    // Find matching case
    for (const caseItem of await this.cases) {
      if (caseItem.matches(result[0])) {
        return caseItem.actions;
      }
    }
    // No matching cases
    return [];
  }

  protected async resolveActionCreators(
    token: string | symbol,
  ): Promise<Record<string, JobActionCreator<Dto>>> {
    const creators = await this.moduleRef.resolve(token, undefined, {
      strict: false,
    });

    if (creators === undefined || creators.length == 0) {
      // This shouldn't happen unless the NestJS dependency graph is messed up.
      // It is left here for debugging.
      const token_str = typeof token === "symbol" ? token.description : token;
      const msg = `Unable to resolve ${token_str}. This indicates an unexpected server state.`;
      Logger.error(msg);
      throw makeHttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return creators;
  }

  /**
   * Validate the current request
   * @param dto Job DTO
   */
  async validate(dto: Dto): Promise<void> {
    // Resolve scope into the target object
    const target = await this.resolveTarget(this.scope, dto);

    const actions = await this.resolveActions(dto, target);
    return await validateActions(actions, dto);
  }

  async performJob(job: JobClass): Promise<void> {
    // Resolve scope into the target object
    const target = await this.resolveTarget(this.scope, job);

    const actions = await this.resolveActions(job, target);
    return await performActions(actions, job);
  }
}

export class SwitchCreateJobAction extends SwitchJobAction<CreateJobDto> {
  protected async resolveTarget(
    scope: SwitchScope,
    job: CreateJobDto | JobClass,
  ): Promise<JSONData> {
    if (scope == SwitchScope.Datasets) {
      const datasetsService = await resolveDatasetService(this.moduleRef);
      const datasets = await loadDatasets(datasetsService, job);

      return toObject(datasets);
    }
    return super.resolveTarget(scope, job);
  }

  protected async resolveActionCreators(): Promise<
    Record<string, JobActionCreator<CreateJobDto>>
  > {
    const creators = await this.moduleRef.resolve(
      CREATE_JOB_ACTION_CREATORS,
      undefined,
      {
        strict: false,
      },
    );

    if (creators === undefined || creators.length == 0) {
      // This shouldn't happen unless the NestJS dependency graph is messed up.
      // It is left here for debugging.
      Logger.error(
        `Unable to resolve CREATE_JOB_ACTION_CREATORS. This indicates an unexpected server state.`,
      );
      throw makeHttpException(
        "Unable to resolve CREATE_JOB_ACTION_CREATORS. This indicates an unexpected server state.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return creators;
  }
}
