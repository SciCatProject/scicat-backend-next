"use strict";

var request = require("supertest");
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

var accessTokenIngestor = null;
var accessTokenArchiveManager = null;

var pid1 = null;
var pid2 = null;
var datasetLiveCycle1 = {};
var datasetLiveCycle2 = {};
var archiveJobId = null;
var retrieveJobId = null;
var publicJobIds = [];
var origDatablockId = null;
var testraw = {
  principalInvestigator: "bertram.astor@grumble.com",
  endTime: "2011-09-14T06:31:25.000Z",
  creationLocation: "/SU/XQX/RAMJET",
  dataFormat: "Upchuck pre 2017",
  scientificMetadata: {
    beamlineParameters: {
      Monostripe: "Ru/C",
      "Ring current": {
        v: 0.402246,
        u: "A",
      },
      "Beam energy": {
        v: 22595,
        u: "eV",
      },
    },
    detectorParameters: {
      Objective: 20,
      Scintillator: "LAG 20um",
      "Exposure time": {
        v: 0.4,
        u: "s",
      },
    },
    scanParameters: {
      "Number of projections": 1801,
      "Rot Y min position": {
        v: 0,
        u: "deg",
      },
      "Inner scan flag": 0,
      "File Prefix": "817b_B2_",
      "Sample In": {
        v: 0,
        u: "m",
      },
      "Sample folder": "/ramjet/817b_B2_",
      "Number of darks": 10,
      "Rot Y max position": {
        v: 180,
        u: "deg",
      },
      "Angular step": {
        v: 0.1,
        u: "deg",
      },
      "Number of flats": 120,
      "Sample Out": {
        v: -0.005,
        u: "m",
      },
      "Flat frequency": 0,
      "Number of inter-flats": 0,
    },
  },
  owner: "Bertram Astor",
  ownerEmail: "bertram.astor@grumble.com",
  orcidOfOwner: "unknown",
  contactEmail: "bertram.astor@grumble.com",
  sourceFolder: "/iramjet/tif/",
  size: 0,
  creationTime: "2011-09-14T06:08:25.000Z",
  description: "The ultimate test",
  isPublished: false,
  ownerGroup: "p10029",
  accessGroups: [],
  proposalId: "10.540.16635/20110123",
  keywords: ["sls", "protein"],
  type: "raw",
};

var testArchiveJob = {
  emailJobInitiator: "scicatarchivemanger@psi.ch",
  type: "archive",
  jobStatusMessage: "jobForwarded",
  datasetList: [
    {
      pid: "dummy",
      files: [],
    },
    {
      pid: "dummy",
      files: [],
    },
  ],
  jobResultObject: {
    status: "okay",
    message: "All systems okay",
  },
};

var testRetrieveJob = {
  emailJobInitiator: "scicatarchivemanger@psi.ch",
  type: "retrieve",
  jobStatusMessage: "jobForwarded",
  datasetList: [
    {
      pid: "dummy",
      files: [],
    },
    {
      pid: "dummy",
      files: [],
    },
  ],
  jobResultObject: {
    status: "okay",
    message: "All systems okay",
  },
};

var testPublicJob = {
  emailJobInitiator: "firstname.lastname@gmail.com",
  type: "public",
  jobStatusMessage: "jobSubmitted",
  datasetList: [
    {
      pid: "dummy",
      files: [],
    },
    {
      pid: "dummy",
      files: [],
    },
  ],
};

const app = "http://localhost:3000";

describe("Jobs: Test New Job Model", () => {
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
  });

  it("adds a new raw dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(testraw)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        var pidtest = res.body["pid"];
        testArchiveJob.datasetList[0].pid = pidtest;
        testRetrieveJob.datasetList[0].pid = pidtest;
        testPublicJob.datasetList[0].pid = pidtest;
        pid1 = res.body["pid"];
      });
  });

  it("adds another new raw dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(testraw)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        // store link to this dataset in datablocks
        var pidtest = res.body["pid"];
        testArchiveJob.datasetList[1].pid = pidtest;
        testRetrieveJob.datasetList[1].pid = pidtest;
        testPublicJob.datasetList[1].pid = pidtest;
        pid2 = res.body["pid"];
      });
  });

  it("Adds a new archive job request without authentication, which should fail", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testArchiveJob)
      .set("Accept", "application/json")
      .expect(401)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("Adds a new archive job request", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testArchiveJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        archiveJobId = res.body["id"];
      });
  });

  it("Adds a new archive job request contains empty datasetList, which should fail", async () => {
    const empty = { ...testArchiveJob };
    empty.datasetList = [];
    return request(app)
      .post("/api/v3/Jobs")
      .send(empty)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.have.property("error");
      });
  });

  it("Adds a new archive job request on non exist dataset which should fail", async () => {
    let nonExistDataset = {
      ...testArchiveJob,
      datasetList: [
        {
          pid: "dummy",
          files: [],
        },
      ],
    };

    return request(app)
      .post("/api/v3/Jobs")
      .send(nonExistDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res, err) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property("message");
      });
  });

  it("Check if dataset 1 was updated by job request", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + pid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
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
  it("Check if dataset 2 was updated by job request", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + pid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
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

  it("Create retrieve job request on same dataset, which should fail as well because not yet retrievable", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testRetrieveJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(409)
      .expect("Content-Type", /json/)
      .then((res, err) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property("error");
      });
  });

  it("Send an update status to dataset 1, simulating the archive system response", async () => {
    return request(app)
      .put("/api/v3/Datasets/" + pid1)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle1,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
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
  it("Send an update status to dataset 2, simulating the archive system response", async () => {
    return request(app)
      .put("/api/v3/Datasets/" + pid2)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle2,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
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
  it("Disable notification by email", async () => {
    return request(app)
      .post("/api/v3/Policies/updateWhere")
      .send({
        ownerGroupList: testraw.ownerGroup,
        data: {
          archiveEmailNotification: false,
          retrieveEmailNotification: false,
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .set("Content-Type", "application/x-www-form-urlencoded")
      .expect(200)
      .then((res) => {
        console.log("Result policy update:", res.body);
      });
  });

  it("Adds a new archive job request for same data which should fail", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testArchiveJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(409)
      .expect("Content-Type", /json/)
      .then((res, err) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property("error");
      });
  });

  it("Send an update status to the archive job request, signal successful archiving", async () => {
    return request(app)
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
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("Adds a new retrieve job request on same dataset, which should succeed now", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testRetrieveJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res, err) => {
        if (err) {
          return done(err);
        }
        res.body.should.have.property("id");
        retrieveJobId = res.body["id"];
      });
  });

  it("Read contents of dataset 1 after retrieve job and make sure that still retrievable", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + pid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
      });
  });

  it("Send an update status to the dataset", async () => {
    return request(app)
      .put("/api/v3/Datasets/" + pid1)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle1,
          retrieveReturnMessage: {
            text: "Some dummy retrieve message",
          },
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested.property(
          "datasetlifecycle.retrieveReturnMessage",
        );
      });
  });

  it("Send an update status to the dataset, simulating the archive system response of finished job with partial failure", async () => {
    return request(app)
      .put("/api/v3/Datasets/" + pid1)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle1,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
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

  it("Send an update status message to the Job", async () => {
    return request(app)
      .patch("/api/v3/Jobs/" + retrieveJobId)
      .send({
        jobStatusMessage: "finishedUnsuccessful",
        jobResultObject: {
          status: "bad",
          message: "System A failed",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("jobResultObject");
      });
  });

  it("Send an update status to the datasets, simulating the archive system response of successful job", async () => {
    await request(app)
      .put("/api/v3/Datasets/" + pid1)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle1,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
      });

    return request(app)
      .put("/api/v3/Datasets/" + pid2)
      .send({
        datasetlifecycle: {
          ...datasetLiveCycle2,
          retrievable: true,
          archiveStatusMessage: "datasetOnArchiveDisk",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested
          .property("datasetlifecycle.retrievable")
          .and.equal(true);
      });
  });

  it("Send an update status message to the Job", async () => {
    return request(app)
      .patch("/api/v3/Jobs/" + retrieveJobId)
      .send({
        jobStatusMessage: "finishedSuccessful",
        jobResultObject: {
          status: "okay",
          message: "Job archiving worked",
        },
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
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
  //   return request(app)
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
  //   return request(app)
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

  it("adds a new origDatablock", async () => {
    return request(app)
      .post(`/api/v3/datasets/${pid1}/OrigDatablocks`)
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
        origDatablockId = res.body["id"];
      });
  });

  it("Adds a new public job request on private datasets, which should fails", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testPublicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(409)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
      });
  });

  it("Set to true for one of the dataset", async () => {
    return request(app)
      .put("/api/v3/Datasets/" + pid1)
      .send({
        isPublished: true,
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested.property("isPublished").and.equal(true);
      });
  });

  it("Adds a new public job request on one public and one private dataset, which should fails", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testPublicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(409)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
      });
  });

  it("Update isPublished to true on second dataset", async () => {
    return request(app)
      .put("/api/v3/Datasets/" + pid2)
      .send({
        isPublished: true,
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.nested.property("isPublished").and.equal(true);
      });
  });

  it("Adds a new public job request without authentication", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testPublicJob)
      .set("Accept", "application/json")
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        publicJobIds.push(res.body["id"]);
      });
  });

  it("Adds a new public job request with authentication", async () => {
    return request(app)
      .post("/api/v3/Jobs")
      .send(testPublicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        publicJobIds.push(res.body["id"]);
      });
  });

  it("Send an update status to the public job request, signal finished job with partial failure", async () => {
    return request(app)
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
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("Adds a new public job request to download some selected files", async () => {
    testPublicJob.datasetList[0].files = ["N1039-1.tif", "N1039-2.tif"];
    return request(app)
      .post("/api/v3/Jobs")
      .send(testPublicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        //reset
        testPublicJob.datasetList[0].files = [];

        res.body.should.have.property("type").and.be.string;
        publicJobIds.push(res.body["id"]);
      });
  });

  it("Send an update status to the public job request, signal successful job", async () => {
    return request(app)
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
      .expect(200)
      .expect("Content-Type", /json/);
  });

  // NOTE: We don't have put endpoint on the jobs here, only patch.
  // Patch without id is returning 404 nor found. Maybe this will be valid one if we need and add put endpoint later?
  // it("Add new job using put, which should fails. Ensure that adding new job without authentication using put is not possible ", async () => {
  //   return request(app)
  //     .put("/api/v3/Jobs/")
  //     .send(testPublicJob)
  //     .set("Accept", "application/json")
  //     .expect(401)
  //     .expect("Content-Type", /json/);
  // });

  it("Adds a new public job request with to download some selected files that dont exist, which should fail", async () => {
    testPublicJob.datasetList[0].files = ["N1039-1.tif", "N1039-101.tif"];
    return request(app)
      .post("/api/v3/Jobs")
      .send(testPublicJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenIngestor}` })
      .expect(400)
      .expect("Content-Type", /json/)
      .then((res) => {
        //reset
        testPublicJob.datasetList[0].files = [];

        res.should.have.property("error").and.be.string;
      });
  });

  it("should delete the archive Job", async () => {
    return request(app)
      .delete("/api/v3/Jobs/" + archiveJobId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete the retrieve Job", async () => {
    return request(app)
      .delete("/api/v3/Jobs/" + retrieveJobId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  publicJobIds.forEach((jobId) => {
    it("should delete the public Job" + jobId, async () => {
      return request(app)
        .delete("/api/v3/Jobs/" + jobId)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });

  it("should delete the originDataBlock", async () => {
    return request(app)
      .delete(`/api/v3/datasets/${pid1}/OrigDatablocks/` + origDatablockId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200);
  });

  it("should delete the newly created dataset", async () => {
    return request(app)
      .delete("/api/v3/Datasets/" + pid1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete the second newly created dataset", async () => {
    return request(app)
      .delete("/api/v3/Datasets/" + pid2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
