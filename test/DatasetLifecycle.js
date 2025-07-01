"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

var accessTokenAdminIngestor = null;
var accessTokenArchiveManager = null;
var accessTokenUser1 = null;
var accessTokenUser2 = null;

var pidRaw1 = null;
var pidRaw2 = null;
var rawDatasetWithMetadataPid = null;
var policyIds = null;
const raw2 = { ...TestData.RawCorrect };

describe("0500: DatasetLifecycle: Test facet and filter queries", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Policy").deleteMany({});
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
    accessTokenUser1 = await utils.getToken(appUrl, {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
    });

    accessTokenUser2 = await utils.getToken(appUrl, {
      username: "user2",
      password: TestData.Accounts["user2"]["password"],
    });
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
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(res);
          }, 2000);
        });
      })
      .then((res) => {
        res.body.should.have.property("owner").and.be.a("string");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.a("string");
        // store link to this dataset in datablocks
        // NOTE: Encoding the pid because it might contain some special characters.
        pidRaw1 = encodeURIComponent(res.body["pid"]);
      });
  }).timeout(5000);

  it("0020: adds another new raw dataset", async () => {
    // modify owner
    raw2.ownerGroup = "p12345";
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(raw2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(res);
          }, 2000);
        });
      })
      .then((res) => {
        res.body.should.have.property("owner").and.be.a("string");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.a("string");
        // store link to this dataset in datablocks
        // NOTE: Encoding the pid because it might contain some special characters.
        pidRaw2 = encodeURIComponent(res.body["pid"]);
      });
  }).timeout(5000);

  it("0030: Should return datasets with complex join query fulfilled", async () => {
    return request(appUrl)
      .get(
        "/api/v3/Datasets/fullquery?fields=" +
          encodeURIComponent(
            JSON.stringify(TestData.DatasetLifecycle_query_1.fields),
          ) +
          "&limits=" +
          encodeURIComponent(
            JSON.stringify(TestData.DatasetLifecycle_query_1.limits),
          ),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.is.not.empty;
        res.body[0]["datasetlifecycle"].should.have
          .property("archiveStatusMessage")
          .and.equal("datasetCreated");
      });
  });

  it("0040: Should return no datasets, because number of hits exhausted", async () => {
    return request(appUrl)
      .get(
        "/api/v3/Datasets/fullquery?fields=" +
          encodeURIComponent(
            JSON.stringify(TestData.DatasetLifecycle_query_2.fields),
          ) +
          "&limits=" +
          encodeURIComponent(
            JSON.stringify(TestData.DatasetLifecycle_query_2.limits),
          ),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.is.empty;
      });
  });

  it("0050: Should return facets with complex join query fulfilled", async () => {
    return request(appUrl)
      .get(
        "/api/v3/Datasets/fullfacet?fields=" +
          encodeURIComponent(
            JSON.stringify(TestData.DatasetLifecycle_query_3.fields),
          ) +
          "&facets=" +
          encodeURIComponent(
            JSON.stringify(TestData.DatasetLifecycle_query_3.facets),
          ),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/);
  });

  // Note: make the tests with PUT instead of patch as long as replaceOnPut false
  it("0060: Should update archive status message from archiveManager account", async () => {
    return request(appUrl)
      .patch("/api/v3/Datasets/" + pidRaw1)
      .send({
        datasetlifecycle: {
          archiveStatusMessage: "dataArchivedOnTape",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.archiveStatusMessage")
          .and.equal("dataArchivedOnTape");
      });
  });

  // PUT /datasets without specifying the id does not exist anymore
  it("0070: Should update the datasetLifecycle information for multiple datasets", async () => {
    var filter = {
      pid: decodeURIComponent(pidRaw1),
    };
    return request(appUrl)
      .patch("/api/v3/Datasets/" + pidRaw1 + "?where=" + JSON.stringify(filter))
      .send({
        datasetlifecycle: {
          archiveStatusMessage: "justAnotherTestMessage",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property(
            "history[0].datasetlifecycle.previousValue.archiveStatusMessage",
          )
          .and.equal("dataArchivedOnTape");
        res.body.should.have.nested
          .property(
            "history[0].datasetlifecycle.currentValue.archiveStatusMessage",
          )
          .and.equal("justAnotherTestMessage");
      });
  });

  it("0080: The history status should now include the last change for the first raw dataset", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pidRaw1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property(
            "history[0].datasetlifecycle.previousValue.archiveStatusMessage",
          )
          .and.equal("dataArchivedOnTape");
        res.body.should.have.nested
          .property(
            "history[0].datasetlifecycle.currentValue.archiveStatusMessage",
          )
          .and.equal("justAnotherTestMessage");
      });
  });

  it("0090: check for the 2 default policies to have been created", async () => {
    // Query only newly created ones by the tests. This way we prevent removing all the policies that exist before the tests were run.
    const start = new Date();
    start.setHours(start.getHours(), 0, 0, 0);
    const filter = {
      where: {
        createdAt: { $gte: start },
        ownerGroup: { $in: [TestData.RawCorrect.ownerGroup, raw2.ownerGroup] },
      },
    };

    return request(appUrl)
      .get(
        `/api/v3/Policies?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
        policyIds = res.body.map((x) => x["_id"]);
      });
  });

  it("0100: should delete the two policies", async () => {
    for (const item of policyIds) {
      await request(appUrl)
        .delete("/api/v3/policies/" + item)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
        .expect(TestData.SuccessfulDeleteStatusCode);
    }
  });

  it("0110: should delete the newly created dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pidRaw1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode);
  });

  it("0120: should delete the newly created dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pidRaw2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode);
  });

  describe("Dataset Lifecycle: Test dataset lifecycle endpoints", () => {
    it("0100: should be able to add a new dataset with non-empty datasetLifecycle", async () => {
      const newDataset = {
        ...TestData.RawCorrect,
        ownerGroup: "group2",
        datasetlifecycle: {
          archivable: false,
          retrievable: true,
          publishable: true,
        },
      };
      return request(appUrl)
        .post("/api/v3/datasets")
        .send(newDataset)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("owner").and.be.a("string");
          res.body.should.have.property("type").and.equal("raw");
          res.body.should.have.property("pid").and.be.a("string");
          res.body.should.have
            .property("scientificMetadata")
            .and.be.a("object");
          rawDatasetWithMetadataPid = res.body.pid;
        });
    });

    it("0101: should fetch dataset's lifecycle by id as admin", () => {
      return request(appUrl)
        .get(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("archivable").and.equal(false);
          res.body.should.have.property("retrievable").and.equal(true);
          res.body.should.have.property("publishable").and.equal(true);
          res.body.should.have
            .property("retrieveIntegrityCheck")
            .and.equal(false);
        });
    });

    it("0102: should fetch dataset's lifecycle by id as archive manager", () => {
      return request(appUrl)
        .get(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("archivable").and.equal(false);
          res.body.should.have.property("retrievable").and.equal(true);
          res.body.should.have.property("publishable").and.equal(true);
          res.body.should.have
            .property("retrieveIntegrityCheck")
            .and.equal(false);
        });
    });

    it("0103: should not be able to update dataset when it's trying to update dataset lifecycle as user of UPDATE_DATASET_LIFECYCLE_GROUPS", () => {
      const updatedDataset = {
        datasetlifecycle: {
          retrievable: false,
        },
        datasetName: "Updated dataset name",
      };

      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}`,
        )
        .send(updatedDataset)
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0104: should be able to update dataset when it's trying to update dataset lifecycle as owner of the dataset", () => {
      const updatedDataset = {
        datasetlifecycle: {
          retrievable: false,
        },
        datasetName: "New dataset name",
      };

      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}`,
        )
        .send(updatedDataset)
        .auth(accessTokenUser2, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have
            .property("datasetName")
            .and.equal("New dataset name");
          res.body.datasetlifecycle.should.have
            .property("retrievable")
            .and.equal(false);
        });
    });

    it("0105: should not be able to update lifecycle of dataset when it's not providing any body", () => {
      const updatedDataset = {};

      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .send(updatedDataset)
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .and.equal(`dataset lifecycle DTO must not be empty`);
        });
    });

    it("0106: should not be able to update lifecycle of dataset when dataset is not found", () => {
      const updatedDataset = {
        retrievable: true,
      };

      return request(appUrl)
        .patch(`/api/v3/datasets/fakePid/datasetlifecycle`)
        .send(updatedDataset)
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.NotFoundStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .and.equal(`dataset with pid fakePid not found`);
        });
    });

    it("0107: should be able to update lifecycle of dataset as user from UPDATE_DATASET_LIFECYCLE_GROUPS", () => {
      const updatedDatasetLifecycle = {
        archivable: true,
        retrievable: true,
        publishable: true,
        dateOfDiskPurging: "2017-01-12T00:00:00.000Z",
        archiveRetentionTime: "2015-02-10T00:00:00.000Z",
        dateOfPublishing: "2003-02-12T00:00:00.000Z",
        publishedOn: "2020-09-12T07:00:00.000Z",
        isOnCentralDisk: true,
        archiveStatusMessage: "dataset archived",
        retrieveStatusMessage: "dataset retrieved",
        retrieveIntegrityCheck: true,
        retrieveReturnMessage: { message: "not ok", code: 400 },
      };
      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .send(updatedDatasetLifecycle)
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.be.deep.include(updatedDatasetLifecycle);
        });
    });

    it("0108: should  be able to update lifecycle of dataset, changes from previous update should persist", () => {
      const updatedDatasetLifecycle = {
        publishable: false,
      };
      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .send(updatedDatasetLifecycle)
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("archivable").and.equal(true);
          res.body.should.have.property("retrievable").and.equal(true);
          res.body.should.have.property("publishable").and.equal(false);
          res.body.should.have
            .property("retrieveIntegrityCheck")
            .and.equal(true);
        });
    });

    it("0109: should  be able to update lifecycle of dataset, changes from previous update should persist(2)", () => {
      const updatedDataset = {
        retrievable: false,
        archiveStatusMessage: "dataset was archived",
        archiveRetentionTime: "2015-02-10T00:00:00.000Z",
        retrieveReturnMessage: { message: "not retrievable", code: 400 },
      };
      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .send(updatedDataset)
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("archivable").and.equal(true);
          res.body.should.have.property("retrievable").and.equal(false);
          res.body.should.have.property("publishable").and.equal(false);
          res.body.should.have
            .property("retrieveIntegrityCheck")
            .and.equal(true);
          res.body.should.have
            .property("archiveStatusMessage")
            .and.equal("dataset was archived");
          res.body.should.have
            .property("archiveRetentionTime")
            .and.equal("2015-02-10T00:00:00.000Z");
          res.body.should.have
            .property("retrieveReturnMessage")
            .and.deep.equal({ message: "not retrievable", code: 400 });
        });
    });

    it("0110: shouldn't  be able to update lifecycle of dataset if it's not changing the body of datasetlifecycle", () => {
      const updatedDataset = {
        archivable: true,
      };

      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .send(updatedDataset)
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.ConflictStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object"); //dataset: ${foundDataset.pid} already has the same lifecycle
          res.body.should.have
            .property("message")
            .and.equal(
              `dataset: ${rawDatasetWithMetadataPid} already has the same lifecycle`,
            );
        });
    });

    it("0111: should  be able to update lifecycle of dataset as a user from admin groups", () => {
      const updatedDataset = {
        publishable: true,
      };

      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .send(updatedDataset)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("archivable").and.equal(true);
          res.body.should.have.property("retrievable").and.equal(false);
          res.body.should.have.property("publishable").and.equal(true);
        });
    });

    it("0112: should  be able to update lifecycle of dataset owned by this user's group", () => {
      const updatedDataset = {
        archivable: false,
      };

      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .send(updatedDataset)
        .auth(accessTokenUser2, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0113: should not be able to update lifecycle of dataset when not in appropriate group", () => {
      const updatedDataset = {
        archivable: true,
      };

      return request(appUrl)
        .patch(
          `/api/v3/datasets/${encodeURIComponent(rawDatasetWithMetadataPid)}/datasetlifecycle`,
        )
        .send(updatedDataset)
        .auth(accessTokenUser1, { type: "bearer" })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });
  });
});
