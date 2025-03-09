// for #all and #authorized
const { now } = require("lodash");
var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser51 = null,
  accessTokenUser52 = null,
  accessTokenAdmin = null,
  accessTokenArchiveManager = null;

let datasetPid1 = null,

  jobId1 = null,
  encodedJobOwnedByAdmin = null

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

describe("1190: Jobs: Test Backwards Compatibility with api/v3", () => {
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

  it("0040: Add a new job as a user from ADMIN_GROUPS in '#all' configuration", async () => {
    const newJob = {
      ...jobAll,
      emailJobInitiator: "admin@test.email",
      datasetList: [
        { pid: datasetPid1, files: [] },
      ],
      jobParams: {
        username: "admin",
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
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        res.body.should.have.property("contactEmail").to.be.equal("admin@test.email");
        jobId1 = res.body["id"];
        encodedJobOwnedByAdmin = encodeURIComponent(jobId1);
      });
  });

  it("0050: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#all' configuration", async () => {
    return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .send({
        jobStatusMessage: "jobUpdate",
        jobResultObject: {
          statusCode: "finished",
        },
        executionTime: now()
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0060: Access jobs as a user from ADMIN_GROUPS ", async () => {
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

  it("0070: Get job as user from ADMIN_GROUP", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/${encodedJobOwnedByAdmin}`)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("emailJobInitiator").and.be.equal("admin@test.email");
      });
  });

  it("0080: Fullquery jobs as a user from ADMIN_GROUPS", async () => {
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
        res.body.should.be.an("array").to.have.lengthOf(1);
      });
  });

  it("0090: Fullfacet jobs as a user from ADMIN_GROUPS that were created by admin", async () => {
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
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 1 }] });
      });
  });

  it("0100: Delete job created by admin as Admin", async () => {
    return request(appUrl)
      .delete("/api/v3/Jobs/" + encodedJobOwnedByAdmin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });
});
