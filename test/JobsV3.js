// for #all and #authorized
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenAdmin = null,
  datasetPid1 = null,
  jobId1 = null,
  encodedJobOwnedByAdmin = null,
  newJob1 = null;

const dataset1 = {
  ...TestData.RawCorrect,
  isPublished: true,
  ownerGroup: "group1",
  accessGroups: ["group5"],
};

const jobAll = {
  type: "all_access",
};

describe("1190: Jobs: Test Backwards Compatibility via /api/v3/Jobs", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Job").deleteMany({});
  });

  beforeEach(async () => {
    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
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

  it("0020: Add via /api/v3 a new job without datasetList as a user from ADMIN_GROUPS in '#all' configuration, which should fail", async () => {
    const newJob = {
      ...jobAll,
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
        res.body.should.have.property("message").and.be.equal("List of passed datasets is empty.");
      });
  });

  it("0030: Add via /api/v3 a new job as a user from ADMIN_GROUPS in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("jobStatusMessage").to.be.equal("jobCreated");
        res.body.should.have.property("datasetList").that.deep.equals(newJob.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals({});
        res.body.should.have.property("jobResultObject").that.deep.equals({});
        res.body.should.not.have.property("executionTime");
        res.body.should.not.have.property("emailJobInitiator");
      });
  });

  it("0040: Add via /api/v3 a new job with a complete dto as a user from ADMIN_GROUPS in '#all' configuration", async () => {
    newJob1 = {
      ...jobAll,
      emailJobInitiator: "admin@test.email",
      jobParams: {
        param: "ok",
        username: "adminIngestor",
      },
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
      executionTime: '2030-01-01T00:00:00.000Z',
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("executionTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("jobStatusMessage").to.be.equal("jobCreated");
        res.body.should.have.property("emailJobInitiator").to.be.equal(newJob1.emailJobInitiator);
        res.body.should.have.property("datasetList").that.deep.equals(newJob1.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals(newJob1.jobParams);
        res.body.should.have.property("jobResultObject").that.deep.equals({});
        jobId1 = res.body["id"];
        encodedJobOwnedByAdmin = encodeURIComponent(jobId1);
      });
  });

  it("0050: Get via /api/v4 the previously added job as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        const expectedJobParams = {
          datasetList: newJob1.datasetList,
          param: newJob1.jobParams.param,
          username: newJob1.jobParams.username,
          executionTime: newJob1.executionTime
        };
        res.body.should.have.property("id");
        res.body.should.have.property("createdAt");
        res.body.should.not.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.have.property("ownerUser").to.be.equal(newJob1.jobParams.username);
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        res.body.should.have.property("statusMessage").to.be.equal("Job has been created.");
        res.body.should.have.property("contactEmail").to.be.equal(newJob1.emailJobInitiator);
        res.body.should.have.property("jobParams").that.deep.equals(expectedJobParams);
        res.body.should.have.property("jobResultObject").that.deep.equals({});
      });
  });

  it("0060: Add a status update via /api/v3 without jobStatusMessage to a job as a user from ADMIN_GROUPS for his/her job in '#all' configuration, which should fail", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("message").that.deep.equals(["statusCode must be a string", "statusMessage must be a string"]);
      });
  });

  const jobUpdateDto = {
    jobStatusMessage: "newJobStatus",
    executionTime: "2045-01-01T00:00:00.000Z",
    jobResultObject: {
      resultParam: "ok",
    },
  };

  it("0070: Add a status update via /api/v3 to a job as a user from ADMIN_GROUPS for his/her job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .send(jobUpdateDto)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("emailJobInitiator").to.be.equal(newJob1.emailJobInitiator);
        res.body.should.have.property("datasetList").that.deep.equals(newJob1.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals(newJob1.jobParams);
        res.body.should.have.property("jobStatusMessage").to.be.equal(jobUpdateDto.jobStatusMessage);
        res.body.should.have.property("executionTime").to.be.equal(jobUpdateDto.executionTime);
        res.body.should.have.property("jobResultObject").that.deep.equals(jobUpdateDto.jobResultObject);
      });
  });

  it("0080: Get via /api/v4 the previously updated job as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        const expectedJobParams = {
          datasetList: newJob1.datasetList,
          param: newJob1.jobParams.param,
          username: newJob1.jobParams.username,
          executionTime: jobUpdateDto.executionTime
        };
        res.body.should.have.property("id");
        res.body.should.have.property("createdAt");
        res.body.should.not.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.have.property("ownerUser").to.be.equal(newJob1.jobParams.username);
        res.body.should.have.property("statusCode").to.be.equal(jobUpdateDto.jobStatusMessage);
        res.body.should.have.property("statusMessage").to.be.equal(jobUpdateDto.jobStatusMessage);
        res.body.should.have.property("contactEmail").to.be.equal(newJob1.emailJobInitiator);
        res.body.should.have.property("jobParams").that.deep.equals(expectedJobParams);
        res.body.should.have.property("jobResultObject").that.deep.equals(jobUpdateDto.jobResultObject);
      });
  });

  it("0090: Get jobs as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("0100: Fullquery jobs as a user from ADMIN_GROUPS", async () => {
    const query = { createdBy: "admin" };
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

  it("0110: Fullfacet jobs as a user from ADMIN_GROUPS that were created by admin", async () => {
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
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 2 }] });
      });
  });

  it("0120: Delete job created by admin as admin", async () => {
    return request(appUrl)
      .delete("/api/v3/Jobs/" + encodedJobOwnedByAdmin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0130: Get jobs as a user from ADMIN_GROUPS, which should be one less than before, proving that delete works", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  // TODO a add v4 job and get it with v3
  // TODO update a v4 job and get it with v3
});
