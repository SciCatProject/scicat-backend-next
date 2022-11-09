export default () => ({
  doiPrefix: process.env.DOI_PREFIX,
  expressSessionSecret: process.env.EXPRESS_SESSION_SECRET,
  functionalAccounts: [
    {
      username: "admin",
      email: "admin@your.site",
      password: "am2jf70TPNZsSan",
      role: "admin",
      global: true,
    },
    {
      username: "ingestor",
      email: "scicatingestor@your.site",
      password: "aman",
      role: "ingestor",
      global: false,
    },
    {
      username: "archiveManager",
      email: "scicatarchivemanager@your.site",
      password: "aman",
      role: "archivemanager",
      global: false,
    },
    {
      username: "proposalIngestor",
      email: "scicatproposalingestor@your.site",
      password: "aman",
      role: "proposalingestor",
      global: false,
    },
  ],
  httpMaxRedirects: process.env.HTTP_MAX_REDIRECTS ?? 5,
  httpTimeOut: process.env.HTTP_TIMEOUT ?? 5000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? "3600", 10),
  },
  ldap: {
    server: {
      url: process.env.LDAP_URL,
      bindDN: process.env.LDAP_BIND_DN,
      bindCredentials: process.env.LDAP_BIND_CREDENTIALS,
      searchBase: process.env.LDAP_SEARCH_BASE,
      searchFilter: process.env.LDAP_SEARCH_FILTER,
    },
  },
  logbook: {
    enabled:
      process.env.LOGBOOK_ENABLED && process.env.LOGBOOK_ENABLED === "yes"
        ? true
        : false,
    baseUrl: process.env.LOGBOOK_BASE_URL ?? "http://localhost:3030/scichatapi",
    username: process.env.LOGBOOK_USERNAME,
    password: process.env.LOGBOOK_PASSWORD,
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
  registerDoiUri: process.env.REGISTER_DOI_URI,
  registerMetadataUri: process.env.REGISTER_METADATA_URI,
  site: process.env.SITE,
  smtp: {
    host: process.env.SMTP_HOST,
    messageFrom: process.env.SMTP_MESSAGE_FROM,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
  },
});
