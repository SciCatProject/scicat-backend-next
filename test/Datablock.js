"use strict";
const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

var accessTokenAdminIngestor = null;
var accessTokenArchiveManager = null;
var datablockId = null;
var datasetId = null;
var datablockId2 = null;
var ownerGroup = null;

describe("Datablocks", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Datablock").deleteMany({});
  });
  beforeEach(async () => {
    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });

    accessTokenArchiveManager = await utils.getToken(appUrl, {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
    });
  });

  it("0010: adds a datablock to an existing dataset", async () => {
    await request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.be.string;
        datasetId = res.body["pid"];
        ownerGroup = res.body["ownerGroup"];
      });

    return request(appUrl)
      .post(`/api/v3/datablocks`)
      .send({ ...TestData.DataBlockCorrect, datasetId, ownerGroup })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.DataBlockCorrect.size);
        res.body.should.have.property("id").and.be.string;
        datablockId = res.body["id"];
      });
  });

  it("0020: adds the same datablock again which should fail because it is already stored", async () => {
    return request(appUrl)
      .post(`/api/v3/datablocks`)
      .send({ ...TestData.DataBlockCorrect, datasetId, ownerGroup })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("0030: adds a new datablock which should fail because wrong functional account", async () => {
    return request(appUrl)
      .post(`/api/v3/datablocks`)
      .send({
        ...TestData.DataBlockCorrect,
        archiveId: "New archive Id",
        datasetId,
        ownerGroup,
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("0040: adds a second datablock for same dataset", async () => {
    return request(appUrl)
      .post(`/api/v3/datablocks`)
      .send({
        ...TestData.DataBlockCorrect,
        archiveId: "New archive Id",
        datasetId,
        ownerGroup,
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("size");
        res.body.should.have.property("id").and.be.string;
        datablockId2 = res.body["id"];
      });
  });

  it("0050: should fetch datablocks associated with dataset", async () => {
    var filter = { where: { datasetId: datasetId } };

    return request(appUrl)
      .get(
        `/api/v3/datablocks?filter= ${encodeURIComponent(JSON.stringify(filter))} `,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(2);
        res.body[0].should.have
          .property("dataFileList")
          .and.be.instanceof(Array)
          .and.to.have.length(TestData.DataBlockCorrect.dataFileList.length);
      });
  });

  it("0060: The size and numFiles fields in the dataset should be correctly updated", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(datasetId))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.DataBlockCorrect.size * 2);
        res.body.should.have
          .property("packedSize")
          .and.equal(TestData.DataBlockCorrect.packedSize * 2);
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(TestData.DataBlockCorrect.dataFileList.length * 2);
        res.body.should.have
          .property("numberOfFilesArchived")
          .and.equal(TestData.DataBlockCorrect.dataFileList.length * 2);
      });
  });

  it("0070: should delete first datablock", async () => {
    return request(appUrl)
      .delete(`/api/v3/datablocks/${datablockId}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0080: The size and numFiles fields in the dataset should be correctly updated", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(datasetId))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.DataBlockCorrect.size);
        res.body.should.have
          .property("packedSize")
          .and.equal(TestData.DataBlockCorrect.packedSize);
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(TestData.DataBlockCorrect.dataFileList.length);
        res.body.should.have
          .property("numberOfFilesArchived")
          .and.equal(TestData.DataBlockCorrect.dataFileList.length);
      });
  });

  it("0090: should delete second datablock", async () => {
    return request(appUrl)
      .delete(`/api/v3/datablocks/${datablockId2}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0100: The size and numFiles fields in the dataset should be correctly updated", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodeURIComponent(datasetId))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("size").and.equal(0);
        res.body.should.have.property("packedSize").and.equal(0);
        res.body.should.have.property("numberOfFiles").and.equal(0);
        res.body.should.have.property("numberOfFilesArchived").and.equal(0);
      });
  });

  it("0110: should delete the newly created dataset", async () => {
    return request(appUrl)
      .delete(`/api/v3/Datasets/${encodeURIComponent(datasetId)}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });
});
