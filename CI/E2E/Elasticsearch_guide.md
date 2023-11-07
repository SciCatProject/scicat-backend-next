# Getting started

To be able to start application with Elasticsearch you will need to:

1. Start with `npm prepare:local` to executes docker-compose file which pull and run Elasticsearch cluster as a docker container.
2. Start the application with `npm run start`

# Check the .env file

Following environment variables are required to run Elasticsearch with Scicat Backend:

| `Variables`              | Values                 | Description                                                                       |
| ------------------------ | :--------------------- | :-------------------------------------------------------------------------------- |
| `ELASTICSEARCH_ENABLED`  | `yes` or `no`          | enable or disable Elasticsearch                                                   |
| `ES_HOST `               | https://localhost:9200 | Use `http` if `xpack.security.enabled` set to `false`                             |
| `ES_USERNAME` (optional) | elastic                | Can be customized with docker image environment values with `ELASTIC_USERNAME`    |
| `ES_PASSWORD   `         | password               | Can be customized with docker image environment values `ELASTIC_PASSWORD`         |
| `MONGODB_COLLECTION `    | Dataset                | Collection name to be mapped into specified Elasticsearch index                   |
| `ES_MAX_RESULT    `      | 210000                 | Maximum records can be indexed into Elasticsearch. If not set, default is `10000` |
| `ES_FIELDS_LIMIT `       | 400000                 | The total number of fields in an index. If not set, default is `1000`             |
| `ES_INDEX     `          | dataset                | Setting default index for the application                                         |
| `ES_REFRESH  `           | wait_for               | Wait for the change to become visible - CRUD actions                              |
|                          |                        |

## \*\* NOTE \*\*

`ES_REFRESH="wait_for"` is used for better testing flow. For production it should be set to false. Detailed docs about this setting can be found: [docs-refresh](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-refresh.html)

# Steps to synchronize data with Elasitcsearch

To enable search queries in Elasticsearch, you should adhere to the following steps:

1. Open Swagger page `http://localhost:3000/explorer`, Authorize with `admin` token
2. Open elastic-search endpoints and execute `create-index`.
   _**NOTE:**_ This step can be skipped if you want to use default index `dataset`
3. execute `sync-database` to sync data into the given index.

If you see the following response, it means Elasticsearch is ready for use.

```
{
  "total": 21670,
  "failed": 0,
  "retry": 0,
  "successful": 21670,
  "noop": 0,
  "time": 4777,
  "bytes": 279159021,
  "aborted": false
}
```

# Index & analysis settings

Index settings in Elasticsearch are used to define various configurations and behaviors for an index. Index settings are vital for optimizing Elasticsearch's performance, relevance of search results, and resource management, ensuring that the index operates efficiently and effectively according to the specific needs of the application using it.

Pre-defined index settings can be found `/src/elastic-search/configuration/indexSetting.ts`

```
export const defaultElasticSettings = {
  index: {
    max_result_window: process.env.ES_MAX_RESULT || 2000000,
    number_of_replicas: 0,
    mapping: {
      total_fields: {
        limit: process.env.ES_FIELDS_LIMIT || 2000000,
      },
      nested_fields: {
        limit: 1000,
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
```

**More defails can be found**:

- [Detailed Index settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html)

- [Detailed Analysis settings](https://www.elastic.co/guide/en/elasticsearch/reference/8.8/analysis.html)

# Elasticsearch cluster configuration breakdown

_Elasticsearch image configuration can be found in `./CI/E2E/docker-compose-local.yaml`_

```
es01:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.8.2
  ports:
    - 9200:9200
  environment:
    - xpack.security.enabled=false
    - node.name=es01
    - ES_JAVA_OPTS=-Xms2g -Xmx2g
    - cluster.name=es-cluster
    - cluster.initial_master_nodes=es01
    - ELASTIC_PASSWORD=password
    - bootstrap.memory_lock=true
  mem_limit: 4g
  ulimits:
    memlock:
      soft: -1
      hard: -1
```

| `Variables`              | Description                                                                                                                                                                                                                                                                                            |
| ------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `xpack.security.enabled` | _optional for development environment_. If set to true, Elasticsearch will enforce authentication or authorization and can only be accessed with HTTPS                                                                                                                                                 |
| `node.name`              | Name of the Elasticsearch node, each node must have a unique, if multiple ndoe is required the node.name must not be the same.                                                                                                                                                                         |
| `ES_JAVA_OPTS`           | It configures the JVM for Elasticsearch to use a fixed 2 gigabytes of heap memory, optimizing performance and preventing memory allocation issues. If not set the JVM will use default settings which may not be optimized and could lead to less predictable performance or memory management issues. |
| `cluster.name`           | Set the cluster name                                                                                                                                                                                                                                                                                   |
| `ELASTIC_PASSWORD`       | Password for the 'elastic' user (at least 6 characters). Not needed if `xpack.security.enabled=false`                                                                                                                                                                                                  |
| `bootstrap.memory_lock`  | Enables or disables memory locking. When enabled, the JVM will not be allowed to swap memory to disk.                                                                                                                                                                                                  |
| `mem_limit`              | Increase or decrease based on the available host memory, should not be less than sum of ES_JAVA_OPTS                                                                                                                                                                                                   |
| `ulimits.memlock`        | This section is used to override the default ulimits set by Docker for the container. -1 means unlimited                                                                                                                                                                                               |
|                          |                                                                                                                                                                                                                                                                                                        |

**More configuration information:**

- [More complicated examples with docker-compose configuration](https://www.elastic.co/guide/en/elasticsearch/reference/8.8/docker.html)
- [More service configures for production](https://www.elastic.co/guide/en/elasticsearch/reference/8.8/important-settings.html)
