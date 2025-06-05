import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  GenericHistory,
  GenericHistoryDocument,
} from "../common/schemas/generic-history.schema";

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(GenericHistory.name)
    private historyModel: Model<GenericHistoryDocument>,
  ) {}

  /**
   * Finds all history documents by collection name.
   *
   * @param collectionName the name of the collection to search for
   * @param options optional options for pagination and sorting
   * @returns a promise that resolves to an array of history documents
   */
  async findByCollectionName(
    collectionName: string,
    options?: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<GenericHistoryDocument[]> {
    const { skip = 0, limit = 100, sort = { timestamp: -1 } } = options || {};

    return this.historyModel
      .find({ collectionName })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Counts the number of history documents by collection name.
   * @param collectionName the name of the collection to search for
   * @returns a promise that resolves to the count of history documents
   */
  async countByCollectionName(collectionName: string): Promise<number> {
    return this.historyModel.countDocuments({ collectionName }).exec();
  }
}
