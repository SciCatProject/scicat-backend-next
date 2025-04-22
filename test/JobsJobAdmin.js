
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser3 = null,
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
  jobId51 = null,
  encodedJobOwnedByUser51 = null;


const dataset1 = {
  ...TestData.RawCorrect,
  isPublished: true,
  ownerGroup: "group1",
  accessGroups: ["group5"],
};

const dataset2 = {
  ...TestData.RawCorrect,
  isPublished: false,
  ownerGroup: "group3",
  accessGroups: [],
};

const dataset3 = {
  ...TestData.RawCorrect,
  isPublished: false,
  ownerGroup: "group5",
  accessGroups: ["group1"],
};

const jobDatasetOwner = {
  type: "job_admin"
};

describe("1170: Jobs: Test New Job Model Authorization for job_admin jobs type", () => {
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

    accessTokenAdmin = await utils.getToken(appUrl, {
      username: "admin",
      password: TestData.Accounts["admin"]["password"],
    });

  });

  after(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Job").deleteMany({});
  });

  it("0010: Add dataset 1 as Admin Ingestor", async () => {
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

  it("0020: Add dataset 2 as Admin Ingestor", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(dataset2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("ownerGroup").and.equal("group3");
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        datasetPid2 = res.body["pid"];
      });
  });

  it("0030: Add dataset 3 as Admin Ingestor", async () => {
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

  it("0040: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#jobAdmin' configuration", async () => {
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
      .post("/api/v4/Jobs")
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

  it("0050: Add a new job as a user from ADMIN_GROUPS for another user in '#jobAdmin' configuration", async () => {
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
      .post("/api/v4/Jobs")
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

  it("0060: Add a new job as a user from ADMIN_GROUPS for another group in '#jobAdmin' configuration", async () => {
    const newJob = {
      ...jobDatasetOwner,
      ownerGroup: "group3",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
          { pid: datasetPid3, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v4/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group3");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId3 = res.body["id"];
        encodedJobOwnedByGroup3 = encodeURIComponent(jobId3);
      });
  });

  it("0070: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#jobAdmin' configuration", async () => {
    const newJob = {
      ...jobDatasetOwner,
      contactEmail: "test@email.scicat",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
          { pid: datasetPid3, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v4/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("contactEmail").to.be.equal(newJob.contactEmail);
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0080: Add a new job as a user from CREATE_JOB_PRIVILEGED_GROUPS for himself/herself in '#jobAdmin' configuration with dataset owned by his/her group", async () => {
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
      .post("/api/v4/Jobs")
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
        jobId7 = res.body["id"];
      });
  });

  it("0090: Add a new job as a user from CREATE_JOB_PRIVILEGED_GROUPS for himself/herself in '#jobAdmin' configuration with only one of two datasets owned by his/her group", async () => {
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
      .post("/api/v4/Jobs")
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

  it("0100: Add a new job as a user from CREATE_JOB_PRIVILEGED_GROUPS for another user in '#jobAdmin' configuration", async () => {
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
      .post("/api/v4/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        jobId51 = res.body["id"];
        encodedJobOwnedByUser51 = encodeURIComponent(jobId51);
      });
  });

  it("0110: Add a new job as a normal user for himself/herself in '#jobAdmin' configuration with datasets owned by his/her group, which should be forbidden", async () => {
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
      .post("/api/v4/Jobs")
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

  it("0120: Add a new job as a user from UPDATE_JOB_PRIVILEGED_GROUPS for himself/herself in '#jobAdmin' configuration with datasets owned by his/her group, which should be forbidden", async () => {
    const newJob = {
      ...jobDatasetOwner,
      ownerUser: "user3",
      ownerGroup: "group3",
      jobParams: {
        datasetList: [
          { pid: datasetPid2, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v4/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0130: Add a status update to a job as a user from ADMIN_GROUPS for his/her job in '#jobAdmin' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v4/Jobs/${encodedJobOwnedByAdmin}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0140: Add a Status update to a job as a user from ADMIN_GROUPS for another group's job in '#jobAdmin' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v4/Jobs/${encodedJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0150: Add a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#jobAdmin' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v4/Jobs/${encodedJobOwnedByGroup3}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0160: Add a Status update to a job as a user from UPDATE_JOB_PRIVILEGED_GROUPS for his/her job in '#jobAdmin' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v4/Jobs/${encodedJobOwnedByGroup3}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0170: Add a Status update to a job as a user from UPDATE_JOB_PRIVILEGED_GROUPS for another user's job in '#jobAdmin' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v4/Jobs/${encodedJobOwnedByUser51}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0180: Add a Status update to a job as a user from CREATE_JOB_PRIVILEGED_GROUPS for his group's in '#jobAdmin' configuration, which should be forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v4/Jobs/${encodedJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0190: Add a Status update to a job as a normal user  for his/her job in '#jobAdmin' configuration, which should be forbidden", async () => {
    return request(appUrl)
      .patch(`/api/v4/Jobs/${encodedJobOwnedByUser51}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0200: Access jobs as user5.1", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });
});