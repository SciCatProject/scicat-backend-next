var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenAdmin = null,
  accessTokenUser1 = null,
  datasetPid1 = null,
  encodedJobOwnedByAdmin = null,
  encodedJobOwnedByUser1 = null,
  jobCreateDtoByAdmin = null,
  jobCreateDtoForUser1 = null,
  jobCreateDtoByUser1 = null,
  jobUpdateDto1 = null,
  jobUpdateDto2 = null;

const dataset1 = {
  ...TestData.RawCorrect,
  isPublished: true,
  ownerGroup: "group1",
  accessGroups: ["group5"],
};

const jobUser = {
  type: "owner_access"
};

describe("1190: Jobs: Test Backwards Compatibility", () => {
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

    accessTokenUser1 = await utils.getToken(appUrl, {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
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

  it("0020: Add via /api/v3 a new job without datasetList, as a user from ADMIN_GROUPS, which should fail", async () => {
    const newJob = {
      ...jobUser,
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

  it("0030: Add via /api/v3 a new job ignoring datasetList from jobParams, as a user from ADMIN_GROUPS, which should fail", async () => {
    const newJob = {
      ...jobUser,
      datasetList: [
        { pid: "test", files: [] },
      ],
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
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Datasets with pid test do not exist.");
      });
  });

  it("0040: Add via /api/v3 an anonymous job as a user from ADMIN_GROUPS", async () => {
    jobCreateDtoByAdmin = {
      ...jobUser,
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobCreateDtoByAdmin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("jobStatusMessage").to.be.equal("jobCreated");
        res.body.should.have.property("datasetList").that.deep.equals(jobCreateDtoByAdmin.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals({});
        res.body.should.have.property("emailJobInitiator").to.be.equal(TestData.Accounts["admin"]["email"]);
        res.body.should.not.have.property("executionTime");
        encodedJobOwnedByAdmin = encodeURIComponent(res.body["id"]);
      });
  });

  it("0050: Get via /api/v4 the anonymous job as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("createdAt");
        res.body.should.not.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.not.have.property("ownerUser");
        res.body.should.not.have.property("ownerGroup");
        res.body.should.have.property("contactEmail").to.be.equal(TestData.Accounts["admin"]["email"]);
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        res.body.should.have.property("statusMessage").to.be.equal("Job has been created.");
        res.body.should.have.property("jobParams").that.deep.equals({ datasetList: jobCreateDtoByAdmin.datasetList });
      });
  });

  it("0060: Get via /api/v3 the anonymous job as user1, which should fail", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0070: Get via /api/v4 the anonymous job as user1, which should fail", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0080: Add via /api/v3 a new job with emailJobInitiator for user1, as a user from ADMIN_GROUPS", async () => {
    jobCreateDtoForUser1 = {
      ...jobUser,
      emailJobInitiator: "user1@your.site",
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobCreateDtoForUser1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("jobStatusMessage").to.be.equal("jobCreated");
        res.body.should.have.property("emailJobInitiator").to.be.equal(jobCreateDtoForUser1.emailJobInitiator);
        res.body.should.have.property("datasetList").that.deep.equals(jobCreateDtoForUser1.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals({});
        encodedJobOwnedByUser1 = encodeURIComponent(res.body["id"]);
      });
  });

  it("0090: Get via /api/v4 the job added for user1, as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("createdAt");
        res.body.should.not.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        res.body.should.have.property("statusMessage").to.be.equal("Job has been created.");
        res.body.should.have.property("contactEmail").to.be.equal(jobCreateDtoForUser1.emailJobInitiator);
        res.body.should.not.have.property("ownerUser");
        res.body.should.not.have.property("ownerGroup");
      });
  });

  it("0100: Get via /api/v4 the job added for user1, as user1, which should fail because ownerUser does not exist", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0110: Get via /api/v3 the job added for user1, as user1, which should fail because ownerUser does not exist", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0120: Add via /api/v3 a new job with a complete dto for user1 and other contactEmail, as a user from ADMIN_GROUPS", async () => {
    jobCreateDtoForUser1 = {
      ...jobUser,
      emailJobInitiator: "test@email.scicat",
      jobParams: {
        param: "ok",
        username: "user1",
      },
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
      executionTime: '2030-01-01T00:00:00.000Z',
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobCreateDtoForUser1)
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
        res.body.should.have.property("emailJobInitiator").to.be.equal(jobCreateDtoForUser1.emailJobInitiator);
        res.body.should.have.property("datasetList").that.deep.equals(jobCreateDtoForUser1.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals(jobCreateDtoForUser1.jobParams);
        encodedJobOwnedByUser1 = encodeURIComponent(res.body["id"]);
      });
  });

  it("0130: Get via /api/v4 the job added for user1, as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        const expectedJobParams = {
          datasetList: jobCreateDtoForUser1.datasetList,
          param: jobCreateDtoForUser1.jobParams.param,
          username: jobCreateDtoForUser1.jobParams.username,
          executionTime: jobCreateDtoForUser1.executionTime,
        };
        res.body.should.have.property("id");
        res.body.should.have.property("createdAt");
        res.body.should.not.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        res.body.should.have.property("statusMessage").to.be.equal("Job has been created.");
        res.body.should.have.property("contactEmail").to.be.equal(jobCreateDtoForUser1.emailJobInitiator);
        res.body.should.have.property("ownerUser").to.be.equal(expectedJobParams.username);
        res.body.should.have.property("ownerGroup").to.be.equal(TestData.Accounts[expectedJobParams.username]["role"]);
        res.body.should.have.property("jobParams").that.deep.equals(expectedJobParams);
      });
  });

  it("0140: Get via /api/v4 the job added for user1, as user1", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        const expectedJobParams = {
          datasetList: jobCreateDtoForUser1.datasetList,
          param: jobCreateDtoForUser1.jobParams.param,
          username: jobCreateDtoForUser1.jobParams.username,
          executionTime: jobCreateDtoForUser1.executionTime,
        };
        res.body.should.have.property("id");
        res.body.should.have.property("createdAt");
        res.body.should.not.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        res.body.should.have.property("statusMessage").to.be.equal("Job has been created.");
        res.body.should.have.property("contactEmail").to.be.equal(jobCreateDtoForUser1.emailJobInitiator);
        res.body.should.have.property("ownerUser").to.be.equal(expectedJobParams.username);
        res.body.should.have.property("ownerGroup").to.be.equal(TestData.Accounts[expectedJobParams.username]["role"]);
        res.body.should.have.property("jobParams").that.deep.equals(expectedJobParams);
      });
  });

  it("0150: Get via /api/v3 the job added for user1, as user1", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("emailJobInitiator").to.be.equal(jobCreateDtoForUser1.emailJobInitiator);
        res.body.should.have.property("datasetList").that.deep.equals(jobCreateDtoForUser1.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals(jobCreateDtoForUser1.jobParams);
      });
  });

  it("0160: Add via /api/v3 a new job without specifying username for user1, as user1, which should fail", async () => {
    jobCreateDtoByUser1 = {
      ...jobUser,
      jobParams: {
        param: "ok",
      },
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
      executionTime: '2030-01-01T00:00:00.000Z',
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobCreateDtoByUser1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. Owner group should be specified.");
      });
  });

  it("0170: Add via /api/v3 a new job specifying only emailJobInitiator for user1, as user1, which should fail", async () => {
    jobCreateDtoByUser1 = {
      ...jobUser,
      emailJobInitiator: "user1@your.site",
      jobParams: {
        param: "ok",
      },
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
      executionTime: '2030-01-01T00:00:00.000Z',
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobCreateDtoByUser1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. Owner group should be specified.");
      });
  });

  it("0180: Add via /api/v3 a new job with complete dto for user1, as user1", async () => {
    jobCreateDtoByUser1 = {
      ...jobUser,
      emailJobInitiator: "test@email.scicat",
      jobParams: {
        param: "ok",
        username: "user1",
      },
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
      executionTime: '2030-01-01T00:00:00.000Z',
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobCreateDtoByUser1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("executionTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("jobStatusMessage").to.be.equal("jobCreated");
        res.body.should.have.property("emailJobInitiator").to.be.equal(jobCreateDtoByUser1.emailJobInitiator);
        res.body.should.have.property("datasetList").that.deep.equals(jobCreateDtoByUser1.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals(jobCreateDtoByUser1.jobParams);
        encodedJobOwnedByUser1 = encodeURIComponent(res.body["id"]);
      });
  });

  it("0190: Get via /api/v4 the job added for user1, as user1", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        const expectedJobParams = {
          datasetList: jobCreateDtoByUser1.datasetList,
          param: jobCreateDtoByUser1.jobParams.param,
          username: jobCreateDtoByUser1.jobParams.username,
          executionTime: jobCreateDtoByUser1.executionTime,
        };
        res.body.should.have.property("id");
        res.body.should.have.property("createdAt");
        res.body.should.not.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        res.body.should.have.property("statusMessage").to.be.equal("Job has been created.");
        res.body.should.have.property("contactEmail").to.be.equal(jobCreateDtoByUser1.emailJobInitiator);
        res.body.should.have.property("ownerUser").to.be.equal(expectedJobParams.username);
        res.body.should.have.property("ownerGroup").to.be.equal(TestData.Accounts[expectedJobParams.username]["role"]);
        res.body.should.have.property("jobParams").that.deep.equals(expectedJobParams);
      });
  });

  it("0200: Get via /api/v3 the job added for user1, as user1", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("executionTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("jobStatusMessage").to.be.equal("jobCreated");
        res.body.should.have.property("emailJobInitiator").to.be.equal(jobCreateDtoByUser1.emailJobInitiator);
        res.body.should.have.property("datasetList").that.deep.equals(jobCreateDtoByUser1.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals(jobCreateDtoByUser1.jobParams);
      });
  });

  it("0210: Add a status update via /api/v3 without jobStatusMessage to a job, as a user from ADMIN_GROUPS, which should fail", async () => {
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

  it("0220: Add a status update via /api/v3 to a job as a user from ADMIN_GROUPS for his/her job", async () => {
    jobUpdateDto1 = {
      jobStatusMessage: "newJobStatus",
      executionTime: "2045-01-01T00:00:00.000Z",
      jobResultObject: {
        resultParam: "ok",
      },
    };

    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .send(jobUpdateDto1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("jobStatusMessage").to.be.equal(jobUpdateDto1.jobStatusMessage);
        res.body.should.have.property("executionTime").to.be.equal(jobUpdateDto1.executionTime);
        res.body.should.have.property("jobResultObject").that.deep.equals(jobUpdateDto1.jobResultObject);
      });
  });

  it("0230: Get via /api/v4 the previously updated job as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .get(`/api/v4/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        const expectedJobParams = {
          datasetList: jobCreateDtoByAdmin.datasetList,
          executionTime: jobUpdateDto1.executionTime,
        };
        res.body.should.have.property("id");
        res.body.should.have.property("createdAt");
        res.body.should.not.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.have.property("statusCode").to.be.equal(jobUpdateDto1.jobStatusMessage);
        res.body.should.have.property("statusMessage").to.be.equal(jobUpdateDto1.jobStatusMessage);
        res.body.should.have.property("jobParams").that.deep.equals(expectedJobParams);
        res.body.should.have.property("jobResultObject").that.deep.equals(jobUpdateDto1.jobResultObject);
        res.body.should.have.property("contactEmail").to.be.equal(TestData.Accounts["admin"]["email"]);
      });
  });

  it("0240: Add a status update via /api/v4 to a job that was created via /api/v3, as user1 for his/her job", async () => {
    jobUpdateDto2 = {
      statusCode: "statusCode",
      statusMessage: "statusMessage",
      jobResultObject: {
        newParam: "test",
      },
    };

    return request(appUrl)
      .patch(`/api/v4/Jobs/${encodedJobOwnedByUser1}`)
      .send(jobUpdateDto2)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        const expectedJobParams = {
          datasetList: jobCreateDtoByUser1.datasetList,
          param: jobCreateDtoByUser1.jobParams.param,
          username: jobCreateDtoByUser1.jobParams.username,
          executionTime: jobCreateDtoByUser1.executionTime,
        };
        res.body.should.have.property("id");
        res.body.should.have.property("configVersion").and.be.string;
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("creationTime");
        res.body.should.not.have.property("executionTime");
        res.body.should.not.have.property("datasetList");
        res.body.should.have.property("statusCode").to.be.equal(jobUpdateDto2.statusCode);
        res.body.should.have.property("statusMessage").to.be.equal(jobUpdateDto2.statusMessage);
        res.body.should.have.property("jobResultObject").that.deep.equals(jobUpdateDto2.jobResultObject);
        res.body.should.have.property("jobParams").that.deep.equals(expectedJobParams);
        res.body.should.have.property("contactEmail").to.be.equal(jobCreateDtoByUser1.emailJobInitiator);
        res.body.should.have.property("ownerUser").to.be.equal(expectedJobParams.username);
        res.body.should.have.property("ownerGroup").to.be.equal(TestData.Accounts["user1"]["role"]);
      });
  });

  it("0250: Get via /api/v3 the job that was previously updated via /api/v4, as user1 for his/her job", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByUser1}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id");
        res.body.should.have.property("creationTime");
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("emailJobInitiator").to.be.equal(jobCreateDtoByUser1.emailJobInitiator);
        res.body.should.have.property("datasetList").that.deep.equals(jobCreateDtoByUser1.datasetList);
        res.body.should.have.property("jobParams").that.deep.equals(jobCreateDtoByUser1.jobParams);
        res.body.should.have.property("executionTime").to.be.equal(jobCreateDtoByUser1.executionTime);
        res.body.should.have.property("jobResultObject").that.deep.equals(jobUpdateDto2.jobResultObject);
        res.body.should.have.property("jobStatusMessage").to.be.equal(jobUpdateDto2.statusCode);
      });
  });

  it("0260: Get via /api/v3 all accessible jobs as user1", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
      });
  });

  it("0270: Get via /api/v3 all accessible jobs as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(4);
      });
  });

  it("0280: Fullquery via /api/v3 all jobs that were created by user1, as user1", async () => {
    const query = { createdBy: "user1" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .set("Accept", "application/json")
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  it("0290: Fullfacet via /api/v3 jobs that were created by admin, as a user from ADMIN_GROUPS", async () => {
    const query = { createdBy: "admin" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 3 }] });
      });
  });

  it("0300: Fullfacet via /api/v3 jobs that were created by user1, as a user from ADMIN_GROUPS", async () => {
    const query = { createdBy: "user1" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .query("fields=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 1 }] });
      });
  });

  it("0310: Delete via /api/v3 a job created by admin, as a user from ADMIN_GROUPS", async () => {
    return request(appUrl)
      .delete("/api/v3/Jobs/" + encodedJobOwnedByAdmin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0320: Get via /api/v3 all accessible jobs as a user from ADMIN_GROUPS, which should be one less than before, proving that delete works", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
      });
  });

  it("0330: Add via /api/v3 an anonymous job as user1, which should fail", async () => {
    const newJob = {
      ...jobUser,
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
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

  it("0340: Add via /api/v3 an anonymous job as user1, providing another contactEmail, which should fail", async () => {
    const newJob = {
      ...jobUser,
      emailJobInitiator: "user2@your.site",
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
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

  it("0350: Add via /api/v3 a job for another user, as user1, which should fail", async () => {
    const newJob = {
      ...jobUser,
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
      jobParams: {
        username: "user2",
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
});
