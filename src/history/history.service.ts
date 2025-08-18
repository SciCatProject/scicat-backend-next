import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose"; // Add FilterQuery import
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
   * Finds history documents using generic query conditions.
   *
   * @param filter any MongoDB query filter conditions
   * @param options optional options for pagination and sorting
   * @returns a promise that resolves to an array of history documents
   */
  async find(
    filter: FilterQuery<GenericHistoryDocument> = {},
    options: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {},
  ): Promise<GenericHistoryDocument[]> {
    const { skip = 0, limit = 100, sort = { timestamp: -1 } } = options;

    return this.historyModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Counts history documents using generic query conditions.
   *
   * @param filter any MongoDB query filter conditions
   * @returns a promise that resolves to the count of matching history documents
   */
  async count(
    filter: FilterQuery<GenericHistoryDocument> = {},
  ): Promise<number> {
    return this.historyModel.countDocuments(filter).exec();
  }

  /**
   * Finds all history documents by collection name.
   *
   * @param subsystem the name of the collection to search for
   * @param options optional options for pagination and sorting
   * @returns a promise that resolves to an array of history documents
   */
  async findBySubsystem(
    subsystem: string,
    options?: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<GenericHistoryDocument[]> {
    // Reuse the generic find method
    return this.find({ subsystem: subsystem }, options);
  }

  /**
   * Counts the number of history documents by collection name.
   * @param collectionName the name of the collection to search for
   * @returns a promise that resolves to the count of history documents
   */
  async countBySubsystem(subsystem: string): Promise<number> {
    // Reuse the generic count method
    return this.count({ subsystem: subsystem });
  }
}
