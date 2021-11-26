export default () => ({
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
      global: true,
    },
    {
      username: "archiveManager",
      email: "scicatarchivemanager@your.site",
      password: "aman",
      role: "archivemanager",
      global: true,
    },
    {
      username: "proposalIngestor",
      email: "scicatproposalingestor@your.site",
      password: "aman",
      role: "proposalingestor",
      global: true,
    },
  ],
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
  metadataKeysReturnLimit: process.env.METADATA_KEYS_RETURN_LIMIT
    ? parseInt(process.env.METADATA_KEYS_RETURN_LIMIT, 10)
    : undefined,
  metadataParentInstancesReturnLimit: process.env
    .METADATA_PARENT_INSTANCES_RETURN_LIMIT
    ? parseInt(process.env.METADATA_PARENT_INSTANCES_RETURN_LIMIT, 10)
    : undefined,
  mongodbUri: process.env.MONGODB_URI,
  port: parseInt(process.env.PORT || "3000", 10),
  site: process.env.SITE,
});
