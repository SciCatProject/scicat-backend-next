/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

var accessTokenAdminIngestor = null;
var pid = null;
var minPid = null;
var randomPid = null;
var accessProposalToken = null;
var accessTokenArchiveManager = null;

var proposalId = null;

describe("1900: RawDataset: Raw Datasets", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Proposals").deleteMany({});
  });
  beforeEach(async() => {
    accessProposalToken = await utils.getToken(appUrl, {
      username: "proposalIngestor",
      password: TestData.Accounts["proposalIngestor"]["password"],
    });

    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });

    accessTokenArchiveManager = await utils.getToken(appUrl, {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
    });
  });

  it("0010: adds a new proposal", async () => {
    return request(appUrl)
      .post("/api/v3/Proposals")
      .send(TestData.ProposalCorrectComplete)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessProposalToken}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        proposalId = encodeURIComponent(res.body["proposalId"]);
      });
  });

  // check if dataset is valid
  it("0020: check if valid raw dataset is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryValidStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("0030: adds a new minimal raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrectMin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;

        minPid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("0040: adds a new raw dataset", async () => {
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
        res.body.should.have.property("instrumentId").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        pid = encodeURIComponent(res.body["pid"]);
      });
  });

  // check if dataset is valid
  it("0050: check if invalid raw dataset is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.RawWrong_1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryValidStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("0060: tries to add an incomplete raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawWrong_1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect("Content-Type", /json/)
      .expect(TestData.BadRequestStatusCode)
      .then((res) => {
        res.statusCode.should.not.be.equal(200);
      });
  });

  it("0070: tries to add a random data raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrectRandom)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect("Content-Type", /json/)
      .expect(TestData.EntryCreatedStatusCode)
      .then((res) => {
        res.body.should.have
          .property("datasetName")
          .and.equal(TestData.RawCorrectRandom.datasetName);

        randomPid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("0080: tries to add an incomplete raw dataset", async () => {
    const rawDatasetWithIncorrectEmail = {
      ...TestData.RawCorrectRandom,
      ownerEmail: "testIngestor@",
    };

    request(appUrl)
      .post("/api/v3/Datasets")
      .send(rawDatasetWithIncorrectEmail)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect("Content-Type", /json/)
      .expect(TestData.BadRequestStatusCode)
      .then((res) => {
        res.body.message.should.contain("ownerEmail");
      });

    rawDatasetWithIncorrectEmail.contactEmail = "testTest";

    request(appUrl)
      .post("/api/v3/Datasets")
      .send(rawDatasetWithIncorrectEmail)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect("Content-Type", /json/)
      .expect(TestData.BadRequestStatusCode)
      .then((res) => {
        res.body.message.should.contain("ownerEmail");
        res.body.message.should.contain("contactEmail");
      });

    rawDatasetWithIncorrectEmail.creationTime = "testTest";

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(rawDatasetWithIncorrectEmail)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect("Content-Type", /json/)
      .expect(TestData.BadRequestStatusCode)
      .then((res) => {
        res.body.message.should.contain("ownerEmail");
        res.body.message.should.contain("contactEmail");
        res.body.message.should.contain("creationTime");
      });
  });

  it("0090: tries to add a raw dataset with history field", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawWrong_2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect("Content-Type", /json/)
      .expect(TestData.BadRequestStatusCode)
      .then((res) => {
        res.statusCode.should.not.be.equal(200);
      });
  });

  it("0100: should fetch several raw datasets", async () => {
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
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  it("0110: should fetch this raw dataset", async () => {
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
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have
            .property("pid")
            .and.equal(decodeURIComponent(pid));
        })
    );
  });

  it("0120: should contain an array of facets", async () => {
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
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array");
        })
    );
  });

  it("0125: should update proposal of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchProposal1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("proposalId").and.be.string;
        res.body.should.have
          .property("proposalId")
          .and.be.equal(TestData.PatchProposal1["proposal"]);
      });
  });

  it("0130: should update comment of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchComment)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("comment").and.be.string;
      });
  });

  it("0140: should update data quality metrics of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchDataQualityMetrics)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("dataQualityMetrics");
      });
  });

  it("0150: should fail to update comment of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchCommentInvalid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.BadRequestStatusCode)
      .then((res) => {
        res.body.message.should.contain("comment");
        res.body.message.should.contain("isString");
      });
  });

  it("0160: should fail to update data quality metrics of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/datasets/" + pid)
      .send(TestData.PatchDataQualityMetricsInvalid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.BadRequestStatusCode)
      .then((res) => {
        res.body.message.should.contain("dataQualityMetrics");
        res.body.message.should.contain("isNumber");
      });
  });

  it("0170: should delete this raw dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0190: should delete this raw dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + randomPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0200: should delete this minimal raw dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + minPid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0210: should delete this proposal", async () => {
    return request(appUrl)
      .delete("/api/v3/Proposals/" + proposalId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });
});
