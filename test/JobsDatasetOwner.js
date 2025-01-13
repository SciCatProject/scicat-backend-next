
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser51 = null,
  accessTokenAdmin = null;

let datasetPid1 = null,
  datasetPid2 = null,
  datasetPid3 = null,

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
  encodedJobOwnedByAnonym = null;

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

const jobDatasetOwner = {
  type: "owner_access"
};

describe("1150: Jobs: Test New Job Model Authorization for #datasetOwner jobs configuration", () => {
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

    accessTokenAdmin = await utils.getToken(appUrl, {
      username: "admin",
      password: TestData.Accounts["admin"]["password"],
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
  it("0500: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetOwner' configuration", async () => {
    const newJob = {
      ...jobDatasetOwner,
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

  it("0510: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetOwner' configuration", async () => {
    const newJob = {
      ...jobDatasetOwner,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
          { pid: datasetPid3, files: [] },
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
      });
  });

  it("0520: Add a new job as a user from ADMIN_GROUPS for another user in '#datasetOwner' configuration", async () => {
    const newJob = {
      ...jobDatasetOwner,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
          { pid: datasetPid3, files: [] },
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

  it("0530: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetOwner' configuration", async () => {
    const newJob = {
      ...jobDatasetOwner,
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
          { pid: datasetPid3, files: [] },
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

  it("0535: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetOwner' configuration", async () => {
    const newJob = {
      ...jobDatasetOwner,
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
          { pid: datasetPid3, files: [] },
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
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId5 = res.body["id"];
        encodedJobOwnedByGroup5 = encodeURIComponent(jobId5);
      });
  });

  it("0540: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#datasetOwner' configuration", async () => {
    const newJob = {
      ...jobDatasetOwner,
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
          { pid: datasetPid3, files: [] },
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

  it("0550: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetOwner' configuration with datasets owned by his/her group", async () => {
    const newJob = {
      ...jobDatasetOwner,
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

  it("0560: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetOwner' configuration with datasets owned by his/her group", async () => {
    const newJob = {
      ...jobDatasetOwner,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid3, files: [] },
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

  it("0570: Add a new job as a normal user for himself/herself in '#datasetOwner' configuration with datasets owned by his/her group", async () => {
    const newJob = {
      ...jobDatasetOwner,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid3, files: [] },
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

  it("0580: Add a new job as a normal user for himself/herself in '#datasetOwner' configuration with datasets not owned by his/her group, which should fail as forbidden", async () => {
    const newJob = {
      ...jobDatasetOwner,
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
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
      });
  });

  it("0950: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#jobOwnerUser' configuration", async () => {
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

  it("0960: Adds a Status update to a job as a user from ADMIN_GROUPS for another group's job in '#jobOwnerUser' configuration", async () => {
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

  it("0970: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#jobOwnerUser' configuration", async () => {
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

  it("0980: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#jobOwnerUser' configuration", async () => {
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

  it("0990: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her job in '#jobOwnerUser' configuration", async () => {
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

  it("1000: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in '#jobOwnerUser' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByUser51}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1010: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her group in '#jobOwnerUser' configuration", async () => {
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

  it("1020: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in '#jobOwnerUser' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup5}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1030: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonymous user's group in '#jobOwnerUser' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1040: Adds a Status update to a job as a normal user  for his/her job in '#jobOwnerUser' configuration", async () => {
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

  it("1050: Adds a Status update to a job as a normal user for another user's job in '#jobOwnerUser' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1060: Adds a Status update to a job as a normal user for his/her group in '#jobOwnerUser' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup5}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1070: Adds a Status update to a job as a normal user for another user's group in '#jobOwnerUser' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1080: Adds a Status update to a job as a normal user for anonymous user's group in '#jobOwnerUser' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1090: Adds a Status update to a job as unauthhenticated user for anonymous user's group in '#jobOwnerUser' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAnonym}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1100: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#jobOwnerGroup' configuration", async () => {
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
});
