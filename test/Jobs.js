/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

var accessTokenAdminIngestor = null;
var accessTokenArchiveManager = null;

var pid1 = null;
var pid2 = null;
var datasetLiveCycle1 = {};
var datasetLiveCycle2 = {};
var archiveJob = null;
var retrieveJob = null;
var publicJob = null;

var archiveJobId = null;
var retrieveJobId = null;
var publicJobIds = [];
var origDatablockId = null;

describe.skip("1100: Jobs: Test New Job Model", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Job").deleteMany({});
  });

  beforeEach(async () => {
    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });

    accessTokenUser1 = await utils.getToken(appUrl, {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
    });

    accessTokenUser3 = await utils.getToken(appUrl, {
      username: "user3",
      password: TestData.Accounts["user3"]["password"],
    });

    accessTokenUser51 = await utils.getToken(appUrl, {
      username: "user5.1",
      password: TestData.Accounts["user5.1"]["password"],
    });

    accessTokenUser52 = await utils.getToken(appUrl, {
      username: "user5.2",
      password: TestData.Accounts["user5.2"]["password"],
    });

    accessTokenAdmin = await utils.getToken(appUrl, {
      username: "admin",
      password: TestData.Accounts["admin"]["password"],
    });

    accessTokenArchiveManager = await utils.getToken(appUrl, {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
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
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        var pidtest = res.body["pid"];
        archiveJob.datasetList[0].pid = pidtest;
        retrieveJob.datasetList[0].pid = pidtest;
        publicJob.datasetList[0].pid = pidtest;
        pid1 = encodeURIComponent(res.body["pid"]);
      });
  });

  it("0020: adds another new raw dataset", async () => {
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
        var pidtest = res.body["pid"];
        archiveJob.datasetList[1].pid = pidtest;
        retrieveJob.datasetList[1].pid = pidtest;
        publicJob.datasetList[1].pid = pidtest;
        pid2 = encodeURIComponent(res.body["pid"]);
      });
  });

  it("0030: Adds a new archive job request without authentication, which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(archiveJob)
      .set("Accept", "application/json")
      .expect(TestData.UnauthorizedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("0040: Adds a new archive job request", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(archiveJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        archiveJobId = res.body["id"];
      });
  });

  it("0050: Adds a new archive job request contains empty datasetList, which should fail", async () => {
    const empty = { ...TestData.ArchiveJob };
    empty.datasetList = [];
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(empty)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("0060: Adds a new archive job request on non exist dataset which should fail", async () => {
    let nonExistDataset = {
      ...TestData.ArchiveJob,
      datasetList: [
        {
          pid: "dummy",
          files: [],
        },
      ],
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(nonExistDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res, err) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property("message");
      });
  });

  it("0070: Check if dataset 1 was updated by job request", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.archivable")
          .and.equal(false);
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(false);
        res.body.should.have.nested
          .property("datasetlifecycle.archiveStatusMessage")
          .and.equal("scheduledForArchiving");
        res.body.should.have.nested
          .property("datasetlifecycle.publishable")
          .and.equal(false);

        datasetLiveCycle1 = res.body.datasetlifecycle;
      });
  });
  it("0080: Check if dataset 2 was updated by job request", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.archivable")
          .and.equal(false);
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(false);
        res.body.should.have.nested
          .property("datasetlifecycle.archiveStatusMessage")
          .and.equal("scheduledForArchiving");
        res.body.should.have.nested
          .property("datasetlifecycle.publishable")
          .and.equal(false);
        datasetLiveCycle2 = res.body.datasetlifecycle;
      });
  });

  it("0090: Create retrieve job request on same dataset, which should fail as well because not yet retrievable", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(TestData.RetrieveJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res, err) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property("error");
      });
  });

  it("0100: Send an update status to dataset 1, simulating the archive system response", async () => {
    return request(appUrl)
      .patch("/api/v3/Datasets/" + pid1)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle1,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
        res.body.should.have.nested
          .property("datasetlifecycle.publishable")
          .and.equal(false);
      });
  });
  it("0110: Send an update status to dataset 2, simulating the archive system response", async () => {
    return request(appUrl)
      .patch("/api/v3/Datasets/" + pid2)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle2,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
        res.body.should.have.nested
          .property("datasetlifecycle.publishable")
          .and.equal(false);
      });
  });

  // change policy to suppress emails
  it("0120: Disable notification by email", async () => {
    return request(appUrl)
      .post("/api/v3/Policies/updateWhere")
      .send({
        ownerGroupList: TestData.RawCorrect.ownerGroup,
        data: {
          archiveEmailNotification: false,
          retrieveEmailNotification: false,
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .set("Content-Type", "application/x-www-form-urlencoded")
      .expect(TestData.SuccessfulPostStatusCode)
      .then((res) => {
        console.log("Result policy update:", res.body);
        //res.body.not.equal({});
      });
  });

  it("0130: Adds a new archive job request for same data which should fail", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(TestData.ArchiveJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res, err) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property("error");
      });
  });

  it("0140: Send an update status to the archive job request, signal successful archiving", async () => {
    return request(appUrl)
      .patch("/api/v3/Jobs/" + archiveJobId)
      .send({
        jobStatusMessage: "finishedSuccessful",
        jobResultObject: {
          status: "okay",
          message: "Archive job was finished successfully",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0150: Adds a new retrieve job request on same dataset, which should succeed now", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(TestData.RetrieveJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res, err) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property("id");
        retrieveJobId = res.body["id"];
      });
  });

  it("0160: Read contents of dataset 1 after retrieve job and make sure that still retrievable", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
      });
  });

  it("0170: Send an update status to the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/Datasets/" + pid1)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle1,
          retrieveReturnMessage: {
            text: "Some dummy retrieve message",
          },
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested.property(
          "datasetlifecycle.retrieveReturnMessage",
        );
      });
  });

  it("0180: Send an update status to the dataset, simulating the archive system response of finished job with partial failure", async () => {
    return request(appUrl)
      .patch("/api/v3/Datasets/" + pid1)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle1,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
        res.body.should.have.nested
          .property("datasetlifecycle.publishable")
          .and.equal(false);
      });
  });

  it("0190: Send an update status message to the Job", async () => {
    return request(appUrl)
      .patch("/api/v3/Jobs/" + retrieveJobId)
      .send({
        jobStatusMessage: "finishedUnsuccessful",
        jobResultObject: {
          status: "bad",
          message: "System A failed",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("jobResultObject");
      });
  });

  it("0200: Send an update status to the datasets, simulating the archive system response of successful job", async () => {
    await request(appUrl)
      .patch("/api/v3/Datasets/" + pid1)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle1,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
      });

    return request(appUrl)
      .patch("/api/v3/Datasets/" + pid2)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle2,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
      });
  });

  it("0210: Send an update status message to the Job", async () => {
    return request(appUrl)
      .patch("/api/v3/Jobs/" + retrieveJobId)
      .send({
        jobStatusMessage: "finishedSuccessful",
        jobResultObject: {
          status: "okay",
          message: "Job archiving worked",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("jobStatusMessage").and.be.string;
      });
  });

  // NOTE: Missing endpoint!!! /api/v3/Jobs/update?where. Do we need one???
  // it("Bulk update Job status prepare to trigger sending email mechanism", async () => {
  //   const filter = {
  //     id: {
  //       inq: [archiveJobId, retrieveJobId],
  //     },
  //   };
  //   return request(appUrl)
  //     .post("/api/v3/Jobs/update?where=" + JSON.stringify(filter))
  //     .send({
  //       jobStatusMessage: "test",
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("count").and.equal(2);
  //       return;
  //     });
  // });

  // NOTE: Missing endpoint!!! /api/v3/Jobs/update?where. Do we need one???
  // it("Bulk update Job status, should send out email", async () => {
  //   var filter = {
  //     id: {
  //       inq: [archiveJobId, retrieveJobId],
  //     },
  //   };
  //   return request(appUrl)
  //     .post("/api/v3/Jobs/update?where=" + JSON.stringify(filter))
  //     .send({
  //       jobStatusMessage: "finishedSuccessful",
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("count").and.equal(2);
  //       //setTimeout(done, 3000);
  //       return;
  //     });
  // });

  it("0220: adds a new origDatablock", async () => {
    return request(appUrl)
      .post(`/api/v3/datasets/${pid1}/OrigDatablocks`)
      .send(TestData.OrigDataBlockCorrect1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("size")
          .and.equal(TestData.OrigDataBlockCorrect1.size);
        res.body.should.have.property("id").and.be.string;
        origDatablockId = res.body["id"];
      });
  });

  it("0230: Adds a new public job request on private datasets, which should fails", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(publicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
      });
  });

  it("0240: Set to true for one of the dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/Datasets/" + pid1)
      .send({
        isPublished: true,
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested.property("isPublished").and.equal(true);
      });
  });

  it("0250: Adds a new public job request on one public and one private dataset, which should fails", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(publicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
      });
  });

  it("0260: Update isPublished to true on second dataset", async () => {
    return request(appUrl)
      .patch("/api/v3/Datasets/" + pid2)
      .send({
        isPublished: true,
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested.property("isPublished").and.equal(true);
      });
  });

  it("0270: Adds a new public job request without authentication", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(publicJob)
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        publicJobIds.push(res.body["id"]);
      });
  });

  it("0280: Adds a new public job request with authentication", async () => {
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(publicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        publicJobIds.push(res.body["id"]);
      });
  });

  it("0290: Send an update status to the public job request, signal finished job with partial failure", async () => {
    return request(appUrl)
      .patch("/api/v3/Jobs/" + publicJobIds[0])
      .send({
        jobStatusMessage: "finishedUnsuccessful",
        jobResultObject: {
          good: [
            {
              pid: decodeURIComponent(pid1),
              downloadLink: "Globus link",
            },
          ],
          bad: [
            {
              pid: decodeURIComponent(pid2),
              downloadLink: "Globus link",
              availableFiles: [
                {
                  file: "N1039-1.tif",
                  reason: "ok",
                },
                {
                  file: "N1039-2.tif",
                  reason: "ok",
                },
              ],
              unavailableFiles: [
                {
                  file: "N1039-3.tif",
                  reason: "no space in destination",
                },
              ],
            },
          ],
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0300: Adds a new public job request to download some selected files", async () => {
    publicJob.datasetList[0].files = ["N1039-1.tif", "N1039-2.tif"];
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(publicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        //reset
        publicJob.datasetList[0].files = [];

        res.body.should.have.property("type").and.be.string;
        publicJobIds.push(res.body["id"]);
      });
  });

  it("0310: Send an update status to the public job request, signal successful job", async () => {
    return request(appUrl)
      .patch("/api/v3/Jobs/" + publicJobIds[1])
      .send({
        jobStatusMessage: "finishedSuccessful",
        jobResultObject: {
          good: [
            {
              pid: pid1,
              downloadLink: "Globus link 1",
            },
            {
              pid: pid2,
              downloadLink: "Globus link 2",
            },
          ],
          bad: [],
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  // NOTE: We don't have put endpoint on the jobs here, only patch.
  // Patch without id is returning 404 nor found. Maybe this will be valid one if we need and add put endpoint later?
  // it("Add new job using put, which should fails. Ensure that adding new job without authentication using put is not possible ", async () => {
  //   return request(appUrl)
  //     .put("/api/v3/Jobs/")
  //     .send(testPublicJob)
  //     .set("Accept", "application/json")
  //     .expect(401)
  //     .expect("Content-Type", /json/);
  // });

  it("0320: Adds a new public job request with to download some selected files that dont exist, which should fail", async () => {
    publicJob.datasetList[0].files = ["N1039-1.tif", "N1039-101.tif"];
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(publicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        //reset
        publicJob.datasetList[0].files = [];

        res.should.have.property("error").and.be.string;
      });
  });

  it("0330: should delete the archive Job", async () => {
    return request(appUrl)
      .delete("/api/v3/Jobs/" + archiveJobId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0340: should delete the retrieve Job", async () => {
    return request(appUrl)
      .delete("/api/v3/Jobs/" + retrieveJobId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode);
  });

  publicJobIds.forEach((jobId) => {
    it("0350: should delete the public Job" + jobId, async () => {
      return request(appUrl)
        .delete("/api/v3/Jobs/" + jobId)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
        .expect(TestData.SuccessfulDeleteStatusCode)
        .expect("Content-Type", /json/);
    });
  });

  it("0360: should delete the originDataBlock", async () => {
    return request(appUrl)
      .delete(`/api/v3/datasets/${pid1}/OrigDatablocks/` + origDatablockId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode);
  });

  it("0370: should delete the dataset #1", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0390: should delete the dataset #2", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });
});
