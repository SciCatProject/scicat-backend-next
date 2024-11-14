// metrics.service.ts
import { Injectable } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter } from "prom-client";
import { MetricsType } from "./interfaces/metrics-type.enum";

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric(MetricsType.VIEWS)
    private datasetViewsCounter: Counter<string>,
    @InjectMetric(MetricsType.DOWNLOADS)
    private datasetDownloadsCounter: Counter<string>,
    @InjectMetric(MetricsType.QUERIES)
    private datasetQueriesCounter: Counter<string>,
  ) {}

  incrementViewCount(datasetPid: string, isPublished: boolean) {
    this.datasetViewsCounter.inc({
      datasetPid,
      isPublished: String(isPublished),
    });
  }

  incrementDownloadCount(datasetPid: string, isPublished: boolean) {
    this.datasetDownloadsCounter.inc({
      datasetPid,
      isPublished: String(isPublished),
    });
  }

  incrementQueryCount(datasetPid: string, isPublished: boolean) {
    this.datasetQueriesCounter.inc({
      datasetPid,
      isPublished: String(isPublished),
    });
  }
}
