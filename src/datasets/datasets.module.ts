import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Dataset, DatasetSchema } from "./schemas/dataset.schema";
import { DatasetsController } from "./datasets.controller";
import { DatasetsService } from "./datasets.service";
/* import { RawDataset, RawDatasetSchema } from "./schemas/raw-dataset.schema";
import {
  DerivedDataset,
  DerivedDatasetSchema,
} from "./schemas/derived-dataset.schema";
 */
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { AttachmentsModule } from "src/attachments/attachments.module";
import { ConfigModule } from "@nestjs/config";
import { OrigDatablocksModule } from "src/origdatablocks/origdatablocks.module";
import { DatablocksModule } from "src/datablocks/datablocks.module";
import { InitialDatasetsModule } from "src/initial-datasets/initial-datasets.module";
import { LogbooksModule } from "src/logbooks/logbooks.module";

@Module({
  imports: [
    AttachmentsModule,
    ConfigModule,
    DatablocksModule,
    InitialDatasetsModule,
    forwardRef(() => LogbooksModule),
    MongooseModule.forFeatureAsync([
      {
        name: Dataset.name,
        //schema: DatasetSchema,
        /* discriminators: [
          { name: RawDataset.name, schema: RawDatasetSchema },
          { name: DerivedDataset.name, schema: DerivedDatasetSchema },
        ],
 */
        //schema: DatasetSchema,
        useFactory: () => {
          const schema = DatasetSchema;

          schema.pre<Dataset>("save", function (next) {
            // if _id is empty or differnet than pid,
            // set _id to pid
            if (!this._id) {
              this._id = this.pid;
            }
            next();
          });

          return schema;
        },
      },
    ]),
    OrigDatablocksModule,
  ],
  exports: [DatasetsService],
  controllers: [DatasetsController],
  providers: [DatasetsService, CaslAbilityFactory],
})
export class DatasetsModule {}
