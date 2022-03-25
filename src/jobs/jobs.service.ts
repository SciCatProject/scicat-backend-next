import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { readFileSync } from "fs";
import { compile } from "handlebars";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { MailService } from "src/common/mail.service";
import { createNewFacetPipeline, parseLimitFilters } from "src/common/utils";
import { DatasetsService } from "src/datasets/datasets.service";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import { DatasetDocument } from "src/datasets/schemas/dataset.schema";
import { PoliciesService } from "src/policies/policies.service";
import { Policy } from "src/policies/schemas/policy.schema";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { JobField } from "./job-field.enum";
import { JobType } from "./job-type.enum";
import { Job, JobDocument } from "./schemas/job.schema";

@Injectable()
export class JobsService implements OnModuleInit {
  private domainName = process.env.HOST;
  private smtpMessageFrom = this.configService.get<string>("smtpMessageFrom");

  constructor(
    private configService: ConfigService,
    private datasetsService: DatasetsService,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private mailService: MailService,
    private policiesService: PoliciesService,
  ) {}

  onModuleInit() {
    this.jobModel.addListener("jobCreated", this.sendStartJobEmail);
    this.jobModel.addListener("jobUpdated", this.sendFinishJobEmail);
  }

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const createdJob = new this.jobModel(createJobDto);
    return createdJob.save();
  }

  async findAll(
    filter: IFilters<JobDocument, FilterQuery<JobDocument>>,
  ): Promise<Job[]> {
    const whereFilters: FilterQuery<JobDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters<Job>(filter.limits);

    return this.jobModel
      .find(whereFilters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(
    filter: IFilters<JobDocument, FilterQuery<JobDocument>>,
  ): Promise<Job[]> {
    const modifiers: QueryOptions = {};
    const filterQuery: FilterQuery<JobDocument> = {};

    if (filter) {
      const { limit, skip, sort } = parseLimitFilters(filter.limits);
      modifiers.limit = limit;
      modifiers.skip = skip;
      modifiers.sort = sort;

      if (filter.fields) {
        const fields = filter.fields;
        Object.keys(fields).forEach((key) => {
          if (key === JobField.Text) {
            const text = fields[key];
            if (text) {
              filterQuery.$text = { $search: text };
            }
          } else if (key === JobField.CreationTime) {
            const { begin, end } = fields.creationTime;
            filterQuery.creationTime = {
              $gte: new Date(begin),
              $lte: new Date(end),
            };
          } else {
            filterQuery[key] = fields[key];
          }
        });
      }
    }

    return await this.jobModel.find(filterQuery, null, modifiers).exec();
  }

  async fullfacet(
    filters: IFacets<FilterQuery<JobDocument>>,
  ): Promise<Record<string, unknown>[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];
    const pipeline = [];
    const facetMatch: Record<string, unknown> = {};
    const allMatch = [];

    Object.keys(fields).forEach((key) => {
      if (facets.indexOf(key) < 0) {
        if (key === JobField.Text) {
          if (typeof fields[key] === "string") {
            const match = {
              $match: {
                $or: [
                  {
                    $text: this.searchExpression(key, fields[key]),
                  },
                ],
              },
            };
            pipeline.unshift(match);
          }
        } else if (key === JobField.Id) {
          const match = {
            $match: {
              id: this.searchExpression(key, fields[key]),
            },
          };
          allMatch.push(match);
          pipeline.push(match);
        } else {
          const match: Record<string, unknown> = {};
          match[key] = this.searchExpression(key, fields[key]);
          const m = {
            $match: match,
          };
          allMatch.push(m);
          pipeline.push(m);
        }
      } else {
        facetMatch[key] = this.searchExpression(key, fields[key]);
      }
    });

    const facetObject: Record<string, PipelineStage[]> = {};
    facets.forEach((facet) => {
      if (facet in this.jobModel.schema.paths) {
        facetObject[facet] = createNewFacetPipeline(
          facet,
          this.schemaTypeOf(facet),
          facetMatch,
        );
        return;
      } else {
        Logger.warn(
          `Warning: Facet not part of any model: ${facet}`,
          "JobsService",
        );
      }
    });

    facetObject["all"] = [
      {
        $match: facetMatch,
      },
      {
        $count: "totalSets",
      },
    ];
    pipeline.push({ $facet: facetObject });

    const results = await this.jobModel
      .aggregate(pipeline as PipelineStage[])
      .exec();
    return results;
  }

  async findOne(filter: FilterQuery<JobDocument>): Promise<Job | null> {
    return this.jobModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<JobDocument>,
    updateJobDto: UpdateJobDto,
  ): Promise<Job | null> {
    return this.jobModel
      .findOneAndUpdate(filter, updateJobDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<JobDocument>): Promise<unknown> {
    return this.jobModel.findOneAndRemove(filter).exec();
  }

  private searchExpression(fieldName: string, value: unknown): unknown {
    if (fieldName === JobField.Text) {
      return { $search: value };
    }

    const valueType = this.schemaTypeOf(fieldName, value);

    if (valueType === "String") {
      if (Array.isArray(value)) {
        if (value.length === 1) {
          return value[0];
        } else {
          return { $in: value };
        }
      } else {
        return value;
      }
    } else if (valueType === "Date") {
      return {
        $gte: new Date((value as Record<string, string | Date>).begin),
        $lte: new Date((value as Record<string, string | Date>).end),
      };
    } else if (valueType === "Boolean") {
      return { $eq: value };
    } else if (Array.isArray(value)) {
      return { $in: value };
    } else {
      return value;
    }
  }

  private schemaTypeOf(key: string, value: unknown = null): string {
    const property = this.jobModel.schema.path(key);

    if (!property) {
      if ("begin" in (value as Record<string, unknown>)) {
        return "Date";
      }
      return "String";
    }

    return property.instance;
  }

  async sendStartJobEmail(context: { instance: Job }) {
    const ids: string[] = context.instance.datasetList.map(
      (dataset) => dataset.pid as string,
    );
    const to: string = context.instance.emailJobInitiator;
    const jobType: string = context.instance.type;
    await this.markDatasetsAsScheduled(ids, jobType);

    const filter: IFilters<DatasetDocument, IDatasetFields> = {
      where: {
        pid: {
          inq: ids,
        },
      },
    };

    const jobData = ["archive", "retrieve"].includes(jobType)
      ? (await this.datasetsService.findAll(filter)).map((dataset) => ({
          pid: dataset.pid,
          ownerGroup: dataset.ownerGroup,
          sourceFolder: dataset.sourceFolder,
          size: dataset.size,
          archivable: dataset.datasetlifecycle.archivable,
          retrievable: dataset.datasetlifecycle.retrievable,
        }))
      : [];

    const emailContext = {
      domainName: this.domainName,
      subject: `Your ${jobType} job submitted successfully`,
      jobSubmissionNotification: {
        jobId: context.instance.id,
        jobType,
        jobData,
      },
    };

    const policy = await this.getPolicy(ids[0]);
    await this.applyPolicyAndSendEmail(jobType, policy, emailContext, to);
  }

  // Populate email context for finished job notification
  async sendFinishJobEmail(context: {
    instance: Job;
    hookState: { oldData: Job[] };
  }) {
    // Iterate through list of jobs that were updated
    // Iterate in case of bulk update send out email to each job
    context.hookState.oldData.forEach(async (oldData) => {
      const currentData = await this.findOne({ id: oldData.id });
      //Check that statusMessage has changed. Only run on finished job
      if (
        currentData &&
        currentData.jobStatusMessage !== oldData.jobStatusMessage &&
        currentData.jobStatusMessage.indexOf("finish") !== -1
      ) {
        const ids = currentData.datasetList.map(
          (dataset) => dataset.pid as string,
        );
        const to = currentData.emailJobInitiator;
        const {
          type: jobType,
          id: jobId,
          jobStatusMessage,
          jobResultObject,
        } = currentData;
        const failure = jobStatusMessage.indexOf("finishedSuccessful") === -1;
        const filter = {
          where: {
            pid: {
              inq: ids,
            },
          },
        };

        const datasets = (await this.datasetsService.findAll(filter)).map(
          (dataset) => ({
            pid: dataset.pid,
            ownerGroup: dataset.ownerGroup,
            sourceFolder: dataset.sourceFolder,
            size: dataset.size,
            archiveStatusMessage: dataset.datasetlifecycle.archiveStatusMessage,
            retrieveStatusMessage:
              dataset.datasetlifecycle.retrieveStatusMessage,
            archiveReturnMessage: dataset.datasetlifecycle.archiveReturnMessage,
            retrieveReturnMessage:
              dataset.datasetlifecycle.retrieveReturnMessage,
            retrievable: dataset.datasetlifecycle.retrievable,
          }),
        );

        // split result into good and bad
        const good = datasets.filter((dataset) => dataset.retrievable);
        const bad = datasets.filter((dataset) => !dataset.retrievable);

        // add cc message in case of failure to scicat archivemanager
        const cc =
          bad.length > 0 && this.smtpMessageFrom ? this.smtpMessageFrom : "";
        const creationTime = currentData.creationTime
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, "");
        const additionalMsg =
          jobType === JobType.Retrieve && good.length > 0
            ? "You can now use the command 'datasetRetriever' to move the retrieved datasets to their final destination."
            : "";

        const emailContext = {
          domainName: this.domainName,
          subject: ` Your ${jobType} job from ${creationTime} is finished ${
            failure ? "with failure" : "successfully"
          }`,
          jobFinishedNotification: {
            jobId,
            jobType,
            failure,
            creationTime,
            jobStatusMessage,
            jobResultObject: jobResultObject,
            datasets: {
              good,
              bad,
            },
            additionalMsg,
          },
        };

        const policy = await this.getPolicy(ids[0]);
        await this.applyPolicyAndSendEmail(
          jobType,
          policy,
          emailContext,
          to,
          cc,
        );
      }
    });
  }

  async markDatasetsAsScheduled(ids: string[], jobType: string) {
    const statusMessage = {
      retrieve: "scheduledForRetrieval",
      archive: "scheduledForArchiving",
    };
    const filter = {
      pid: {
        inq: ids,
      },
    };

    switch (jobType) {
      case JobType.Archive: {
        const values = {
          $set: {
            "datasetlifecycle.archivable": false,
            "datasetlifecycle.retrievable": false,
            [`datasetlifecycle.${jobType}StatusMessage`]:
              statusMessage[jobType],
          },
        };
        await this.datasetsService.updateAll(filter, values);
        break;
      }
      case JobType.Retrieve: {
        const values = {
          $set: {
            [`datasetlifecycle.${jobType}StatusMessage`]:
              statusMessage[jobType],
          },
        };
        await this.datasetsService.updateAll(filter, values);
        break;
      }
      default:
        break;
    }
  }

  async getPolicy(datasetId: string): Promise<Partial<Policy>> {
    try {
      const dataset = await this.datasetsService.findOne({ pid: datasetId });
      if (!dataset) {
        throw new NotFoundException(
          "Could not dataset with pid " + datasetId,
          "JobsService",
        );
      }
      const policy = await this.policiesService.findOne({
        ownerGroup: dataset.ownerGroup,
      });

      if (policy) {
        return policy;
      }
    } catch (error) {
      const message = "Error when looking for Policy of pgroup " + error;
      Logger.error("Dataset ID: " + datasetId, "JobsService");
      Logger.error(message);
    }

    Logger.log(
      "No policy found for dataset with id: " + datasetId,
      "JobsService",
    );
    Logger.log("Returning default policy instead", "JobsService");
    // this should not happen anymore, but kept as additional safety belt
    const defaultPolicy: Partial<Policy> = {
      archiveEmailNotification: true,
      retrieveEmailNotification: true,
      archiveEmailsToBeNotified: [],
      retrieveEmailsToBeNotified: [],
    };
    return defaultPolicy;
  }

  async applyPolicyAndSendEmail(
    jobType: string,
    policy: Partial<Policy>,
    emailContext: Record<string, unknown>,
    to: string,
    cc = "",
  ) {
    const { failure } = emailContext;

    switch (jobType) {
      case JobType.Archive: {
        const { archiveEmailNotification, archiveEmailsToBeNotified } = policy;
        if (archiveEmailsToBeNotified) {
          to += "," + archiveEmailsToBeNotified.join();
        }

        // Always notify on failure
        if (archiveEmailNotification || failure) {
          await this.sendEmail(to, cc, emailContext);
        }
        break;
      }
      case JobType.Retrieve: {
        const { retrieveEmailNotification, retrieveEmailsToBeNotified } =
          policy;

        if (retrieveEmailsToBeNotified) {
          to += "," + retrieveEmailsToBeNotified.join();
        }

        // Always notify on failure
        if (retrieveEmailNotification || failure) {
          await this.sendEmail(to, cc, emailContext);
        }
        break;
      }
      default: {
        // For other jobs like reset job
        await this.sendEmail(to, cc, emailContext);
        break;
      }
    }
  }

  async sendEmail(
    to: string,
    cc: string,
    emailContext: Record<string, unknown>,
  ) {
    const htmlTemplate = readFileSync(
      "src/common/email-templates/job-template.html",
      "utf-8",
    );
    const emailTemplate = compile(htmlTemplate);
    const email = emailTemplate(emailContext);
    const subject = emailContext.subject as string;
    await this.mailService.sendMail(to, cc, subject, null, email);
  }
}
