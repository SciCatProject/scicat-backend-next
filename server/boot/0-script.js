module.exports = function(app) {
    var dataSource = app.datasources.mongo;
    console.log("Datasource host %s, database %s", dataSource.connector.settings.host, dataSource.connector.settings.database)
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

    var loopback = require('loopback');
    var DataModel = loopback.PersistedModel;

    console.log("Adding ACLS for UserIdentity")

    DataModel.extend('UserIdentity', null, {
        acls: [{
                principalType: 'ROLE',
                principalId: '$everyone',
                permission: 'DENY'
            },
            {
                accessType: 'READ',
                principalType: 'ROLE',
                principalId: '$authenticated',
                permission: 'ALLOW'
            }
        ]
    });
};
