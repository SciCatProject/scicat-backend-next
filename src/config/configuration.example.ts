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
  ldap: {
    server: {
      url: "ldap://ldap.server.com/",
      bindDN: "<USERNAME>",
      bindCredentials: "<PASSWORD>",
      searchBase: "<SEARCH_BASE>",
      searchFilter: "<SEARCH_FILTER>",
    },
  },
  metadataKeysReturnLimit: 100,
  metadataParentInstancesReturnLimit: 100,
  site: "<SITE>",
  jwtSecret: "ThisIsASecretThatShouldBeChanged",
  jwtExpireTime: "1h",
});
