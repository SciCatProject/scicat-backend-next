export default () => ({
  functionalAccounts: [
    {
      username: 'admin',
      email: 'admin@your.site',
      password: 'am2jf70TPNZsSan',
    },
    {
      username: 'ingestor',
      email: 'scicatingestor@your.site',
      password: 'aman',
    },
    {
      username: 'archiveManager',
      email: 'scicatarchivemanager@your.site',
      password: 'aman',
    },
    {
      username: 'proposalIngestor',
      email: 'scicatproposalingestor@your.site',
      password: 'aman',
    },
  ],
  ldap: {
    server: {
      url: 'ldap://ldap.server.com/',
      bindDN: '<USERNAME>',
      bindCredentials: '<PASSWORD>',
      searchBase: '<SEARCH_BASE>',
      searchFilter: '<SEARCH_FILTER>',
    },
  },
  site: '<SITE>',
});
