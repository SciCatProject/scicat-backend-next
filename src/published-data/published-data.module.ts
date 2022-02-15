import { Module } from "@nestjs/common";
import { PublishedDataService } from "./published-data.service";
import { PublishedDataController } from "./published-data.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  PublishedData,
  PublishedDataSchema,
} from "./schemas/published-data.schema";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: PublishedData.name,
        useFactory: () => {
          const schema = PublishedDataSchema;

          schema.pre<PublishedData>("save", function (next) {
            // if _id is empty or different than doi,
            // set _id to doi
            if (!this._id) {
              this._id = this.doi;
            }
            next();
          });
          return schema;
        },
      },
    ]),
  ],
  controllers: [PublishedDataController],
  providers: [PublishedDataService, CaslAbilityFactory],
})
export class PublishedDataModule {}
