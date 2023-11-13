import {
  AnalysisEdgeNGramTokenizer,
  AnalysisPatternReplaceCharFilter,
  IndicesIndexSettingsAnalysis,
  MappingDynamicTemplate,
} from "@elastic/elasticsearch/lib/api/types";

//Tokenizers
export const autocomplete_tokenizer: AnalysisEdgeNGramTokenizer = {
  type: "edge_ngram",
  min_gram: 2,
  max_gram: 40,
  token_chars: ["letter", "digit", "symbol", "punctuation"],
};

//Filters
export const special_character_filter: AnalysisPatternReplaceCharFilter = {
  pattern: "[^A-Za-z0-9]",
  type: "pattern_replace",
  replacement: "",
};

//Dynamic templates
export const dynamic_template:
  | Record<string, MappingDynamicTemplate>[]
  | never = [
  {
    strings_as_keyword: {
      match_mapping_type: "string",
      path_match: "scientificMetadata.*.value",
      mapping: {
        type: "keyword",
      },
    },
  },
  {
    scientificMetadata_wrong_long_format: {
      path_match: "scientificMetadata.*.value",
      match_mapping_type: "long",
      mapping: {
        type: "date",
        ignore_malformed: true,
      },
    },
  },
  {
    scientificMetadata_wrong_date_format: {
      path_match: "scientificMetadata.*.value",
      match_mapping_type: "date",
      mapping: {
        type: "date",
        ignore_malformed: true,
      },
    },
  },
  {
    scientificMetadata_wrong_text_format: {
      path_match: "scientificMetadata.channel.value",
      match_mapping_type: "long",
      mapping: {
        type: "text",
      },
    },
  },
];

//Index Settings
export const defaultElasticSettings = {
  index: {
    max_result_window: process.env.ES_MAX_RESULT || 2000000,
    number_of_replicas: 0,
    mapping: {
      total_fields: {
        limit: process.env.ES_FIELDS_LIMIT || 2000000,
      },
    },
  },
  analysis: {
    analyzer: {
      autocomplete: {
        tokenizer: "autocomplete",
        filter: ["lowercase"],
      },
      autocomplete_search: {
        tokenizer: "lowercase",
      },
    },
    tokenizer: {
      autocomplete: autocomplete_tokenizer,
    },
  },
} as IndicesIndexSettingsAnalysis;
