var nodemailer = require('nodemailer');

module.exports = function(app) {
  var dataSource = app.datasources.mongo;
  console.log("Datasource host %s, database %s",
              dataSource.connector.settings.host,
              dataSource.connector.settings.database)

  dataSource.isActual(function(err, actual) {
    // console.log("Database actual:", actual)
    // if (!actual) {
    dataSource.autoupdate(function(err, result) {
      if (err) {
        console.log("Database Autoupdate error: %s", err)
      } else {
        console.log("Database Autoupdate result: %s", result)
      }
    });
    //}
  });
};
