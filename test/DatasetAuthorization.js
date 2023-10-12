/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const sandbox = require("sinon").createSandbox();

let accessTokenIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser2 = null,
  accessTokenUser3 = null,
  accessTokenArchiveManager = null;

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

describe("DatasetAuthorization: Test access to dataset", () => {
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
  });

  afterEach((done) => {
    sandbox.restore();
    done();
  });

  it("adds dataset 1", async () => {
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

  it("adds dataset 2", async () => {
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

  it("adds dataset 3", async () => {
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

  it("adds a new origDatablock on the published dataset", async () => {
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

  it("adds a new datablock on the published dataset", async () => {
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

  it("adds a new attachment on the published dataset", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${encodedDatasetPid1}/attachments`)
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/);
  });

  it("list of public datasets, aka as unauthenticated user", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        res.body[0]["pid"].should.be.equal(datasetPid1);
      });
  });

  it("access public dataset as unauthenticated user", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body["pid"].should.be.equal(datasetPid1);
      });
  });

  it("access private dataset as unauthenticated user", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("list of datasets for ingestor", async () => {
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

  it("datasets counts for ingestor", async () => {
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

  it("access dataset 1 as ingestor", async () => {
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

  it("full query for datasets for ingestor", async () => {
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

  it("access dataset 2 as ingestor", async () => {
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

  it("access dataset 3 as ingestor", async () => {
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

  it("list of datasets for user 1", async () => {
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

  it("datasets count for user 1", async () => {
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

  it("access dataset 1 as user 1", async () => {
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

  it("access dataset 2 as user 1", async () => {
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

  it("access dataset 3 as user 1", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("full query for datasets for user 1", async () => {
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

  it("list of datasets for user 2", async () => {
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

  it("datasets count for user 2", async () => {
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

  it("access dataset 1 as user 2", async () => {
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

  it("access dataset 2 as user 2", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect("Content-Type", /json/)
      .expect(403);
  });

  it("access dataset 3 as user 2", async () => {
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

  it("full query for datasets for user 2", async () => {
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

  it("list of datasets for user 3", async () => {
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

  it("datasets count for user 3", async () => {
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

  it("access dataset 1 as user 3", async () => {
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

  it("access dataset 2 as user 3", async () => {
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

  it("access dataset 3 as user 3", async () => {
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

  it("full query for datasets for user 3", async () => {
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

  it("update dataset 2 to be published", async () => {
    return request(appUrl)
      .patch(`/api/v3/Datasets/${encodedDatasetPid2}`)
      .send({ isPublished: true })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("another full query for datasets for user 2 ", async () => {
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

  it("full facet for datasets for user 2", async () => {
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

  it("access dataset 1 origdatablocks as user 3", async () => {
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

  it("access dataset 1 datablocks as user 3", async () => {
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

  it("access dataset 1 attachments as user 3", async () => {
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

  it("access dataset 1 thumbnail as user 3", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + encodedDatasetPid1 + "/thumbnail")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect("Content-Type", /json/)
      .expect(200);
  });

  it("should delete dataset 1", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + encodedDatasetPid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete dataset 2", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + encodedDatasetPid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete dataset 3", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + encodedDatasetPid3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
