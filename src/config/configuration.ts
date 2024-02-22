import { Logger } from "@nestjs/common";
import * as fs from "fs";
import { merge } from "lodash";
import localconfiguration from "./localconfiguration";
import { boolean } from "mathjs";

const configuration = () => {
  const accessGroupsStaticValues =
    process.env.ACCESS_GROUPS_STATIC_VALUES || ("" as string);
  const adminGroups = process.env.ADMIN_GROUPS || ("" as string);
  const deleteGroups = process.env.DELETE_GROUPS || ("" as string);
  const createDatasetGroups =
    process.env.CREATE_DATASET_GROUPS || ("#all" as string);
  const createDatasetWithPidGroups =
    process.env.CREATE_DATASET_WITH_PID_GROUPS || ("" as string);
  const createDatasetPrivilegedGroups =
    process.env.CREATE_DATASET_PRIVILEGED_GROUPS || ("" as string);
  const datasetCreationValidationEnabled =
    process.env.DATASET_CREATION_VALIDATION_ENABLED || false;
  const datasetCreationValidationRegex =
    process.env.DATASET_CREATION_VALIDATION_REGEX || ("" as string);

  const createJobGroups = process.env.CREATE_JOB_GROUPS || ("" as string);
  const updateJobGroups = process.env.UPDATE_JOB_GROUPS || ("" as string);

  const proposalGroups = process.env.PROPOSAL_GROUPS || ("" as string);
  const sampleGroups = process.env.SAMPLE_GROUPS || ("" as string);

  const oidcUserQueryFilter =
    process.env.OIDC_USERQUERY_FILTER || ("" as string);

  const oidcUsernameFieldMapping =
    process.env.OIDC_USERINFO_MAPPING_FIELD_USERNAME || ("" as string);

  const defaultLogger = {
    type: "DefaultLogger",
    modulePath: "./loggingProviders/defaultLogger",
    config: {},
  };
  const jsonConfigMap: { [key: string]: object[] | boolean } = {};
  const jsonConfigFileList: { [key: string]: string } = {
    loggers: process.env.LOGGERS_CONFIG_FILE || "loggers.json",
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

  // Logger.log("Config SETUP");
  // Logger.log("- Access groups statisc values : " + accessGroupsStaticValues);
  // Logger.log("- Admin groups : " + adminGroups);
  // Logger.log("- Delete groups : " + deleteGroups );
  // Logger.log("- Create dataset groups : " + createDatasetGroups);
  // Logger.log(
  //   "- Create dataset with pid groups : " + createDatasetWithPidGroups,
  // );
  // Logger.log(
  //   "- Create dataset privileged groups : " + createDatasetPrivilegedGroups,
  // );
  // Logger.log("- Create job groups : " + createJobGroups);
  // Logger.log("- Update job groups : " + updateJobGroups);

  const config = {
    loggerConfigs: jsonConfigMap.loggers || [defaultLogger],
    adminGroups: adminGroups.split(",").map((v) => v.trim()) ?? [],
    deleteGroups: deleteGroups.split(",").map((v) => v.trim()) ?? [],
    createDatasetGroups: createDatasetGroups.split(",").map((v) => v.trim()),
    createDatasetWithPidGroups: createDatasetWithPidGroups
      .split(",")
      .map((v) => v.trim()),
    createDatasetPrivilegedGroups: createDatasetPrivilegedGroups
      .split(",")
      .map((v) => v.trim()),
    proposalGroups: proposalGroups.split(",").map((v) => v.trim()),
    sampleGroups: sampleGroups.split(",").map((v) => v.trim()),
    datasetCreationValidationEnabled: datasetCreationValidationEnabled,
    datasetCreationValidationRegex: datasetCreationValidationRegex,
    createJobGroups: createJobGroups,
    updateJobGroups: updateJobGroups,
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
      successURL: process.env.OIDC_SUCCESS_URL, // Example: http://localhost:3000/explorer
      accessGroups: process.env.OIDC_ACCESS_GROUPS, // Example: None
      accessGroupProperty: process.env.OIDC_ACCESS_GROUPS_PROPERTY, // Example: groups
      autoLogout: process.env.OIDC_AUTO_LOGOUT || false,
      returnURL: process.env.OIDC_RETURN_URL,
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

    registerDoiUri: process.env.REGISTER_DOI_URI,
    registerMetadataUri: process.env.REGISTER_METADATA_URI,
    doiUsername: process.env.DOI_USERNAME,
    doiPassword: process.env.DOI_PASSWORD,
    site: process.env.SITE,
    smtp: {
      host: process.env.SMTP_HOST,
      messageFrom: process.env.SMTP_MESSAGE_FROM,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
    },
    policyTimes: {
      policyPublicationShiftInYears: process.env.POLICY_PUBLICATION_SHIFT ?? 3,
      policyRetentionShiftInYears: process.env.POLICY_RETENTION_SHIFT ?? -1,
    },
  };
  return merge(config, localconfiguration);
};

export type OidcConfig = ReturnType<typeof configuration>["oidc"];

export default configuration;
