import * as fs from "fs";
import { merge } from "lodash";
import localconfiguration from "./localconfiguration";
import { boolean } from "mathjs";
import { DEFAULT_PROPOSAL_TYPE } from "src/proposals/schemas/proposal.schema";
import { DatasetType } from "src/datasets/types/dataset-type.enum";

const configuration = () => {
  const accessGroupsStaticValues =
    process.env.ACCESS_GROUPS_STATIC_VALUES || "";
  const adminGroups = process.env.ADMIN_GROUPS || "";
  const deleteGroups = process.env.DELETE_GROUPS || "";
  const createDatasetGroups = process.env.CREATE_DATASET_GROUPS || "#all";
  const createDatasetWithPidGroups =
    process.env.CREATE_DATASET_WITH_PID_GROUPS || "";
  const createDatasetPrivilegedGroups =
    process.env.CREATE_DATASET_PRIVILEGED_GROUPS || "";
  const datasetCreationValidationEnabled =
    process.env.DATASET_CREATION_VALIDATION_ENABLED || false;
  const datasetCreationValidationRegex =
    process.env.DATASET_CREATION_VALIDATION_REGEX || "";

  const createJobGroups = process.env.CREATE_JOB_GROUPS || "";
  const updateJobGroups = process.env.UPDATE_JOB_GROUPS || "";
  const deleteJobGroups = process.env.DELETE_JOB_GROUPS || "";

  const proposalGroups = process.env.PROPOSAL_GROUPS || "";
  const sampleGroups = process.env.SAMPLE_GROUPS || "#all";
  const samplePrivilegedGroups =
    process.env.SAMPLE_PRIVILEGED_GROUPS || ("" as string);
  const attachmentGroups = process.env.ATTACHMENT_GROUPS || "#all";
  const attachmentPrivilegedGroups =
    process.env.ATTACHMENT_PRIVILEGED_GROUPS || ("" as string);

  const oidcUserQueryFilter = process.env.OIDC_USERQUERY_FILTER || "";

  const oidcUsernameFieldMapping =
    process.env.OIDC_USERINFO_MAPPING_FIELD_USERNAME || "";

  const jobConfigurationFile = process.env.JOB_CONFIGURATION_FILE || "";

  const defaultLogger = {
    type: "DefaultLogger",
    modulePath: "./loggingProviders/defaultLogger",
    config: {},
  };
  const jsonConfigMap: { [key: string]: object | object[] | boolean } = {
    datasetTypes: {},
    proposalTypes: {},
  };
  const jsonConfigFileList: { [key: string]: string } = {
    loggers: process.env.LOGGERS_CONFIG_FILE || "loggers.json",
    datasetTypes: process.env.DATASET_TYPES_FILE || "datasetTypes.json",
    proposalTypes: process.env.PROPOSAL_TYPES_FILE || "proposalTypes.json",
    metricsConfig: process.env.METRICS_CONFIG_FILE || "metricsConfig.json",
  };
  Object.keys(jsonConfigFileList).forEach((key) => {
    const filePath = jsonConfigFileList[key];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      try {
        jsonConfigMap[key] = JSON.parse(data);
      } catch (error) {
        console.error(
          "Error json config file parsing " + filePath + " : " + error,
        );
        jsonConfigMap[key] = false;
      }
    }
  });

  // NOTE: Add the default dataset types here
  Object.assign(jsonConfigMap.datasetTypes, {
    Raw: DatasetType.Raw,
    Derived: DatasetType.Derived,
  });
  // NOTE: Add the default proposal type here
  Object.assign(jsonConfigMap.proposalTypes, {
    DefaultProposal: DEFAULT_PROPOSAL_TYPE,
  });

  const oidcFrontendClients = (() => {
    const clients = ["scicat"];
    if (process.env.OIDC_FRONTEND_CLIENTS) {
      clients.push(
        ...process.env.OIDC_FRONTEND_CLIENTS.split(",").map((e) => e.trim()),
      );
    }
    return [...new Set(clients)]; // dedupe in case "scicat" was already included
  })();

  const clientConfig = oidcFrontendClients.reduce(
    (config, client) => {
      const isDefault = client === "scicat";
      if (isDefault) {
        const successURL = process.env.OIDC_SUCCESS_URL;
        if (
          successURL &&
          !(
            new URL(successURL).pathname === "/login" ||
            new URL(successURL).pathname == "/auth-callback"
          )
        ) {
          throw new Error(
            `OIDC_SUCCESS_URL must be <frontend-base-url>/login or <frontend-base-url>/auth-callback for the default client scicat but found ${successURL}`,
          );
        }
        config[client] = {
          successURL: process.env.OIDC_SUCCESS_URL,
          returnURL: process.env.OIDC_RETURN_URL,
        };
        return config;
      }
      if (!process.env[`OIDC_${client.toUpperCase()}_SUCCESS_URL`]) {
        throw new Error(
          `Frontend client ${client} is defined in OIDC_FRONTEND_CLIENTS but OIDC_${client.toUpperCase()}_SUCCESS_URL is unset`,
        );
      }
      if (!process.env[`OIDC_${client.toUpperCase()}_RETURN_URL`]) {
        console.warn(
          `OIDC_${client.toUpperCase()}_RETURN_URL is unset. Will default to /datasets or dynamically provided returnURL in /oidc`,
        );
      }
      config[client] = {
        successURL: process.env[`OIDC_${client.toUpperCase()}_SUCCESS_URL`],
        returnURL: process.env[`OIDC_${client.toUpperCase()}_RETURN_URL`],
      };
      return config;
    },
    {} as Record<
      string,
      { successURL: string | undefined; returnURL: string | undefined }
    >,
  );

  const config = {
    maxFileUploadSizeInMb: process.env.MAX_FILE_UPLOAD_SIZE || "16mb", // 16MB by default
    versions: {
      api: "3",
    },
    swaggerPath: process.env.SWAGGER_PATH || "explorer",
    jobConfigurationFile: jobConfigurationFile,
    loggerConfigs: jsonConfigMap.loggers || [defaultLogger],
    accessGroups: {
      admin: adminGroups.split(",").map((v) => v.trim()) ?? [],
      delete: deleteGroups.split(",").map((v) => v.trim()) ?? [],
      createDataset: createDatasetGroups.split(",").map((v) => v.trim()),
      createDatasetWithPid: createDatasetWithPidGroups
        .split(",")
        .map((v) => v.trim()),
      createDatasetPrivileged: createDatasetPrivilegedGroups
        .split(",")
        .map((v) => v.trim()),
      proposal: proposalGroups.split(",").map((v) => v.trim()),
      sample: sampleGroups.split(",").map((v) => v.trim()),
      samplePrivileged: samplePrivilegedGroups.split(",").map((v) => v.trim()),
      attachment: attachmentGroups.split(",").map((v) => v.trim()),
      attachmentPrivileged: attachmentPrivilegedGroups
        .split(",")
        .map((v) => v.trim()),
      createJob: createJobGroups,
      updateJob: updateJobGroups,
      deleteJob: deleteJobGroups,
    },
    datasetCreationValidationEnabled: boolean(datasetCreationValidationEnabled),
    datasetCreationValidationRegex: datasetCreationValidationRegex,
    logoutURL: process.env.LOGOUT_URL ?? "", // Example: http://localhost:3000/
    accessGroupsGraphQlConfig: {
      enabled: boolean(process.env?.ACCESS_GROUPS_GRAPHQL_ENABLED || false),
      token: process.env.ACCESS_GROUP_SERVICE_TOKEN,
      apiUrl: process.env.ACCESS_GROUP_SERVICE_API_URL,
      responseProcessorSrc: process.env.ACCESS_GROUP_SERVICE_HANDLER, // ts import defining the resposne processor and query
    },
    accessGroupsStaticConfig: {
      enabled: boolean(process.env?.ACCESS_GROUPS_STATIC_ENABLED || true),
      value: accessGroupsStaticValues.split(",").map((v) => v.trim()) ?? [],
    },
    accessGroupsOIDCPayloadConfig: {
      enabled: boolean(process.env?.ACCESS_GROUPS_OIDCPAYLOAD_ENABLED || false),
      accessGroupProperty: process.env?.OIDC_ACCESS_GROUPS_PROPERTY, // Example: groups
    },
    doiPrefix: process.env.DOI_PREFIX,
    expressSessionSecret: process.env.EXPRESS_SESSION_SECRET,
    functionalAccounts: [],
    httpMaxRedirects: process.env.HTTP_MAX_REDIRECTS ?? 5,
    httpTimeOut: process.env.HTTP_TIMEOUT ?? 5000,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? "3600", 10),
      neverExpires: process.env.JWT_NEVER_EXPIRES ?? "100y",
    },
    ldap: {
      server: {
        url: process.env.LDAP_URL,
        bindDN: process.env.LDAP_BIND_DN,
        bindCredentials: process.env.LDAP_BIND_CREDENTIALS,
        searchBase: process.env.LDAP_SEARCH_BASE,
        searchFilter: process.env.LDAP_SEARCH_FILTER,
        Mode: process.env.LDAP_MODE ?? "ad",
        externalIdAttr: process.env.LDAP_EXTERNAL_ID ?? "sAMAccountName",
        usernameAttr: process.env.LDAP_USERNAME ?? "displayName",
      },
    },
    oidc: {
      issuer: process.env.OIDC_ISSUER, // Example: https://identity.esss.dk/realm/ess
      clientID: process.env.OIDC_CLIENT_ID, // Example: scicat
      clientSecret: process.env.OIDC_CLIENT_SECRET, // Example: Aa1JIw3kv3mQlGFWrE3gOdkH6xreAwro
      callbackURL: process.env.OIDC_CALLBACK_URL, // Example: http://localhost:3000/api/v3/oidc/callback
      scope: process.env.OIDC_SCOPE, // Example: "openid profile email"
      accessGroups: process.env.OIDC_ACCESS_GROUPS, // Example: None
      accessGroupProperty: process.env.OIDC_ACCESS_GROUPS_PROPERTY, // Example: groups
      autoLogout: process.env.OIDC_AUTO_LOGOUT || false,
      frontendClients: oidcFrontendClients,
      clientConfig: clientConfig,
      userInfoMapping: {
        id: process.env.OIDC_USERINFO_MAPPING_FIELD_ID,
        username:
          oidcUsernameFieldMapping.split(",").map((v) => v.trim()) ?? [], // Example: "iss, username"
        displayName: process.env.OIDC_USERINFO_MAPPING_FIELD_DISPLAYNAME,
        familyName: process.env.OIDC_USERINFO_MAPPING_FIELD_FAMILYNAME,
        emails: process.env.OIDC_USERINFO_MAPPING_FIELD_EMAILS,
        email: process.env.OIDC_USERINFO_MAPPING_FIELD_EMAIL,
        thumbnailPhoto: process.env.OIDC_USERINFO_MAPPING_FIELD_THUMBNAILPHOTO,
        groups: process.env.OIDC_USERINFO_MAPPING_FIELD_GROUP, // Example: groups
        provider: process.env.OIDC_USERINFO_MAPPING_FIELD_PROVIDER,
      },
      userQuery: {
        operator: process.env.OIDC_USERQUERY_OPERATOR || "or", // Example: "or" or "and"
        filter: oidcUserQueryFilter.split(",").map((v) => v.trim()) ?? [], // Example: "username:username, email:email"
      },
    },
    logbook: {
      enabled:
        process.env.LOGBOOK_ENABLED && process.env.LOGBOOK_ENABLED === "yes"
          ? true
          : false,
      baseUrl:
        process.env.LOGBOOK_BASE_URL ?? "http://localhost:3030/scichatapi",
    },
    metadataKeysReturnLimit: process.env.METADATA_KEYS_RETURN_LIMIT
      ? parseInt(process.env.METADATA_KEYS_RETURN_LIMIT, 10)
      : undefined,
    metadataParentInstancesReturnLimit: process.env
      .METADATA_PARENT_INSTANCES_RETURN_LIMIT
      ? parseInt(process.env.METADATA_PARENT_INSTANCES_RETURN_LIMIT, 10)
      : undefined,
    mongodbUri: process.env.MONGODB_URI,
    oaiProviderRoute: process.env.OAI_PROVIDER_ROUTE,
    pidPrefix: process.env.PID_PREFIX,
    port: parseInt(process.env.PORT || "3000", 10),
    publicURLprefix: process.env.PUBLIC_URL_PREFIX,
    rabbitMq: {
      enabled: process.env.RABBITMQ_ENABLED ?? "no",
      hostname: process.env.RABBITMQ_HOSTNAME,
      port: process.env.RABBITMQ_PORT,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    },
    elasticSearch: {
      enabled: process.env.ELASTICSEARCH_ENABLED ?? "no",
      username: process.env.ES_USERNAME,
      password: process.env.ES_PASSWORD,
      host: process.env.ES_HOST,
      refresh: process.env.ES_REFRESH,
      maxResultWindow: parseInt(process.env.ES_MAX_RESULT || "100000", 10),
      fieldsLimit: parseInt(process.env.ES_FIELDS_LIMIT || "100000", 10),
      mongoDBCollection: process.env.MONGODB_COLLECTION,
      defaultIndex: process.env.ES_INDEX ?? "dataset",
    },
    metrics: {
      // Note: `process.env.METRICS_ENABLED` is directly used for conditional module loading in
      // `ConditionalModule.registerWhen` as it does not support ConfigService injection. The purpose of
      // keeping `metrics.enabled` in the configuration is for other modules to use and maintain consistency.
      enabled: process.env.METRICS_ENABLED || "no",
      config: jsonConfigMap.metricsConfig || {},
    },
    registerDoiUri: process.env.REGISTER_DOI_URI,
    registerMetadataUri: process.env.REGISTER_METADATA_URI,
    doiUsername: process.env.DOI_USERNAME,
    doiPassword: process.env.DOI_PASSWORD,
    site: process.env.SITE,
    email: {
      type: process.env.EMAIL_TYPE || "smtp",
      from: process.env.EMAIL_FROM || process.env.SMTP_MESSAGE_FROM,
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env?.SMTP_SECURE || "no",
      },
      ms365: {
        tenantId: process.env.MS365_TENANT_ID,
        clientId: process.env.MS365_CLIENT_ID,
        clientSecret: process.env.MS365_CLIENT_SECRET,
      },
    },
    policyTimes: {
      policyPublicationShiftInYears: process.env.POLICY_PUBLICATION_SHIFT ?? 3,
      policyRetentionShiftInYears: process.env.POLICY_RETENTION_SHIFT ?? -1,
    },
    datasetTypes: jsonConfigMap.datasetTypes,
    proposalTypes: jsonConfigMap.proposalTypes,
  };
  return merge(config, localconfiguration);
};

export type OidcConfig = ReturnType<typeof configuration>["oidc"];
export type AccessGroupsType = ReturnType<typeof configuration>["accessGroups"];

export default configuration;
