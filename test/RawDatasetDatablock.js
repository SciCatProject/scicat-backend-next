/* eslint-disable @typescript-eslint/no-var-requires */
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

describe("1800: RawDatasetDatablock: Test Datablocks and their relation to raw Datasets", () => {
  var accessTokenAdminIngestor = null;
  var accessTokenArchiveManager = null;

  var datasetPid = null;
  var datablockId = null;
  var datablockId2 = null;

  beforeEach((done) => {
    before(() => {
      db.collection("Dataset").deleteMany({});
    });
    utils.getToken(
      appUrl,
      {
        username: "adminIngestor",
        password: TestData.Accounts["adminIngestor"]["password"],
      },
      (tokenVal) => {
        accessTokenAdminIngestor = tokenVal;
        utils.getToken(
          appUrl,
          {
            username: "archiveManager",
            password: TestData.Accounts["archiveManager"]["password"],
          },
          (tokenVal) => {
            accessTokenArchiveManager = tokenVal;
            done();
          },
        );
      },
    );
  });

  it("0010: adds a new raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        datasetPid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("0020: adds a new datablock to the existing raw dataset", () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/Datablocks`)
      .send(TestData.DataBlockCorrect)
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

  it("0030: adds the same datablock again which should fail because it is already stored", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/Datablocks`)
      .send(TestData.DataBlockCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.ApplicationErrorStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("0040: adds a new datablock which should fail because wrong functional account", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/Datablocks`)
      .send(TestData.DataBlockCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("0050: adds a second datablock for same dataset", async () => {
    let testdata = { ...TestData.DataBlockCorrect };
    testdata.archiveId = "some-other-archive-id-that-is-different";

    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/datablocks`)
      .send(testdata)
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

  it("0060: Should fetch all datablocks belonging to the new dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/datasets/${datasetPid}/datablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(2);
      });
  });

  it("0070: should fetch one dataset including related data", async () => {
    var limits = {
      skip: 0,
      limit: 10,
    };
    var filter = {
      where: {
        pid: decodeURIComponent(datasetPid),
      },
      include: [
        {
          relation: "datablocks",
        },
      ],
    };

    return request(appUrl)
      .get(
        `/api/v3/Datasets/findOne?filter=
          ${encodeURIComponent(JSON.stringify(filter))}
          &limits=${encodeURIComponent(JSON.stringify(limits))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["pid"].should.be.equal(decodeURIComponent(datasetPid));
        res.body.datablocks.should.be.instanceof(Array).and.to.have.length(2);
        res.body.datablocks[0].should.have
          .property("dataFileList")
          .and.be.instanceof(Array)
          .and.to.have.length(TestData.DataBlockCorrect.dataFileList.length);
      });
  });

  it("0080: The size and numFiles fields in the dataset should be correctly updated", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid)
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

  it("0090: should delete first datablock", async () => {
    return request(appUrl)
      .delete(`/api/v3/datasets/${datasetPid}/Datablocks/${datablockId}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0100: The size and numFiles fields in the dataset should be correctly updated", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid)
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

  it("0110: should delete second datablock", async () => {
    return request(appUrl)
      .delete(`/api/v3/datasets/${datasetPid}/Datablocks/${datablockId2}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0120: The size and numFiles fields in the dataset should be correctly updated", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid)
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

  it("0130: should delete the newly created dataset", async () => {
    return request(appUrl)
      .delete(`/api/v3/Datasets/${datasetPid}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });
});
