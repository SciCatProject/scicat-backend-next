import {
  AnalysisEdgeNGramTokenizer,
  AnalysisPatternReplaceCharFilter,
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
export const dynamic_template = [
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
] as Record<string, MappingDynamicTemplate>[] | never;
