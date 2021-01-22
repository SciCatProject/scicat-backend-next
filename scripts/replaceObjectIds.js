names = ["Job", "Policy", "Sample", "UserSetting", "Attachment", "OrigDatablock"]
for (var i = 0; i < names.length; i++) {
    coll = db[names[i]]
    coll.find({
        _id: {
            $type: "objectId"
        }
    }).forEach(function (x) {
        var oldId = x._id;
        x._id = x._id.valueOf(); // convert field to string
        coll.insert(x);
        coll.remove({
            _id: oldId
        });
    });
}
