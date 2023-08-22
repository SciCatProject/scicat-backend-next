import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DatasetClass, DatasetSchema } from "./schemas/dataset.schema";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { ConfigModule } from "@nestjs/config";
import { OrigDatablocksModule } from "src/origdatablocks/origdatablocks.module";
import { DatablocksModule } from "src/datablocks/datablocks.module";
import { InitialDatasetsModule } from "src/initial-datasets/initial-datasets.module";
import { LogbooksModule } from "src/logbooks/logbooks.module";
import { PoliciesService } from "src/policies/policies.service";
import { PoliciesModule } from "src/policies/policies.module";
import { ElasticSearchModule } from "src/elastic-search/elastic-search.module";

@Module({
  imports: [
    AttachmentsModule,
    ConfigModule,
    DatablocksModule,
    OrigDatablocksModule,
    InitialDatasetsModule,
    ElasticSearchModule,
    forwardRef(() => LogbooksModule),
    MongooseModule.forFeatureAsync([
      {
        name: DatasetClass.name,
        imports: [PoliciesModule],
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
        inject: [PoliciesService],
      },
    ]),
  ],
  exports: [DatasetsService],
  controllers: [DatasetsController],
  providers: [DatasetsService, CaslAbilityFactory],
})
export class DatasetsModule {}
