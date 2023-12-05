/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const sandbox = require("sinon").createSandbox();
const { v4: uuidv4 } = require("uuid");

let accessTokenIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser2 = null,
  accessTokenUser3 = null,
  accessTokenArchiveManager = null,
  accessTokenAdmin = null;

let datasetPid1 = null,
  encodedDatasetPid1 = null,
  datasetPid2 = null,
  encodedDatasetPid2 = null,
  datasetPid3 = null,
  encodedDatasetPid3 = null;

const dataset1 = {
  ...TestData.RawCorrect,
  isPublished: true,
  ownerGroup: "group4",
  accessGroups: ["group5"],
};

const dataset2 = {
  ...TestData.RawCorrect,
  isPublished: false,
  ownerGroup: "group1",
  accessGroups: ["group3"],
};

const dataset3 = {
  ...TestData.RawCorrect,
  isPublished: false,
  ownerGroup: "group2",
  accessGroups: ["group3"],
};

describe("0300: DatasetAuthorization: Test access to dataset", () => {
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
            username: "user1",
            password: "a609316768619f154ef58db4d847b75e",
          },
          (tokenVal) => {
            accessTokenUser1 = tokenVal;
            utils.getToken(
              appUrl,
              {
                username: "user2",
                password: "f522d1d715970073a6413474ca0e0f63",
              },
              (tokenVal) => {
                accessTokenUser2 = tokenVal;
                utils.getToken(
                  appUrl,
                  {
                    username: "user3",
                    password: "70dc489e8ee823ae815e18d664424df2",
                  },
                  (tokenVal) => {
                    accessTokenUser3 = tokenVal;
                    utils.getToken(
                      appUrl,
                      {
                        username: "archiveManager",
                        password: "aman",
                      },
                      (tokenVal) => {
                        accessTokenArchiveManager = tokenVal;
                        utils.getToken(
                          appUrl,
                          {
                            username: "admin",
                            password: "am2jf70TPNZsSan",
                          },
                          (tokenVal) => {
                            accessTokenAdmin = tokenVal;
                            done();
                          },
                        );
                      },
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  });

  afterEach((done) => {
    sandbox.restore();
    done();
  });

  it("0010: adds dataset 1", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group4");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(true);
        res.body.should.have.property("pid").and.be.string;
        datasetPid1 = res.body["pid"];
        encodedDatasetPid1 = encodeURIComponent(datasetPid1);
      });
  });

  it("0020: adds dataset 2", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group1");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        datasetPid2 = res.body["pid"];
        encodedDatasetPid2 = encodeURIComponent(datasetPid2);
      });
  });

  it("0030: adds dataset 3", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group2");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        datasetPid3 = res.body["pid"];
        encodedDatasetPid3 = encodeURIComponent(datasetPid3);
      });
  });

  it("0040: adds a new origDatablock on the published dataset", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${encodedDatasetPid1}/origdatablocks`)
      .send(TestData.OrigDataBlockCorrect1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.OrigDataBlockCorrect1.size);
        res.body.should.have.property("id").and.be.string;
      });
  });

  it("0050: adds a new datablock on the published dataset", async () => {
    const randomArchiveId = Math.random().toString(36).slice(2);

    return request(appUrl)
      .post(`/api/v3/datasets/${encodedDatasetPid1}/datablocks`)
      .send({ ...TestData.DataBlockCorrect, archiveId: randomArchiveId })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.DataBlockCorrect.size);
        res.body.should.have.property("id").and.be.string;
      });
  });

  it("0060: adds a new attachment on the published dataset", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${encodedDatasetPid1}/attachments`)
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/);
  });

  it("0070: list of public datasets, aka as unauthenticated user", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["pid"].should.be.equal(datasetPid1);
      });
  });

  it("0080: access public dataset as unauthenticated user", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid1);
      });
  });

  it("0090: access private dataset as unauthenticated user", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("0100: list of datasets for ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
      });
  });

  it("0110: datasets counts for ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["count"].should.be.equal(3);
      });
  });

  it("0120: access dataset 1 as ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid1);
      });
  });

  it("0130: full query for datasets for ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/fullquery")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
      });
  });

  it("0140: access dataset 2 as ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid2);
      });
  });

  it("0150: access dataset 3 as ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid3);
      });
  });

  it("0160: list of datasets for user 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
        res.body[1]["pid"].should.be.equal(datasetPid2);
      });
  });

  it("0170: datasets count for user 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["count"].should.be.equal(2);
      });
  });

  it("0180: access dataset 1 as user 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid1);
      });
  });

  it("0190: access dataset 2 as user 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid2);
      });
  });

  it("0200: access dataset 3 as user 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("0210: full query for datasets for user 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/fullquery")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["pid"].should.be.equal(datasetPid2);
      });
  });

  it("0220: list of datasets for user 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
        res.body[1]["pid"].should.be.equal(datasetPid3);
      });
  });

  it("0230: datasets count for user 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["count"].should.be.equal(2);
      });
  });

  it("0240: access dataset 1 as user 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid1);
      });
  });

  it("0250: access dataset 2 as user 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("0260: access dataset 3 as user 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid3);
      });
  });

  it("0270: full query for datasets for user 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/fullquery")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["pid"].should.be.equal(datasetPid3);
      });
  });

  it("0280: list of datasets for user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
      });
  });

  it("0290: datasets count for user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/count")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body["count"].should.be.equal(3);
      });
  });

  it("0300: access dataset 1 as user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid1);
      });
  });

  it("0310: access dataset 2 as user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid2);
      });
  });

  it("0320: access dataset 3 as user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid3);
      });
  });

  it("0330: full query for datasets for user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/fullquery")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("0340: update dataset 2 to be published", async () => {
    return request(appUrl)
      .patch(`/api/v3/Datasets/${encodedDatasetPid2}`)
      .send({ isPublished: true })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("0350: full query for datasets for user 2", async () => {
    const fields = {
      isPublished: true,
    };

    return request(appUrl)
      .get(
        `/api/v3/Datasets/fullquery?fields=${encodeURIComponent(
          JSON.stringify(fields),
        )}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("0360: full facet for datasets for user 2", async () => {
    const fields = {
      isPublished: true,
    };
    return request(appUrl)
      .get(
        `/api/v3/Datasets/fullfacet?fields=${encodeURIComponent(
          JSON.stringify(fields),
        )}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body[0].all[0].totalSets.should.be.equal(2);
      });
  });

  it("0370: access dataset 1 origdatablocks as user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1 + "/origdatablocks")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  it("0380: access dataset 1 datablocks as user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1 + "/datablocks")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  it("0390: access dataset 1 attachments as user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1 + "/attachments")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  it("0400: access dataset 1 thumbnail as user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1 + "/thumbnail")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("0410: should delete dataset 1", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + encodedDatasetPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("0420: should delete dataset 2", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("0430: should delete dataset 3", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + encodedDatasetPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("0500: admin can add a new raw dataset", async () => {
    const newDataset = {
      ...TestData.RawCorrect,
      ownerGroup: "admin",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0501: admin cannot add a new incomplete raw dataset", async () => {
    const newDataset = {
      ...TestData.RawWrong_1,
      ownerGroup: "admin",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0502: admin can add a new raw dataset with specified pid", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: uuidv4(),
      ownerGroup: "admin",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.equal(datasetWithPid.pid);
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0503: admin cannot add a new raw dataset with specified invalid pid", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "admin",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0504: admin cannot add a new invalid raw dataset with specified pid", async () => {
    const invalidDatasetWithPid = {
      ...TestData.RawWrong_1,
      pid: uuidv4(),
      ownerGroup: "admin",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0505: admin cannot add a new invalid raw dataset with specified invalid pid", async () => {
    const invalidDatasetWithInvalidPid = {
      ...TestData.RawWrong_1,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "admin",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithInvalidPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0510: admin can add a new raw dataset with different owner group", async () => {
    const newDataset = {
      ...TestData.RawCorrect,
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0520: admin cannot add a new incomplete raw dataset with different owner group", async () => {
    const newDataset = {
      ...TestData.RawWrong_1,
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0530: admin can add a new raw dataset with specified pid and different owner group", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: uuidv4(),
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.equal(datasetWithPid.pid);
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0540: admin cannot add a new raw dataset with specified invalid pid and different owner group", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0550: admin cannot add a new invalid raw dataset with specified pid and different owner group", async () => {
    const invalidDatasetWithPid = {
      ...TestData.RawWrong_1,
      pid: uuidv4(),
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0560: admin cannot add a new invalid raw dataset with specified invalid pid and different owner group", async () => {
    const invalidDatasetWithInvalidPid = {
      ...TestData.RawWrong_1,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithInvalidPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0600: user with create dataset groups only can add a new raw dataset", async () => {
    const newDataset = {
      ...TestData.RawCorrect,
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0601: user with create dataset groups only cannot add a new incomplete raw dataset", async () => {
    const newDataset = {
      ...TestData.RawWrong_1,
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0602: user with create dataset groups only can not add a new raw dataset with specified pid", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: uuidv4(),
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0603: user with create dataset groups only cannot add a new raw dataset with specified invalid pid", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0604: user with create dataset groups only cannot add a new invalid raw dataset with specified pid", async () => {
    const invalidDatasetWithPid = {
      ...TestData.RawWrong_1,
      pid: uuidv4(),
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0605: user with create dataset groups only cannot add a new invalid raw dataset with specified invalid pid", async () => {
    const invalidDatasetWithInvalidPid = {
      ...TestData.RawWrong_1,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithInvalidPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0610: user with create dataset groups only can not add a new raw dataset with different owner group", async () => {
    const newDataset = {
      ...TestData.RawCorrect,
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0620: user with create dataset groups only cannot add a new incomplete raw dataset with different owner group", async () => {
    const newDataset = {
      ...TestData.RawWrong_1,
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0630: user with create dataset groups only cannot add a new raw dataset with specified pid and different owner group", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: uuidv4(),
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0640: user with create dataset groups only cannot add a new raw dataset with specified invalid pid and different owner group", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0650: user with create dataset groups only cannot add a new invalid raw dataset with specified pid and different owner group", async () => {
    const invalidDatasetWithPid = {
      ...TestData.RawWrong_1,
      pid: uuidv4(),
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0660: user with create dataset groups only cannot add a new invalid raw dataset with specified invalid pid and different owner group", async () => {
    const invalidDatasetWithInvalidPid = {
      ...TestData.RawWrong_1,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithInvalidPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0700: user with create dataset with pid groups can add a new raw dataset", async () => {
    const newDataset = {
      ...TestData.RawCorrect,
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0701: user with create dataset with pid groups cannot add a new incomplete raw dataset", async () => {
    const newDataset = {
      ...TestData.RawWrong_1,
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0702: user with create dataset with pid groups can add a new raw dataset with specified pid", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: uuidv4(),
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.equal(datasetWithPid.pid);
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0703: user with create dataset with pid groups cannot add a new raw dataset with specified invalid pid", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0704: user with create dataset with pid groups cannot add a new invalid raw dataset with specified pid", async () => {
    const invalidDatasetWithPid = {
      ...TestData.RawWrong_1,
      pid: uuidv4(),
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0705: user with create dataset with pid groups cannot add a new invalid raw dataset with specified invalid pid", async () => {
    const invalidDatasetWithInvalidPid = {
      ...TestData.RawWrong_1,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group2",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithInvalidPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0710: user with create dataset with pid groups can not add a new raw dataset with different owner group", async () => {
    const newDataset = {
      ...TestData.RawCorrect,
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0720: user with create dataset with pid groups cannot add a new incomplete raw dataset with different owner group", async () => {
    const newDataset = {
      ...TestData.RawWrong_1,
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0730: user with create dataset with pid groups cannot add a new raw dataset with specified pid and different owner group", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: uuidv4(),
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0740: user with create dataset with pid groups cannot add a new raw dataset with specified invalid pid and different owner group", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0750: user with create dataset with pid groups cannot add a new invalid raw dataset with specified pid and different owner group", async () => {
    const invalidDatasetWithPid = {
      ...TestData.RawWrong_1,
      pid: uuidv4(),
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0760: user with create dataset with pid groups cannot add a new invalid raw dataset with specified invalid pid and different owner group", async () => {
    const invalidDatasetWithInvalidPid = {
      ...TestData.RawWrong_1,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithInvalidPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0800: user with create dataset privileged groups can add a new raw dataset", async () => {
    const newDataset = {
      ...TestData.RawCorrect,
      ownerGroup: "group3",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0801: user with create dataset privileged groups cannot add a new incomplete raw dataset", async () => {
    const newDataset = {
      ...TestData.RawWrong_1,
      ownerGroup: "group3",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0802: user with create dataset privileged groups can add a new raw dataset with specified pid", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: uuidv4(),
      ownerGroup: "group3",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.equal(datasetWithPid.pid);
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0803: user with create dataset privileged groups cannot add a new raw dataset with specified invalid pid", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group3",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0804: user with create dataset privileged groups cannot add a new invalid raw dataset with specified pid", async () => {
    const invalidDatasetWithPid = {
      ...TestData.RawWrong_1,
      pid: uuidv4(),
      ownerGroup: "group3",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0805: user with create dataset privileged groups cannot add a new invalid raw dataset with specified invalid pid", async () => {
    const invalidDatasetWithInvalidPid = {
      ...TestData.RawWrong_1,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group3",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithInvalidPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0810: user with create dataset privileged groups can add a new raw dataset with different owner group", async () => {
    const newDataset = {
      ...TestData.RawCorrect,
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0820: user with create dataset privileged groups cannot add a new incomplete raw dataset with different owner group", async () => {
    const newDataset = {
      ...TestData.RawWrong_1,
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0830: user with create dataset privileged groups can add a new raw dataset with specified pid and different owner group", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: uuidv4(),
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("pid").and.equal(datasetWithPid.pid);
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
      });
  });

  it("0840: user with create dataset privileged groups cannot add a new raw dataset with specified invalid pid and different owner group", async () => {
    const datasetWithPid = {
      ...TestData.RawCorrect,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(datasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0850: user with create dataset privileged groups cannot add a new invalid raw dataset with specified pid and different owner group", async () => {
    const invalidDatasetWithPid = {
      ...TestData.RawWrong_1,
      pid: uuidv4(),
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });

  it("0860: user with create dataset privileged groups cannot add a new invalid raw dataset with specified invalid pid and different owner group", async () => {
    const invalidDatasetWithInvalidPid = {
      ...TestData.RawWrong_1,
      pid: "this-is-invalid-pid-1",
      ownerGroup: "group1",
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(invalidDatasetWithInvalidPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("pid");
      });
  });
});
