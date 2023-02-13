import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DatasetsModule } from "src/datasets/datasets.module";
import { DatasetClass, DatasetSchema } from "src/datasets/schemas/dataset.schema";
import { OrigDatablocksModule } from "src/origdatablocks/origdatablocks.module";
import { OrigDatablock, OrigDatablockSchema } from "src/origdatablocks/schemas/origdatablock.schema";
import { CaslAbilityFactory } from "./casl-ability.factory";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DatasetClass.name,
        schema: DatasetSchema,
      },
      {
        name: OrigDatablock.name,
        schema: OrigDatablockSchema,
      },
    ]),
  ],
  providers: [CaslAbilityFactory, DatasetsModule],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
