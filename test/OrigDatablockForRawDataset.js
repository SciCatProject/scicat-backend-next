/* eslint-disable @typescript-eslint/no-var-requires */
const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

describe("OrigDatablockForRawDataset: Test OrigDatablocks and their relation to raw Datasets using origdatablocks endpoint", () => {
  let accessTokenIngestor = null,
    accessTokenArchiveManager = null,
    datasetPid1 = null,
    datasetPid2 = null,
    origDatablock1 = null,
    origDatablock2 = null,
    origDatablock3 = null,
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

    origDatablockData1 = {
      ...TestData.OrigDataBlockCorrect1,
      "datasetId": null
    }
    origDatablockData2 = {
      ...TestData.OrigDataBlockCorrect2,
      "datasetId": null
    }
    origDatablockData3 = {
      ...TestData.OrigDataBlockCorrect3,
      "datasetId": null
    }

    origDatablockWithEmptyChkAlg = { ...TestData.OrigDataBlockWrongChkAlg };
  });

  it("adds a first new raw dataset (dataset 1)", async () => {
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
        datasetPid1 = encodeURIComponent(res.body["pid"]);
        origDatablockData1.datasetPid = datasetPid1;
        origDatablockData2.datasetPid = datasetPid1;
      });
  });

  it("adds a second new raw dataset (dataset 2)", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrectRandom)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        datasetPid2 = encodeURIComponent(res.body["pid"]);
        origDatablockData3.datasetPid = datasetPid2;
      });
  });

  it("validate correct origDatablock 1 data used later", async () => {
    return request(appUrl)
      .post(`/api/v3/origdatablocks/isValid`)
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
      .post(`/api/v3/origdatablocks/isValid`)
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
      .post(`/api/v3/OrigDatablocks`)
      .send(origDatablockData1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(403)
      .expect("Content-Type", /json/);
  });

  it("adds a new origDatablock with correct account (origdatablock 1)", async () => {
    return request(appUrl)
      .post(`/api/v3/OrigDatablocks`)
      .send(origDatablockData1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(origDataBlockData1.size);
        res.body.should.have.property("id").and.be.string;
        origDatablockId1 = encodeURIComponent(res.body["id"]);
      });
  });

  it("adds a second origDatablock (origdatablock 2)", async () => {
    return request(appUrl)
      .post(`/api/v3/OrigDatablocks`)
      .send(origDatablockData2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(origDataBlockData2.size);
        res.body.should.have.property("id").and.be.string;
        origDatablockId2 = encodeURIComponent(res.body["id"]);
      });
  });

  it("add a new origDatablock with empty chkAlg should fail", async () => {
    return request(appUrl)
      .post(`/api/v3/OrigDatablocks`)
      .send(origDatablockWithEmptyChkAlg)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
      });
  });

  it("add a new origDatablock with valid chkAlg should success (origdatablock 3)", async () => {
    return request(appUrl)
      .post(`/api/v3/OrigDatablocks`)
      .send(origDatablockData3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(origDataBlockData3.size);
        res.body.should.have
          .property("chkAlg")
          .and.equal(origDataBlockData3.chkAlg);
        res.body.should.have.property("id").and.be.string;
        origDatablockId3 = encodeURIComponent(res.body["id"]);
      });
  });

  it("Should fetch all origdatablocks belonging to the new dataset 1", async () => {
    const filter= { where: { datasetId: datasetPid1 } };

    return request(appUrl)
      .get(`/api/v3/OrigDatablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(3);
        res.body[0]["id"].should.be.oneOf([
          origDatablockId1,
          origDatablockId2,
        ]);
        res.body[1]["id"].should.be.oneOf([
          origDatablockId1,
          origDatablockId2,
        ]);
      });
  });

  it("Should fetch all origdatablocks belonging to the new dataset 2", async () => {
    const filter= { where: { datasetId: datasetPid2 } };

    return request(appUrl)
      .get(`/api/v3/OrigDatablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(3);
        res.body[0]["id"].should.be.oneOf([
          origDatablockId3,
        ]);
      });
  });

  it("Dataset 1 should be the sum of the size of the origDatablocks 1 and 2", async () => {
    return request(appUrl)
      .get(`/api/v3/Datasets/${datasetPid1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["size"].should.be.equal(
          origDatablockData1.size +
            origDatablockData2.size,
        );
      });
  });

  it("Dataset 2 should be the size of the origDatablocks 3", async () => {
    return request(appUrl)
      .get(`/api/v3/Datasets/${datasetPid2}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["size"].should.be.equal(
          origDatablockData3.size,
        );
      });
  });

  it("should fetch dataset 1 including related data", async () => {
    var limits = {
      skip: 0,
      limit: 10,
    };
    var filter = {
      where: {
        pid: decodeURIComponent(datasetPid1),
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
        res.body["pid"].should.be.equal(decodeURIComponent(datasetPid1));
        res.body.origdatablocks.should.be
          .instanceof(Array)
          .and.to.have.length(2);
        res.body.origdatablocks[0].should.have
          .property("dataFileList")
          .and.be.instanceof(Array)
          .and.should.be.oneOf([
            origDataBlockData1.dataFileList,
            origDataBlockData2.dataFileList,
          ]);
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

  it("Fetch origDatablock datafiles should include datasetExist field", async () => {
    const fields = {};
    const limits = {
      skip: 0,
      limit: 20,
    };
    return request(appUrl)
      .get(
        "/api/v3/OrigDatablocks/fullQuery/files?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.forEach((origdatablock) =>
          origdatablock.should.have.property("datasetExist"),
        );
      });
  });

  it("Verify that size and numFiles fields are correct in the dataset 1, pass 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(
            origDatablockData1.size +
              origDatablockData2.size,
          );
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(
            origDatablockData1.dataFileList.length +
              origDatablockData2.dataFileList.length,
          );
      });
  });

  it("Verify that size and numFiles fields are correct in the dataset 2, pass 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(
            origDatablockData3.size,
          );
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(
            origDatablockData3.dataFileList.length,
          );
      });
  });

  it("should delete OrigDatablock 1", async () => {
    return request(appUrl)
      .delete(
        `/api/v3/datasets/${origDatablockId1}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("Verify that size and numFiles fields are correct in the dataset 1, pass 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(
            origDatablockData2.size,
          );
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(
            origDatablockData2.dataFileList.length,
          );
      });
  });

  it("Verify that size and numFiles fields are correct in the dataset 2, pass 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(
            origDatablockData3.size,
          );
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(
            origDatablockData3.dataFileList.length,
          );
      });
  });

  it("should delete OrigDatablock 2", async () => {
    return request(appUrl)
      .delete(
        `/api/v3/datasets/${origDatablockId2}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("Verify that size and numFiles fields are correct in the dataset 1, pass 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid1)
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

  it("Verify that size and numFiles fields are correct in the dataset 2, pass 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(
            origDatablockData3.size,
          );
        res.body.should.have
          .property("numberOfFiles")
          .and.equal(
            origDatablockData3.dataFileList.length,
          );
      });
  });

  it("should delete OrigDatablock 3", async () => {
    return request(appUrl)
      .delete(
        `/api/v3/datasets/${origDatablockId3}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("Verify that size and numFiles fields are correct in the dataset 1, pass 4", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid1)
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

  it("Verify that size and numFiles fields are correct in the dataset 2, pass 4", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + datasetPid2)
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

  it("Should fetch no origdatablocks belonging to the dataset 1", async () => {
    const filter= { where: { datasetId: datasetPid1 } };

    return request(appUrl)
      .get(`/api/v3/OrigDatablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(0);
      });
  });

  it("Should fetch no origdatablocks belonging to the dataset 2", async () => {
    const filter= { where: { datasetId: datasetPid2 } };

    return request(appUrl)
      .get(`/api/v3/OrigDatablocks`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .query({ filter: JSON.stringify(filter) })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(0);
      });
  });

  it("add a new origDatablock with invalid pid should fail", async () => {
    return request(appUrl)
      .post(`/api/v3/origdatablocks`)
      .send({ ...origDatablockData1, datasetId: "wrong" })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
      });
  });

  it("should delete the dataset 1", async () => {
    return request(appUrl)
      .delete(`/api/v3/Datasets/${datasetPid1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete the dataset 2", async () => {
    return request(appUrl)
      .delete(`/api/v3/Datasets/${datasetPid2}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
