// for #all and #authorized
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser51 = null,
  accessTokenUser52 = null,
  accessTokenAdmin = null,
  accessTokenArchiveManager = null;

let datasetPid1 = null,
  datasetPid2 = null,

  jobId1 = null,
  encodedJobOwnedByAdmin = null,
  jobId2 = null,
  encodedJobOwnedByUser1 = null,
  jobId3 = null,
  encodedJobOwnedByGroup1 = null,
  jobId4 = null,
  encodedJobOwnedByUser51 = null,
  jobId5 = null,
  encodedJobOwnedByGroup5 = null,
  jobId6 = null,
  encodedJobOwnedByAnonym = null

const dataset1 = {
  ...TestData.RawCorrect,
  isPublished: true,
  ownerGroup: "group1",
  accessGroups: ["group5"],
};

const dataset2 = {
  ...TestData.RawCorrect,
  isPublished: false,
  ownerGroup: "group2",
  accessGroups: [],
};

const dataset3 = {
  ...TestData.RawCorrect,
  isPublished: false,
  ownerGroup: "group5",
  accessGroups: ["group1"],
};

const jobAll = {
  type: "all_access",
};

describe("1120: Jobs: Test New Job Model Authorization for #all jobs", () => {
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

  after(() => { 
    db.collection("Dataset").deleteMany({});
    db.collection("Job").deleteMany({});
  });

  it("0010: adds dataset 1 as Admin Ingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group1");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(true);
        res.body.should.have.property("pid").and.be.string;
        datasetPid1 = res.body["pid"];
      });
  });

  it("0020: adds dataset 2 as Admin Ingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group2");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        datasetPid2 = res.body["pid"];
      });
  });

  it("0030: adds dataset 3 as Admin Ingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset3)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group5");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        datasetPid3 = res.body["pid"];
      });
  });

  it("0040: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with no datasets in job parameters, which should fail", async () => {
    const newJob = {
      ...jobAll,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        datasetList: [],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id")
        res.body.should.have.property("message").and.be.equal("List of passed datasets is empty.");
      });
  });

  it("0050: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with not existing dataset IDs, which should fail", async () => {
    const newJob = {
      ...jobAll,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        datasetList: [
          { pid: "fakeID", files: [] },
          { pid: "fakeID2", files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id")
        res.body.should.have.property("message").and.be.equal("Datasets with pid fakeID,fakeID2 do not exist.");
      });
  });

  it("0060: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with no jobParams parameter, which should fail", async () => {
    const newJob = {
      type: "all_access",
      ownerUser: "admin",
      ownerGroup: "admin",
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0065: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with empty jobParams parameter", async () => {
    const newJob = {
      type: "all_access",
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {},
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0070: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId1 = res.body["id"];
        encodedJobOwnedByAdmin = encodeURIComponent(jobId1);
      });
  });

  it("0080: Add a new job as a user from ADMIN_GROUPS for another user in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId2 = res.body["id"];
        encodedJobOwnedByUser1 = encodeURIComponent(jobId2);
      });
  });

  it("0090: Add a new job as a user from ADMIN_GROUPS for undefined user from another group user in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId3 = res.body["id"];
        encodedJobOwnedByGroup1 = encodeURIComponent(jobId3);
      });
  });

  it("0100: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId6 = res.body["id"];
        encodedJobOwnedByAnonym = encodeURIComponent(jobId6);
      });
  });

  it("0110: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0120: Add a new job as a user from CREATE_JOB_GROUPS for his/her group in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0130: Add a new job as a user from CREATE_JOB_GROUPS for another user in '#all' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobAll,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
      });
  });

  it("0140: Add a new job as a user from CREATE_JOB_GROUPS for another group in '#all' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobAll,
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. User needs to belong to job owner group.");
      });
  });

  it("0150: Add a new job as a user from CREATE_JOB_GROUPS for anonymous user in '#all' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobAll,
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. Owner group should be specified.");
      });
  });

  it("0160: Add a new job as a normal user for himself/herself in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid2, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId4 = res.body["id"];
        encodedJobOwnedByUser51 = encodeURIComponent(jobId4);
      });
  });

  it("0170: Add a new job as a normal user for his/her group in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId5 = res.body["id"];
        encodedJobOwnedByGroup5 = encodeURIComponent(jobId5);
      });
  });

  it("0180: Add a new job as a normal user for another user in '#all' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobAll,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
      });
  });

  it("0190: Add a new job as a normal user for another group in '#all' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobAll,
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. User needs to belong to job owner group.");
      });
  });

  it("0200: Add a new job as a normal user for anonymous user in '#all' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobAll,
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. Owner group should be specified.");
      });
  });

  it("0210: Adds a new job as unauthenticated user in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerUser");
        res.body.should.not.have.property("ownerGroup");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0220: Adds a new job as unauthenticated user for another user in '#all' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobAll,
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. Unauthenticated user cannot initiate a job owned by another user.");
      });
  });

  it("0780: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0790: Adds a Status update to a job as a user from ADMIN_GROUPS for another user's job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0800: Adds a Status update to a job as a user from ADMIN_GROUPS for another group's job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0810: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0820: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0830: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByUser51}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0840: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her group in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0850: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup5}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0860: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonymous user's group in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0870: Adds a Status update to a job as a normal user for his/her job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByUser51}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0880: Adds a Status update to a job as a normal user for another user's job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0890: Adds a Status update to a job as a normal user for his/her group in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup5}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0900: Adds a Status update to a job as a normal user for another user's group in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0910: Adds a Status update to a job as a normal user for anonymous user's group in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0920: Adds a Status update to a job as unauthhenticated user for anonymous job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0930: Adds a Status update to a job as unauthhenticated user for anouther group's job in '#all' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0940: Adds a Status update to a job as unauthhenticated user for another user's job in '#all' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1610: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#all' configuration with non-existing jobId, which should fail as bad request", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/badJobId`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/);
  });



  it("1620: Access jobs as a user from ADMIN_GROUPS ", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(10);
      });
  });

  it("1630: Access jobs as a user from ADMIN_GROUPS that were created by admin", async () => {
    const query = { where: { createdBy: "admin" } };
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(5);
      });
  });

  it("1640: Access jobs as a user from ADMIN_GROUPS that were created by User1", async () => {
    const query = { where: { createdBy: "user1" } };
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("1650: Access jobs as a user from ADMIN_GROUPS that were created by User5.1", async () => {
    const query = { where: { createdBy: "user5.1" } };
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("1660: Access jobs as a user from ADMIN_GROUPS that were created by User5.2", async () => {
    const query = { where: { createdBy: "user5.2" } };
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(0);
      });
  });

  it("1670: Access jobs as a user from ADMIN_GROUPS that were created by anonymous user", async () => {
    const query = { where: { createdBy: "anonymous" } };
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  it("1680: Access jobs as a user from CREATE_JOB_GROUPS ", async () => {
    // tests 0080, 0090, 0110, 0120
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(4);
      });
  });

  it("1690: Access jobs as a user from CREATE_JOB_GROUPS that were created by admin", async () => {
    const query = { where: { createdBy: "admin" } };
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("1700: Access jobs as a user from CREATE_JOB_GROUPS that were created by User1", async () => {
    const query = { where: { createdBy: "user1" } };
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("1710: Access jobs as a normal user", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("1720: Access jobs as a normal user (user5.1) that were created by admin", async () => {
    const query = { where: { createdBy: "admin" } };
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(0);
      });
  });

  it("1730: Access jobs as another normal user (user5.2)", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser52}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(0);
      });
  });

  it("1740: Access jobs as unauthenticated user, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });
  it("1750: Get admin's job as user from ADMIN_GROUP", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerUser").and.be.equal("admin");
      });
  });
  it("1760: Get user1's job as user from ADMIN_GROUP", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerUser").and.be.equal("user1");
      });
  });

  it("1770: Get group1's job as user from ADMIN_GROUP", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByGroup1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
      });
  });

  it("1780: Get admin's job as user from ADMIN_GROUP", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
      });
  });

  it("1790: Get admin's job as user from CREATE_JOB_GROUP, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
      });
  });

  it("1800: Get his/her own job as user from CREATE_JOB_GROUP", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
      });
  });

  it("1810: Get a job from his/her own group as user from CREATE_JOB_GROUP", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByGroup1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
      });
  });

  it("1820: Get other user's job as user from CREATE_JOB_GROUP, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser51}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
      });
  });

  it("1830: Get anonymous user's job as user from CREATE_JOB_GROUP, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
      });
  });

  it("1840: Get admin's job as normal, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
      });
  });

  it("1850: Get other user's job as normal user, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
      });
  });

  it("1860: Get his/her own job as normal user", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser51}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerUser").and.be.equal('user5.1');
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
      });
  });


  it("1890: Get anonymous user's job as normal user, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
      });
  });

  it("1900: Get anonymous user's job as anonymous user, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("ownerUser");
      });
  });

  it("1910: Delete job created by admin as Archive Manager", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + encodedJobOwnedByAdmin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1920: Delete job created by admin as Admin", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + encodedJobOwnedByUser1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1930: Delete job created by admin as CREATE_JOB_GROUPS user, which should fail", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + encodedJobOwnedByGroup1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.DeleteForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1940: Delete job created by admin as normal user, which should fail", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + encodedJobOwnedByGroup1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.DeleteForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1950: Delete job not existing in database as Archive Manager, which should fail", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + 'fakeJobId')
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1960: Access jobs as a user from ADMIN_GROUPS, which should be one less than before proving that delete works.", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(8);
      });
  });

  it("1970: Fullquery jobs as a user from ADMIN_GROUPS, limited by 2", async () => {
    const query = { limit: 2 };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .set("Accept", "application/json")
      .query("limits=" + encodeURIComponent(JSON.stringify(query)))
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("1980: Fullquery jobs as a user from ADMIN_GROUPS that were created by admin", async () => {
    // same as in get before, but the two were deleted
    const query = { createdBy: "admin" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
      });
  });

  it("1990: Fullquery jobs as a user from ADMIN_GROUPS that were created by User1", async () => {
    const query = { createdBy: "user1" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });


  it("2020: Fullquery jobs as a user from ADMIN_GROUPS that were created by anonymous user", async () => {
    const query = { createdBy: "anonymous" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  it("2040: Fullquery jobs as a user from CREATE_JOB_GROUPS that were created by admin", async () => {
    const query = { createdBy: "admin" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  it("2050: Fullquery jobs as a user from CREATE_JOB_GROUPS that were created by User1", async () => {
    const query = { createdBy: "user1" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("2060: Fullquery jobs as a normal user", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("2070: Fullquery jobs as a normal user (user5.1) that were created by admin", async () => {
    const query = { createdBy: "admin" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(0);
      });
  });

  it("2090: Fullquery jobs as unauthenticated user, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("2100: Fullfacet jobs as unauthenticated user, which should be forbidden", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("2110: Fullfacet jobs as a user from ADMIN_GROUPS that were created by admin", async () => {
    const query = { createdBy: "admin" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 3 }] });
      });
  });

  it("2120: Fullfacet jobs as a user from ADMIN_GROUPS that were created by User1", async () => {
    const query = { createdBy: "user1" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 2 }] });
      });
  });



  it("2150: Fullfacet jobs as a user from ADMIN_GROUPS that were created by anonymous user", async () => {
    const query = { createdBy: "anonymous" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 1 }] });
      });
  });

  it("2160: Fullfacet jobs as a user from CREATE_JOB_GROUPS that were created by admin", async () => {
    const query = { createdBy: "admin" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 1 }] });
      });
  });

  it("2170: Fullfacet jobs as a user from CREATE_JOB_GROUPS that were created by User1", async () => {
    const query = { createdBy: "user1" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 2 }] });
      });
  });

  it("2180: Fullfacet jobs as a normal user", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 2 }] });
      });
  });

  it("2190: Fullfacet jobs as a normal user (user5.1) that were created by admin", async () => {
    const query = { createdBy: "admin" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [] });
      });
  });
});
