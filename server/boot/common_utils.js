//no need for callback since it is not used


exports.connectRole = function(app, roleName, user, cb) {
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    RoleMapping.settings.strictObjectIDCoercion = true;

    Role.find({
        where: {
            name: roleName
        }
    }, function(err, role) {
        if (err) return cb(err);
        if (role.length == 0) {
            Role.create({
                name: roleName
            }, function(err, role) {
                if (err) return cb(err);
                console.log('Created role:', role);
                mapRole(RoleMapping, role, user,cb);
            });
        }else if (role.length === 1) {
            mapRole(RoleMapping, role[0], user,cb);
        }
    });
};

function mapRole(RoleMapping, role, user, cb) {
    //check mapping exists first, maybe also look at user id?
    RoleMapping.find({
        where: {
            roleId: role.id
        }
    }, function(err, maps) {
        if(err) return cb(err)
        if(maps.length === 0) {
            role.principals.create({
                principalType: RoleMapping.USER,
                principalId: user.id
            }, function(err, principal) {
                if (err) return cb(err);
                console.log('Assigned user %s to role %s', user.username, role.name);
                cb(null)
            });
        }
    });
}
