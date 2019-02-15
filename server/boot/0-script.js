module.exports = function (app) {
    var dataSource = app.datasources.mongo;
    console.log("Datasource host %s, database %s", dataSource.connector.settings.host, dataSource.connector.settings.database)
    dataSource.isActual(function (err, actual) {
        // console.log("Database actual:", actual)
        // if (!actual) {
        dataSource.autoupdate(function (err, result) {
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

    dataSource.connector.connect(function (err, db) {
        // add index to embedded fields, dont wait for result

        var embedFields = ['datasetlifecycle.archivable', 'datasetlifecycle.retrievable', 'datasetlifecycle.publishable',
            'datasetlifecycle.archiveStatusMessage', 'datasetlifecycle.retrieveStatusMessage'
        ]

        embedFields.forEach(function (field) {
            db.collection('Dataset').createIndex({
                field: 1
            }, function (err) {
                if (!err) {
                    console.log("Index on field " + field + " created succesfully")
                } else {
                    console.log(err);
                }
            })
        });

        db.collection('Dataset').createIndex({
            "$**": "text"
        }, function (err) {
            if (!err) {
                console.log("Text Index on dataset created succesfully")
            } else {
                console.log(err);
            }
        });
    });

    // add further information to options parameter
    // see https://loopback.io/doc/en/lb3/Using-current-context.html#use-a-custom-strong-remoting-phase
    // TODO why is this face not executed for remote methods like fullfacet ?

    app.remotes().phases
        .addBefore('invoke', 'options-from-request')
        .use(function (ctx, next) {
            //console.log("============ Phase: args,options", ctx.args, ctx.options)
            if (!ctx.args.options || !ctx.args.options.accessToken) return next();
            const User = app.models.User;
            const UserIdentity = app.models.UserIdentity
            // first check if email in User
            User.findById(ctx.args.options.accessToken.userId, function (err, user) {
                if (err) return next(err);
                // console.log("Found user:", user)
                ctx.args.options.currentUser = user.username;
                // get email from User for functional accounts and from UserIdentity for normal users
                ctx.args.options.currentUserEmail = user.email;
                UserIdentity.findOne({
                    //json filter
                    where: {
                        userId: ctx.args.options.accessToken.userId
                    }
                }, function (err, u) {
                    // add user email and groups
                    var groups = []
                    if (!!u) {
                        if (u.profile) {
                            // console.log("Profile:", u.profile)
                            // if user account update where query to append group groupCondition
                            ctx.args.options.currentUser = u.profile.username
                            ctx.args.options.currentUserEmail = u.profile.email;
                            groups = u.profile.accessGroups
                            // check if a normal user or an internal ROLE
                            if (typeof groups === 'undefined') {
                                groups = []
                            }
                        }
                    } else {
                        // functional accounts are added except the global accounts
                        if (['ingestor', 'archiveManager', 'proposalIngestor'].indexOf(ctx.args.options.currentUser) < 0) {
                            groups.push('func-' + ctx.args.options.currentUser)
                        }
                    }
                    ctx.args.options.currentGroups = groups
                    return next()
                })
            });
        });
};
