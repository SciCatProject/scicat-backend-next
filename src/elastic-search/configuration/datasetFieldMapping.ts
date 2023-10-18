import { MappingObject } from "../interfaces/mappingInterface.type";

export const datasetMappings: MappingObject = {
  description: {
    type: "text",
    analyzer: "autocomplete",
    search_analyzer: "autocomplete_search",
    fields: {
      keyword: {
        type: "keyword",
        ignore_above: 256,
      },
    },
  },
  datasetName: {
    type: "text",
    analyzer: "autocomplete",
    search_analyzer: "autocomplete_search",
    fields: {
      keyword: {
        type: "keyword",
        ignore_above: 256,
      },
    },
  },
  pid: {
    type: "keyword",
  },
  creationTime: {
    type: "date",
  },
  scientificMetadata: {
    type: "nested",
    dynamic: true,
  },
  history: {
    type: "nested",
    dynamic: false,
  },
  proposalId: {
    type: "keyword",
  },
  sourceFolder: {
    type: "keyword",
  },
  isPublished: {
    type: "boolean",
  },
  type: {
    type: "keyword",
  },
  keywords: {
    type: "keyword",
  },
  creationLocation: {
    type: "keyword",
  },
  ownerGroup: {
    type: "keyword",
  },
  accessGroups: {
    type: "keyword",
  },
  sharedWith: {
    type: "keyword",
  },
};
