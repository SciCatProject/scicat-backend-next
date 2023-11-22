/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

var accessToken = null;
var pid = null;
var minPid = null;
var accessProposalToken = null;
var accessTokenArchiveManager = null;

var proposalId = null;

describe("RawDataset: Raw Datasets", () => {
  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessToken = tokenVal;
        utils.getToken(
          appUrl,
          {
            username: "proposalIngestor",
            password: "aman",
          },
          (tokenVal) => {
            accessProposalToken = tokenVal;
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
  });

  it("adds a new proposal", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalCorrectComplete)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessProposalToken}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        proposalId = encodeURIComponent(res.body["proposalId"]);
      });
  });

  // check if dataset is valid
  it("check if valid raw dataset is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("adds a new minimal raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrectMin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;

        minPid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("adds a new raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        pid = encodeURIComponent(res.body["pid"]);
      });
  });

  // check if dataset is valid
  it("check if invalid raw dataset is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.RawWrong_1)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("tries to add an incomplete raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawWrong_1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .then((res) => {
        res.statusCode.should.not.be.equal(200);
      });
  });

  it("tries to add an random data raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrectRandom)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.should.have
          .property("datasetName")
          .and.equal(TestData.RawCorrectRandom.datasetName);
      });
  });
  it("tries to add an incomplete raw dataset", async () => {
    const rawDatasetWithIncorrectEmail = {
      ...TestData.RawCorrectRandom,
      ownerEmail: "testIngestor@",
    };

    request(appUrl)
      .post("/api/v3/Datasets")
      .send(rawDatasetWithIncorrectEmail)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((res) => {
        res.body.message.should.contain("ownerEmail");
      });

    rawDatasetWithIncorrectEmail.contactEmail = "testTest";

    request(appUrl)
      .post("/api/v3/Datasets")
      .send(rawDatasetWithIncorrectEmail)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((res) => {
        res.body.message.should.contain("ownerEmail");
        res.body.message.should.contain("contactEmail");
      });

    rawDatasetWithIncorrectEmail.creationTime = "testTest";

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(rawDatasetWithIncorrectEmail)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((res) => {
        res.body.message.should.contain("ownerEmail");
        res.body.message.should.contain("contactEmail");
        res.body.message.should.contain("creationTime");
      });
  });

  it("tries to add a raw dataset with history field", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawWrong_2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .then((res) => {
        res.statusCode.should.not.be.equal(200);
      });
  });

  it("should fetch several raw datasets", async () => {
    const filter = {
      where: {
        type: "raw",
      },
      limit: 2,
    };

    return request(appUrl)
      .get(
        `/api/v3/Datasets?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .query(JSON.stringify(filter))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  it("should fetch this raw dataset", async () => {
    const filter = {
      where: {
        pid: decodeURIComponent(pid),
      },
    };

    return (
      request(appUrl)
        // eslint-disable-next-line prettier/prettier
        .get(
          `/api/v3/Datasets/findOne?filter=${encodeURIComponent(
            JSON.stringify(filter),
          )}`,
        )
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have
            .property("pid")
            .and.equal(decodeURIComponent(pid));
        })
    );
  });

  it("should contain an array of facets", async () => {
    const filter = {
      ownerGroup: ["p11114"],
    };

    return (
      request(appUrl)
        // eslint-disable-next-line prettier/prettier
        .get(
          `/api/v3/datasets/fullfacet?filter=${encodeURIComponent(
            JSON.stringify(filter),
          )}`,
        )
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array");
        })
    );
  });

  it("should update comment of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchComment)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("comment").and.be.string;
      });
  });

  it("should update data quality metrics of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchDataQualityMetrics)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("dataQualityMetrics");
      });
  });

  it("should fail to update comment of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchCommentInvalid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(400)
      .then((res) => {
        res.body.message.should.contain("comment");
        res.body.message.should.contain("isString");
      });
  });

  it("should fail to update data quality metrics of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchDataQualityMetricsInvalid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(400)
      .then((res) => {
        res.body.message.should.contain("dataQualityMetrics");
        res.body.message.should.contain("isNumber");
      });
  });

  it("should delete this raw dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete this minimal raw dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + minPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete this proposal", async () => {
    return request(appUrl)
      .delete("/api/v3/Proposals/" + proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessProposalToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
