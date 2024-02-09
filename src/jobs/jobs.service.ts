import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { readFileSync } from "fs";
import { compile } from "handlebars";
import { FilterQuery, Model, PipelineStage, QueryOptions } from "mongoose";
import { IFacets, IFilters } from "src/common/interfaces/common.interface";
import { MailService } from "src/common/mail.service";
import {
  createFullfacetPipeline,
  createFullqueryFilter,
  parseLimitFilters,
} from "src/common/utils";
import { DatasetsService } from "src/datasets/datasets.service";
import { IDatasetFields } from "src/datasets/interfaces/dataset-filters.interface";
import { DatasetDocument } from "src/datasets/schemas/dataset.schema";
import { PoliciesService } from "src/policies/policies.service";
import { Policy } from "src/policies/schemas/policy.schema";
import { CreateJobDto } from "./dto/create-job.dto";
import { PartialUpdateJobDto } from "./dto/update-job.dto";
import { JobType } from "./job-type.enum";
import { JobClass, JobDocument } from "./schemas/job.schema";

@Injectable()
export class JobsService {
  private domainName = process.env.HOST;
  private smtpMessageFrom;

  constructor(
    private configService: ConfigService,
    private datasetsService: DatasetsService,
    @InjectModel(JobClass.name) private jobModel: Model<JobDocument>,
    private mailService: MailService,
    private policiesService: PoliciesService,
  ) {
    this.smtpMessageFrom = this.configService.get<string>("smtp.messageFrom");
  }

  async create(createJobDto: CreateJobDto): Promise<JobClass> {
    const createdJob = new this.jobModel(createJobDto);
    return createdJob.save();
  }

  async findAll(
    filter: IFilters<JobDocument, FilterQuery<JobDocument>>,
  ): Promise<JobClass[]> {
    const whereFilters: FilterQuery<JobDocument> = filter.where ?? {};
    const { limit, skip, sort } = parseLimitFilters(filter.limits);

    return this.jobModel
      .find(whereFilters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }

  async fullquery(
    filter: IFilters<JobDocument, FilterQuery<JobDocument>>,
  ): Promise<JobClass[]> {
    const filterQuery: FilterQuery<JobDocument> =
      createFullqueryFilter<JobDocument>(this.jobModel, "id", filter.fields);
    const modifiers: QueryOptions = parseLimitFilters(filter.limits);

    return await this.jobModel.find(filterQuery, null, modifiers).exec();
  }

  async fullfacet(
    filters: IFacets<FilterQuery<JobDocument>>,
  ): Promise<Record<string, unknown>[]> {
    const fields = filters.fields ?? {};
    const facets = filters.facets ?? [];

    const pipeline: PipelineStage[] = createFullfacetPipeline<
      JobDocument,
      FilterQuery<JobDocument>
    >(this.jobModel, "id", fields, facets);

    return await this.jobModel.aggregate(pipeline).exec();
  }

  async findOne(filter: FilterQuery<JobDocument>): Promise<JobClass | null> {
    return this.jobModel.findOne(filter).exec();
  }

  async update(
    filter: FilterQuery<JobDocument>,
    updateJobDto: PartialUpdateJobDto,
  ): Promise<JobClass | null> {
    return this.jobModel
      .findOneAndUpdate(filter, updateJobDto, { new: true })
      .exec();
  }

  async remove(filter: FilterQuery<JobDocument>): Promise<unknown> {
    return this.jobModel.findOneAndDelete(filter).exec();
  }

  @OnEvent("jobCreated")
  async sendStartJobEmail(context: { instance: JobClass }) {
    const ids: string[] = context.instance.datasetList.map(
      (dataset) => dataset.pid as string,
    );
    const to: string = context.instance.emailJobInitiator;
    const jobType: string = context.instance.type;
    await this.markDatasetsAsScheduled(ids, jobType);

    const filter: IFilters<DatasetDocument, IDatasetFields> = {
      where: {
        pid: {
          $in: ids,
        },
      },
    };

    const jobData = ["archive", "retrieve"].includes(jobType)
      ? (await this.datasetsService.findAll(filter)).map((dataset) => ({
          pid: dataset.pid,
          ownerGroup: dataset.ownerGroup,
          sourceFolder: dataset.sourceFolder,
          size: dataset.size,
          archivable: dataset.datasetlifecycle?.archivable,
          retrievable: dataset.datasetlifecycle?.retrievable,
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
  @OnEvent("jobUpdated")
  async sendFinishJobEmail(context: {
    instance: JobClass;
    hookState: { oldData: JobClass[] };
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
              $in: ids,
            },
          },
        };

        const datasets = (await this.datasetsService.findAll(filter)).map(
          (dataset) => ({
            pid: dataset.pid,
            ownerGroup: dataset.ownerGroup,
            sourceFolder: dataset.sourceFolder,
            size: dataset.size,
            archiveStatusMessage:
              dataset.datasetlifecycle?.archiveStatusMessage,
            retrieveStatusMessage:
              dataset.datasetlifecycle?.retrieveStatusMessage,
            archiveReturnMessage:
              dataset.datasetlifecycle?.archiveReturnMessage,
            retrieveReturnMessage:
              dataset.datasetlifecycle?.retrieveReturnMessage,
            retrievable: dataset.datasetlifecycle?.retrievable,
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
        $in: ids,
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
      const dataset = await this.datasetsService.findOne({
        where: { pid: datasetId },
      });
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
