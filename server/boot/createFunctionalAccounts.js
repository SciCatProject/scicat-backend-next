var fs = require("fs");

/* create functional accounts and their roles
    note: role names are all lowercase , corresponding accounts camelcase
  */

module.exports = function (app, next) {
  var User = app.models.User;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  RoleMapping.settings.strictObjectIDCoercion = true;

  function addAccounts(accounts, index, next) {
    if (index < 0) {
      return next();
    } else {
      // do the real action
      // find or create account
      var user = accounts[index].account;
      var data = {
        realm: "localhost",
        username: user,
        password: accounts[index].password,
        email: accounts[index].email,
        emailVerified: true
      };

      // create User if not yet there
      var filter = {
        where: {
          username: user
        }
      };
      User.findOrCreate(filter, data, function (err, userinstance, created) {
        if (err) {
          console.log("Error when creating User:" + err + " " + user);
          return next(err);
        } else {
          if (created) {
            console.log("New account created:", user);
          } else {
            console.log("Account already exists:", user);
          }
          // and create role
          var role = accounts[index].role;
          var datarole = {
            name: role
          };
          var filterrole = {
            where: {
              name: role
            }
          };
          Role.findOrCreate(filterrole, datarole, function (err, roleinstance, created) {
            if (err) {
              console.log("Error when creating role:" + err + " " + role);
              return next(err);
            } else {
              if (created) {
                console.log("New role created:", role);
              } else {
                console.log("Role already exists:", role);
              }
              // and mapping
              //check mapping exists first, maybe also look at user id?

              var filtermapping = {
                where: {
                  roleId: roleinstance.id,
                  principalId: String(userinstance.id)
                }
              };
              var datamapping = {
                principalType: RoleMapping.USER,
                principalId: userinstance.id,
                roleId: roleinstance.id
              };
              RoleMapping.findOrCreate(filtermapping, datamapping, function (err, mapinstance, created) {
                if (err) {
                  console.log("Error when finding Rolemapping:" + err + " " + roleinstance.id, userinstance.id);
                  return next(err);
                }
                if (created) {
                  console.log("New rolemapping created:", user, role);
                } else {
                  console.log("Rolemapping already exists:", user, role);
                }
                if (accounts[index].global == true) {
                  // and create role
                  role = "globalaccess";
                  var datarole = {
                    name: role
                  };
                  var filterrole = {
                    where: {
                      name: role
                    }
                  };
                  // add global role and mapping
                  Role.findOrCreate(filterrole, datarole, function (err, roleinstance, created) {
                    if (err) {
                      console.log("Error when creating role:" + err + " " + role);
                      return next(err);
                    } else {
                      if (created) {
                        console.log("New role created:", role);
                      } else {
                        console.log("Role already exists:", role);
                      }
                      // and mapping
                      //check mapping exists first, maybe also look at user id?

                      var filtermapping = {
                        where: {
                          roleId: roleinstance.id,
                          principalId: String(userinstance.id)
                        }
                      };
                      var datamapping = {
                        principalType: RoleMapping.USER,
                        principalId: userinstance.id,
                        roleId: roleinstance.id
                      };
                      RoleMapping.findOrCreate(filtermapping, datamapping, function (err, mapinstance, created) {
                        if (err) {
                          console.log("Error when finding Rolemapping:" + err + " " + roleinstance.id, userinstance.id);
                          return next(err);
                        }
                        if (created) {
                          console.log("New rolemapping created:", user, role);
                        } else {
                          console.log("Rolemapping already exists:", user, role);
                        }
                        // now treat the next user
                        index--;
                        addAccounts(accounts, index, next);
                      });
                    }
                  });
                } else {
                  // now treat the next user
                  index--;
                  addAccounts(accounts, index, next);
                }

              });
            }
          });
        }
      });
    }
  }

  path = "server/functionalAccounts.json";
  var accounts = [];
  if (fs.existsSync(path)) {
    var contents = fs.readFileSync(path, "utf8");
    // Define to JSON type
    accounts = JSON.parse(contents);
  } else {
    accounts = [{
      "account": "admin",
      "password": "2jf70TPNZsS",
      "email": "scicatadmin@your.site",
      "role": "admin",
      "global": true
    }, {
      "account": "ingestor",
      "password": "aman",
      "email": "scicatingestor@your.site",
      "role": "ingestor",
      "global": true
    }, {
      "account": "archiveManager",
      "password": "aman",
      "email": "scicatarchivemanager@your.site",
      "role": "archivemanager",
      "global": true
    }, {
      "account": "proposalIngestor",
      "password": "aman",
      "email": "scicatproposalingestor@your.site",
      "role": "proposalingestor",
      "global": true
    }];
  }
  var index = accounts.length - 1;
  addAccounts(accounts, index, next);
};
