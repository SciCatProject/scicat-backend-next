# Job Configuration

## Background

Jobs are SciCat's main way of interacting with external systems. Thus the actions which
should be performed when a job is created or updated (with POST or PATCH requests; see
[job.controller.ts](../../jobs/job.controller.ts)) tend to be facility specific. To
facilitate this, the allowed jobs are configured in a YAML or JSON file. An example file
is available at [jobConfig.example.yaml](../../../jobConfig.example.yaml). The location
of the job config file is configurable in with the `JOB_CONFIGURATION_FILE` environment
variable.

The file is parsed when the application starts and converted to a `JobConfigService`
instance. Job types are arbitrary and facility-specific, but `archive` and `retrieve`
are traditional for interacting with the data storage system. Authorization can be
configured for each job type for *create* and *update* requests, and then a list of
actions are provided which should run after the request.

## Implementing an Action

Implementing an Action requires four (short) files:

1. `action.ts` contains a class implementing `JobAction`. The constructor can take any
   arguments, but the existing actions take an `options` argument mirroring the expected
   yaml config. It does not need to be `@Injectable()`, since it is constructed by a
   JobActionCreator class.
2. `action.interface.ts` can contain additional types, e.g. the definition of the
   expected `options` and a type guard for casting to the options. It should also
   defined an `actionType` string constant which is used in the yaml file to identity
   this action.
3. `action.service.ts` should provide an implementation of `JobActionCreator`. The
   creator is provided by NestJS as a singleton, so it must be `@Injectable()`. This
   means that dependencies can be injected into the creator. It has a `create(options)`
   method, which constructs the action itself by combining the options from the yaml
   file with any dependencies injected by NestJS.
4. `action.module.ts` is an NestJS module that provides the creator.

The lists of known creators are provided to Nest with the `CREATE_JOB_ACTION_CREATORS`
and `UPDATE_JOB_ACTION_CREATORS` symbols. The top-level AppModule imports built-in
actions from `CoreJobActionCreators`. Core actions should be added to this list. Plugins
can use the NestJS dependency injection system to extend the lists if needed.

## Accessing the jobConfig

Parsing `jobConfig.yaml` is handled by the JobConfigService. NestJS injects the lists of
creators (and the file path) during construction. When parsing reaches a new action, the
correct creator is used to create an instance of the JobAction with the current list of
options.

Code which needs the configuration for a particular job type (eg jobs.controller.ts)
injects the `JobConfigService` and can then call `jobConfigService.get(jobType)`.
