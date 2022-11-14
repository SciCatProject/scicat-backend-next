var chai = require("chai");
var should = chai.should();
var chaiHttp = require("chai-http");
var request = require("supertest");
var utils = require("./LoginUtils");

const { TestData } = require("./TestData");

chai.use(chaiHttp);

const app = "http://localhost:3000";

describe("DerivedDatasetDatablock: Test Datablocks and their relation to derived Datasets", () => {
  var accessTokenIngestor = null;
  var accessTokenArchiveManager = null;

  var datasetPid = null;

  var datablockId1 = null;
  var datablockId2 = null;

  var datablockData1 = null;
  var datablockData2 = null;

  beforeEach((done) => {
    utils.getToken(
      app,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessTokenIngestor = tokenVal;
        utils.getToken(
          app,
          {
            username: "archiveManager",
            password: "aman",
          },
          (tokenVal) => {
            accessTokenArchiveManager = tokenVal;
            done();
          },
        );
      },
    );

    let {
      datasetId1, 
      ownerGroup1, 
      accessGroups1, 
      instrumentGroup1,
      ...localDatablockData1} = TestData.DataBlockCorrect1;
    datablockData1 = localDatablockData1;
    let {
      datasetId2, 
      ownerGroup2, 
      accessGroups2, 
      instrumentGroup2, 
      ...localDatablockData2} = TestData.DataBlockCorrect2;
    datablockData2 = localDatablockData2;

  });

  it("adds a new derived dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(TestData.DerivedCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        datasetPid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("validate correct Datablock data used later", async () =>{
    return request(app)
      .post(`/api/v3/datasets/${datasetPid}/datablocks/isValid`)
      .send(DatablockData1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
        res.body.should.have.property("errors")
          .and.be.instanceof(Array)
          .and.to.have.lengthOf(0);
      });
  });

  it("validate wrong Datablock and expect false", async () =>{
    return request(app)
      .post(`/api/v3/datasets/${datasetPid}/datablocks/isValid`)
      .send(TestData.DataBlockWrong)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
        res.body.should.have.property("errors")
          .and.be.instanceof(Array)
          .and.to.have.lengthOf.above(0);
    });
  });

  it("adds a new datablock with wrong account which should fail", async () => {
    return request(app)
      .post(`/api/v3/datasets/${datasetPid}/datablocks`)
      .send(datablockData1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403)
      .expect("Content-Type", /json/);
  });

  it("adds a new datablock with correct account", async () => {
    return request(app)
      .post(`/api/v3/datasets/${datasetPid}/datablocks`)
      .send(datablockData1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.datablockCorrect1.size);
        res.body.should.have.property("id").and.be.string;
        datablockId1 = encodeURIComponent(res.body["id"]);
      });
  });

  it("adds a second datablock", async () => {
    return request(app)
      .post(`/api/v3/datasets/${datasetPid}/datablocks`)
      .send(datablockData2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.datablockCorrect2.size);
        res.body.should.have.property("id").and.be.string;
        datablockId2 = encodeURIComponent(res.body["id"]);
      });
  });

  it("Should fetch all datablocks belonging to the new dataset", async () => {
    return request(app)
      .get(`/api/v3/Datasets/${datasetPid}/datablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(2);
        res.body[0]["id"].should.be.oneOf([
          datablockId1,
          datablockId2,
        ]);
        res.body[1]["id"].should.be.oneOf([
          datablockId1,
          datablockId2,
        ]);
      });
  });

  it("The new dataset should be the sum of the size of the datablocks", async () => {
    return request(app)
      .get(`/api/v3/Datasets/${datasetPid}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["size"].should.be.equal(
          TestData.datablockCorrect1.size + TestData.datablockCorrect2.size,
        );
      });
  });

  it("should fetch one dataset including related data", async () => {
    var limits = {
      skip: 0,
      limit: 10,
    };
    var filter = {
      where: {
        pid: datasetPid,
      },
      include: [
        {
          relation: "datablocks",
        },
      ],
    };

    return request(app)
      .get(
        "/api/v3/Datasets/findOne?filter=" +
          encodeURIComponent(JSON.stringify(filter)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid);
        res.body.datablocks.should.be
          .instanceof(Array)
          .and.to.have.length(2);
        res.body.datablocks[0].should.have
          .property("dataFileList")
          .and.be.instanceof(Array)
          .and.to.have.length(
            TestData.datablockCorrect1.dataFileList.length,
          );
      });
  });

  it("Should fetch some datablock by the full filename and dataset pid", async () => {
    var fields = {
      datasetId: datasetPid,
      "dataFileList.path": "N1039-B410377.tif",
    };
    var limits = {
      skip: 0,
      limit: 20,
    };
    return request(app)
      .get(
        "/api/v3/datablocks/fullQuery?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(2);
      });
  });

  it("Should fetch some datablock by the partial filename and dataset pid", async () => {
    var fields = {
      datasetId: datasetPid,
      "dataFileList.path": {"$regex" : "B410"},
    };
    var limits = {
      skip: 0,
      limit: 20,
    };
    return request(app)
      .get(
        "/api/v3/datablocks/fullQuery?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(2);
      });
  });

  it("Should fetch no datablock using a non existing filename", async () => {
    var fields = {
      datasetId: datasetPid,
      "dataFileList.path": "this_file_does_not_exists.txt",
    };
    var limits = {
      skip: 0,
      limit: 20,
    };
    return request(app)
      .get(
        "/api/v3/datablocks/fullQuery?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(0);
      });
  });

  it("Should fetch one datablock using a specific filename and dataset id", async () => {
    var fields = {
      datasetId: datasetPid,
      "dataFileList.path": "this_unique_file.txt",
    };
    var limits = {
      skip: 0,
      limit: 20,
    };
    return request(app)
      .get(
        "/api/v3/datablocks/fullQuery?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(1);
      });
  });


  it("The size and numFiles fields in the dataset should be correctly updated", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + datasetPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.datablockCorrect1.size + TestData.datablockCorrect2.size);
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(TestData.datablockCorrect1.dataFileList.length + TestData.datablockCorrect2.dataFileList.length);
      });
  });

  it("should delete first datablock", async () => {
    return request(app)
      .delete(`/api/v3/datasets/${datasetPid}/datablocks/${datablockId1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("should delete second datablock", async () => {
    return request(app)
      .delete(`/api/v3/datasets/${datasetPid}/datablocks/${datablockId2}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("Should fetch no datablocks belonging to the new dataset", async () => {
    return request(app)
      .get(`/api/v3/Datasets/${datasetPid}/datablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(0);
      });
  });

  it("The size and numFiles fields in the dataset should be zero", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + datasetPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(0);
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(0);
      });
  });

  it("should delete the newly created dataset", async () => {
    return request(app)
      .delete(`/api/v3/Datasets/${datasetPid}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
