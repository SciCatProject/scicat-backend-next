/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@elastic/elasticsearch";
import { Logger } from "@nestjs/common";

interface MappingProperty {
  type:
    | "text"
    | "keyword"
    | "long"
    | "integer"
    | "date"
    | "boolean"
    | "object"
    | "nested";
  [key: string]: string | boolean;
}

interface MappingObject {
  [key: string]: MappingProperty;
}

export const datasetMappings: MappingObject = {
  description: {
    type: "text",
  },
  datasetName: {
    type: "text",
  },
  scientificMetadata: {
    type: "nested",
    dynamic: true,
  },
};

const defaultElasticSettings = {
  index: {
    number_of_replicas: 0,
  },
};

export class ElasticsearchService {
  private esClient: Client;
  esUsername = process.env.ES_USERNAME;
  esPassword = process.env.ES_PASSWORD;
  kibanaPassword = process.env.KIBANA_PASSWORD;
  esSearchIndex = process.env.SEARCH_INDEX;
  esUri = process.env.ES_URI;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
    console.log(
      "============================================================================2",
    );
  }

  async connect() {
    console.log(
      "============================================================================ connecct",
    );
    this.esUsername = process.env.ES_USERNAME;
    this.esPassword = process.env.ES_PASSWORD;
    this.kibanaPassword = process.env.KIBANA_PASSWORD;
    this.esSearchIndex = process.env.SEARCH_INDEX;
    this.esUri = process.env.ES_URI;

    if (
      !this.esUsername ||
      !this.esPassword ||
      !this.kibanaPassword ||
      !this.esSearchIndex ||
      !this.esUri
    ) {
      Logger.error(
        "Elastic search enabled but missing one or more config variables",
      );
      return;
    }

    try {
      this.esClient = new Client({
        node: this.esUri,
        auth: {
          username: this.esUsername,
          password: this.esPassword,
        },
        tls: {
          rejectUnauthorized: false, // TODO: use CA: [fs.readFileSync('CA.xxx')]
        },
      });
      console.log("=======connected?");

      this.runElasticSearch(this.esSearchIndex);
    } catch (err) {
      throw new Error("Elastic search connection failed");
    }
  }
  async runElasticSearch(index: string) {
    const indexFound = await this.esClient.indices.exists({ index });

    if (!indexFound) {
      this.create(index);
      this.close(index);
      this.putSettings(index);
      this.putMappings(index);
      this.open(index);
    }
  }

  async create(index: string, settings = defaultElasticSettings) {
    await this.esClient.indices.create({
      index,
      body: { settings },
    });
  }

  async putSettings(index: string, settings = defaultElasticSettings) {
    await this.esClient.indices.putSettings({
      index,
      body: { settings },
    });
  }

  async putMappings(index: string, properties = datasetMappings) {
    await this.esClient.indices.putMapping({
      index,
      dynamic: false,
      body: { properties },
    });
  }

  async open(index: string) {
    await this.esClient.indices.open({
      index,
    });
  }

  async close(index: string) {
    await this.esClient.indices.close({
      index,
    });
  }
}
