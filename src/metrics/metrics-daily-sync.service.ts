import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MetricsClass, MetricsDocument } from "./schemas/metrics.schema";
import axios from "axios";
import { MetricsType } from "./interfaces/metrics-type.enum";

@Injectable()
export class MetricsDailySyncService {
  constructor(
    @InjectModel(MetricsClass.name)
    private metricsModel: Model<MetricsDocument>,
  ) {
    this.aggregateMetrics();
  }

  private getEmptyMetricsTemplate(): Record<
    string,
    { public: number; private: number }
  > {
    return {}; // Empty object to start from scratch
  }

  @Cron("*/10 * * * * *") // Runs every 5 seconds
  async aggregateMetrics() {
    console.log("Aggregating metrics...");
    try {
      // Start with a fresh, empty template each time
      const counts = this.getEmptyMetricsTemplate();

      // TODO: MUST: change the URL!!!
      const { data } = await axios.get("http://localhost:3000/api/v3/metrics");

      // Process Prometheus metrics for view, download, and query events
      const viewCounts = this.parseMetric(data, MetricsType.VIEWS);
      const downloadCounts = this.parseMetric(data, MetricsType.DOWNLOADS);
      const queryCounts = this.parseMetric(data, MetricsType.QUERIES);

      // Update counts based on parsed data
      Object.assign(counts, viewCounts, downloadCounts, queryCounts);

      // Aggregate each metric type per dataset and update MongoDB
      await this.updateMetrics("view", viewCounts);
      await this.updateMetrics("download", downloadCounts);
      await this.updateMetrics("query", queryCounts);
    } catch (error) {
      console.error("Failed to aggregate metrics:", error);
    }
  }
  private async updateMetrics(
    eventType: string,
    counts: Record<string, { public: number; private: number }>,
  ) {
    const date = new Date().toISOString().slice(11, 19);

    console.log("===counts", counts);

    for (const [
      datasetId,
      { public: publicCount, private: privateCount },
    ] of Object.entries(counts)) {
      // Create a document with unique identifier as date
      this.createDocument(eventType, date);
    }
  }

  // Parses Prometheus metrics data and returns counts for public and private datasets
  private parseMetric(
    data: string,
    metricName: string,
  ): Record<string, { public: number; private: number }> {
    const lines = data.split("\n");
    const counts: Record<string, { public: number; private: number }> = {};

    for (const line of lines) {
      if (line.startsWith(`${metricName}{`)) {
        const datasetIdMatch = line.match(/datasetPid="([^"]+)"/);
        const isPublished = /isPublished="true"/.test(line);
        const value = parseFloat(line.split(" ")[1]);

        if (datasetIdMatch && !isNaN(value)) {
          const datasetId = datasetIdMatch[1];
          if (!counts[datasetId]) {
            counts[datasetId] = { public: 0, private: 0 };
          }
          if (isPublished) counts[datasetId].public += value;
          else counts[datasetId].private += value;
        }
      }
    }

    return counts;
  }

  private createDocument = async (eventType: string, date: string) => {
    await this.metricsModel.create(
      {
        date,
      },
      {
        $setOnInsert: {
          eventType,
          date,
          publicDataCount: 0, // Start with zero counts initially
          privateDataCount: 0,
          datasetCounts: [], // Start with an empty array for datasetCounts
        },
      },
      {},
    );
  };
}
