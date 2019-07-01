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
                    console.log("Index on field " + field + " created successfully")
                } else {
                    console.log(err);
                }
            })
        });

        db.collection('Dataset').createIndex({
            "$**": "text"
        }, function (err) {
            if (!err) {
                console.log("Text Index on dataset created successfully")
            } else {
                console.log(err);
            }
        });
    });

    // add further information to options parameter
    // see https://loopback.io/doc/en/lb3/Using-current-context.html#use-a-custom-strong-remoting-phase

    app.remotes().phases
        .addBefore('invoke', 'options-from-request')
        .use(function (ctx, next) {
            // console.log("============ Phase: args,options", ctx.args, ctx.options)
            if (!ctx.args.options || !ctx.args.options.accessToken) return next();
            const User = app.models.User;
            const UserIdentity = app.models.UserIdentity
            const RoleMapping = app.models.RoleMapping
            const Role = app.models.Role
            const Sharegroups = app.models.Sharegroups
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
                    if (!!u) {
                        var groups = []
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
                            console.log("gm: do sharegroups groups")
                            const sharegroups = Sharegroups.find({
                                where: {
                                    members: u.profile.email
                                }
                            })
                            if (sharegroups.hasOwnProperty("getGroups")) {
                                if (sharegroups["getGroups"].length > 0) {
                                    for (const group in sharegroups["getGroups"]) {
                                        groups.push(group);
                                    }
                                }
                            }
                        }
                        ctx.args.options.currentGroups = groups
                        return next()
                    } else {
                        // authorizedRoles can not be used for this, since roles depend on the ACLs used in a collection, 
                        // fetch roles via Rolemapping table instead
                        RoleMapping.find({
                            where: {
                                principalId: String(ctx.args.options.accessToken.userId)
                            }
                        }, ctx.args.options, function (err, instances) {
                            // mape roleid to name
                            const roleIdList = instances.map(instance => instance.roleId);
                            Role.find({
                                where: {
                                    id: {
                                        inq: roleIdList
                                    }
                                }
                            }, function (err, result) {
                                if (err) return next(err)
                                const roleNameList = result.map(instance => instance.name);
                                // add beamline specific account name as an additional role for beamline specific data
                                roleNameList.push(user.username)
                                ctx.args.options.currentGroups = roleNameList
                                // console.log("Current groups:",  ctx.args.options.currentGroups)
                                return next()
                            })

                        })

                    }

                })
            });
        });

    // extend built in User model

    const User = app.models.User;

    User.userInfos = function (options, cb) {
        delete options.prohibitHiddenPropertiesInQuery
        delete options.maxDepthOfQuery
        delete options.maxDepthOfData
        cb(null, options);
    };

    User.remoteMethod(
        'userInfos', {
            accepts: [{
                arg: 'options',
                type: 'object',
                http: 'optionsFromRequest'
            }],
            returns: {
                root: true
            },
            description: "Returns username, email , group membership etc for the user linked with the provided accessToken.",
            http: {
                path: "/userInfos",
                verb: "get"
            }
        }
    );


};
