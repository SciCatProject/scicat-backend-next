collections = [
  { name: "Dataset", idField: "pid" },
  { name: "Instrument", idField: "pid" },
  { name: "Proposal", idField: "proposalId" },
  { name: "PublishedData", idField: "doi" },
  { name: "Sample", idField: "sampleId" },
];

for (var i = 0; i < collections.length; i++) {
  printjson("Collection: " + collections[i].name);
  collection = db[collections[i].name];
  idField = collections[i].idField;

  collection.find().forEach((document) => {
    if (!document[idField]) {
      printjson("   Migrate _id field to " + idField);
      collection.update(
        { _id: document._id },
        { $set: { [idField]: document._id } },
      );
    }
  });
}

printjson("MIGRATION DONE");
