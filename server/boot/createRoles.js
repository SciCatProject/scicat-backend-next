var utils = require('./common_utils');
var fs = require('fs');

module.exports = function(app, cb) {

    // define roles
    //  note: role names are all lowercase , corresponding accounts camelcase
    //


    createRole = function(account, cb) {

        var User = app.models.User;

        User.find({
            where: {
                username: account
            }
        }, function(err, users) {
            if (err) {
                return cb(err);
            } else if (users.length === 0) {
                // check for password file for this role
                path = 'server/' + account;
                console.log("creating account " + account);
                if (fs.existsSync(path)) {
                    var data = fs.readFileSync(path, 'utf8').split('\n')[0].split(" ");
                    User.create({
                        realm: 'localhost:3001',
                        username: account,
                        password: data[0],
                        email: data[1],
                        emailVerified: true
                    }, function(err, user) {
                        if (err) {
                            console.log("User create:" + err + " " + user)
                            return cb(err)
                        } else {
                            utils.connectRole(app, account.toLowerCase(), user, cb);
                        }
                    });
                } else {
                    User.create({
                        realm: 'localhost:3001',
                        username: account,
                        password: 'aman',
                        email: account + '@change.com',
                        emailVerified: true
                    }, function(err, user) {
                        if (err) {
                            console.log("User create:" + err + " " + user)
                            return cb(err)
                        } else {
                            utils.connectRole(app, account.toLowerCase(), user, cb);
                        }
                    });
                }
            } else {
                console.log('Found ' + account + ' user:', users[0].username);
                //create the role if not yet there
                utils.connectRole(app, account.toLowerCase(), users[0], cb);
            }
        });
    };

    createRole('admin', function() {
        createRole('archiveManager', function() {
            createRole('ingestor', function() {
                createRole('proposalIngestor', function() {
                    createRole('userGroupIngestor', cb)
                })
            })
        })
    })
}
