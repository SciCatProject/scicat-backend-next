import { forwardRef, Module } from "@nestjs/common";
import {
  MetadataKeyClass,
  MetadataKeyDocument,
  MetadataKeySchema,
} from "./schemas/metadatakey.schema";
import { MetadataKeysV4Controller } from "./metadatakeys.v4.controller";
import { MetadataKeysV4Service } from "./metadatakeys.v4.service";
import { HistoryModule } from "src/history/history.module";
import { LogbooksModule } from "src/logbooks/logbooks.module";
import { MongooseModule } from "@nestjs/mongoose";
import { PoliciesModule } from "src/policies/policies.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  GenericHistory,
  GenericHistorySchema,
} from "src/common/schemas/generic-history.schema";
import { PoliciesService } from "src/policies/policies.service";
import { applyHistoryPluginOnce } from "src/common/mongoose/plugins/history.plugin.util";

@Module({
  imports: [
    HistoryModule,
    forwardRef(() => LogbooksModule),
    MongooseModule.forFeatureAsync([
      {
        name: MetadataKeyClass.name,
        imports: [
          PoliciesModule,
          ConfigModule,
          MongooseModule.forFeature([
            {
              name: GenericHistory.name,
              schema: GenericHistorySchema,
            },
          ]),
        ],
        inject: [PoliciesService, ConfigService],
        useFactory: (
          policyService: PoliciesService,
          configService: ConfigService,
        ) => {
          const schema = MetadataKeySchema;

          schema.pre<MetadataKeyClass>("save", async function (next) {
            // if _id is empty or differnet than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.id;
            }

            // not sure if any of the following is needed
            // const policy = await policyService.findOne({
            //   ownerGroup: this.ownerGroup,
            // });
            // let av: string;
            // if (policy) {
            //   av = policy.tapeRedundancy || "low";
            // } else {
            //   const regexLiteral = /(?<=AV\=)(.*?)(?=\,)/g;
            //   av = (regexLiteral.exec(this.classification ?? "") || ["low"])[0];
            //   policyService.addDefaultPolicy(
            //     this.ownerGroup,
            //     this.accessGroups,
            //     this.ownerEmail ?? "",
            //     av,
            //     this.createdBy,
            //   );
            // }
            // this.classification = `IN=medium,AV=${av},CO=low`;
            next();
          });

          // Apply history plugin once if schema name matches TRACKABLES config
          applyHistoryPluginOnce(schema, configService);

          return schema;
        },
      },
    ]),
  ],
  exports: [MetadataKeysV4Service, MetadataKeysV4Controller],
  controllers: [MetadataKeysV4Controller],
  providers: [MetadataKeysV4Service],
})
export class DatasetsModule {}
