import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { DatasetClass, DatasetSchema } from "./schemas/dataset.schema";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { OrigDatablocksModule } from "src/origdatablocks/origdatablocks.module";
import { DatablocksModule } from "src/datablocks/datablocks.module";
import { InitialDatasetsModule } from "src/initial-datasets/initial-datasets.module";
import { LogbooksModule } from "src/logbooks/logbooks.module";
import { PoliciesService } from "src/policies/policies.service";
import { PoliciesModule } from "src/policies/policies.module";
import { ElasticSearchModule } from "src/elastic-search/elastic-search.module";
import { DatasetsV4Controller } from "./datasets.v4.controller";
import { DatasetsPublicV4Controller } from "./datasets-public.v4.controller";
import { DatasetsAccessService } from "./datasets-access.service";
import { CaslModule } from "src/casl/casl.module";

@Module({
  imports: [
    CaslModule,
    AttachmentsModule,
    DatablocksModule,
    OrigDatablocksModule,
    InitialDatasetsModule,
    ElasticSearchModule,
    forwardRef(() => LogbooksModule),
    MongooseModule.forFeatureAsync([
      {
        name: DatasetClass.name,
        imports: [PoliciesModule],
        inject: [PoliciesService],
        useFactory: (policyService: PoliciesService) => {
          const schema = DatasetSchema;

          schema.pre<DatasetClass>("save", async function (next) {
            // if _id is empty or differnet than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.pid;
            }
            const policy = await policyService.findOne({
              ownerGroup: this.ownerGroup,
            });
            let av: string;
            if (policy) {
              av = policy.tapeRedundancy || "low";
            } else {
              const regexLiteral = /(?<=AV\=)(.*?)(?=\,)/g;
              av = (regexLiteral.exec(this.classification ?? "") || ["low"])[0];
              policyService.addDefaultPolicy(
                this.ownerGroup,
                this.accessGroups,
                this.ownerEmail ?? "",
                av,
                this.createdBy,
              );
            }
            this.classification = `IN=medium,AV=${av},CO=low`;
            next();
          });

          return schema;
        },
      },
    ]),
    HttpModule,
  ],
  exports: [DatasetsService],
  controllers: [
    DatasetsPublicV4Controller,
    DatasetsController,
    DatasetsV4Controller,
  ],
  providers: [DatasetsService, DatasetsAccessService],
})
export class DatasetsModule {}
