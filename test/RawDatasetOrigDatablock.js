/* eslint-disable @typescript-eslint/no-var-requires */
const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

describe("RawDatasetOrigDatablock: Test OrigDatablocks and their relation to raw Datasets", () => {
  let accessTokenIngestor = null,
    accessTokenArchiveManager = null,
    datasetPid = null,
    origDatablockId1 = null,
    origDatablockId2 = null,
    origDatablockId3 = null,
    origDatablockData1 = null,
    origDatablockData2 = null,
    origDatablockWithEmptyChkAlg = null,
    origDatablockWithValidChkAlg = null;

  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessTokenIngestor = tokenVal;
        utils.getToken(
          appUrl,
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

    origDatablockData1 = { ...TestData.OrigDataBlockCorrect1 };
    origDatablockData2 = { ...TestData.OrigDataBlockCorrect2 };
    origDatablockWithEmptyChkAlg = { ...TestData.OrigDataBlockWrongChkAlg };
    origDatablockWithValidChkAlg = { ...TestData.OrigDataBlockCorrect3 };
  });

  it("adds a new raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        datasetPid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("validate correct origDatablock data used later", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/origdatablocks/isValid`)
      .send(origDatablockData1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
        res.body.should.have
          .property("errors")
          .and.be.instanceof(Array)
          .and.to.have.lengthOf(0);
      });
  });

  it("validate wrong origDatablock and expect false", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/origdatablocks/isValid`)
      .send(TestData.OrigDataBlockWrong)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
        res.body.should.have
          .property("errors")
          .and.be.instanceof(Array)
          .and.to.have.lengthOf.above(0);
      });
  });

  it("adds a new origDatablock with wrong account which should fail", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/OrigDatablocks`)
      .send(origDatablockData1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403)
      .expect("Content-Type", /json/);
  });

  it("add a new origDatablock with empty chkAlg should fail", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/OrigDatablocks`)
      .send(origDatablockWithEmptyChkAlg)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
      });
  });

  it("add a new origDatablock with invalid dataset should fail", async () => {
    return request(appUrl)
      .post(`/api/v3/origdatablocks`)
      .send({ ...OrigDataBlockCorrect1, datasetId: "wrong" })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
      });
  });

  it("add a new origDatablock with valid chkAlg should success", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/OrigDatablocks`)
      .send(origDatablockWithValidChkAlg)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("chkAlg")
          .and.equal(TestData.OrigDataBlockCorrect3.chkAlg);
        res.body.should.have.property("id").and.be.string;
        origDatablockId3 = encodeURIComponent(res.body["id"]);
      });
  });

  it("adds a new origDatablock with correct account", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/OrigDatablocks`)
      .send(origDatablockData1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.OrigDataBlockCorrect1.size);
        res.body.should.have.property("id").and.be.string;
        origDatablockId1 = encodeURIComponent(res.body["id"]);
      });
  });

  it("adds a second origDatablock", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${datasetPid}/OrigDatablocks`)
      .send(origDatablockData2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.OrigDataBlockCorrect2.size);
        res.body.should.have.property("id").and.be.string;
        origDatablockId2 = encodeURIComponent(res.body["id"]);
      });
  });

  it("Should fetch all origdatablocks belonging to the new dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/Datasets/${datasetPid}/OrigDatablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(3);
        res.body[0]["id"].should.be.oneOf([
          origDatablockId1,
          origDatablockId2,
          origDatablockId3,
        ]);
        res.body[1]["id"].should.be.oneOf([
          origDatablockId1,
          origDatablockId2,
          origDatablockId3,
        ]);
        res.body[2]["id"].should.be.oneOf([
          origDatablockId1,
          origDatablockId2,
          origDatablockId3,
        ]);
      });
  });

  it("The new dataset should be the sum of the size of the origDatablocks", async () => {
    return request(appUrl)
      .get(`/api/v3/Datasets/${datasetPid}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["size"].should.be.equal(
          TestData.OrigDataBlockCorrect1.size +
            TestData.OrigDataBlockCorrect2.size +
            TestData.OrigDataBlockCorrect3.size,
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
        pid: decodeURIComponent(datasetPid),
      },
      include: [
        {
          relation: "origdatablocks",
        },
      ],
    };

    return request(appUrl)
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
        res.body["pid"].should.be.equal(decodeURIComponent(datasetPid));
        res.body.origdatablocks.should.be
          .instanceof(Array)
          .and.to.have.length(3);
        res.body.origdatablocks[1].should.have
          .property("dataFileList")
          .and.be.instanceof(Array)
          .and.to.have.length(
            TestData.OrigDataBlockCorrect1.dataFileList.length,
          );
      });
  });

  it("Should fetch some origDatablock by the full filename and dataset pid", async () => {
    var fields = {
      datasetId: decodeURIComponent(datasetPid),
      "dataFileList.path": "N1039-B410377.tif",
    };
    var limits = {
      skip: 0,
      limit: 20,
    };
    return request(appUrl)
      .get(
        "/api/v3/OrigDatablocks/fullQuery?fields=" +
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

  it("Should fetch some origDatablock by the partial filename and dataset pid", async () => {
    var fields = {
      datasetId: decodeURIComponent(datasetPid),
      "dataFileList.path": { $regex: "B410" },
    };
    var limits = {
      skip: 0,
      limit: 20,
    };
    return request(appUrl)
      .get(
        "/api/v3/OrigDatablocks/fullQuery?fields=" +
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

  it("Should fetch no origDatablock using a non existing filename", async () => {
    var fields = {
      datasetId: decodeURIComponent(datasetPid),
      "dataFileList.path": "this_file_does_not_exists.txt",
    };
    var limits = {
      skip: 0,
      limit: 20,
    };
    return request(appUrl)
      .get(
        "/api/v3/OrigDatablocks/fullQuery?fields=" +
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

  it("Should fetch one origDatablock using a specific filename and dataset id", async () => {
    var fields = {
      datasetId: decodeURIComponent(datasetPid),
      "dataFileList.path": "this_unique_file.txt",
    };
    var limits = {
      skip: 0,
      limit: 20,
    };
    return request(appUrl)
      .get(
        "/api/v3/OrigDatablocks/fullQuery?fields=" +
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
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(
            TestData.OrigDataBlockCorrect1.size +
              TestData.OrigDataBlockCorrect2.size +
              TestData.OrigDataBlockCorrect3.size,
          );
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(
            TestData.OrigDataBlockCorrect1.dataFileList.length +
              TestData.OrigDataBlockCorrect2.dataFileList.length +
              TestData.OrigDataBlockCorrect3.dataFileList.length,
          );
      });
  });

  it("should delete first OrigDatablock", async () => {
    return request(appUrl)
      .delete(
        `/api/v3/datasets/${datasetPid}/OrigDatablocks/${origDatablockId1}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("should delete second OrigDatablock", async () => {
    return request(appUrl)
      .delete(
        `/api/v3/datasets/${datasetPid}/OrigDatablocks/${origDatablockId2}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("should delete third OrigDatablock", async () => {
    return request(appUrl)
      .delete(
        `/api/v3/datasets/${datasetPid}/OrigDatablocks/${origDatablockId3}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("Should fetch no origdatablocks belonging to the new dataset", async () => {
    return request(appUrl)
      .get(`/api/v3/Datasets/${datasetPid}/OrigDatablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(0);
      });
  });

  it("The size and numFiles fields in the dataset should be zero", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("size").and.equal(0);
        res.body.should.have.property("numberOfFiles").and.equal(0);
      });
  });

  it("should delete the newly created dataset", async () => {
    return request(appUrl)
      .delete(`/api/v3/Datasets/${datasetPid}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
