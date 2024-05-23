/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser2 = null,
  accessTokenUser3 = null,
  accessTokenUser4 = null,
  accessTokenUser51 = null,
  accessTokenUser52 = null,
  accessTokenArchiveManager = null,
  accessTokenAdmin = null;

let datasetPid1 = null,
  datasetPid2 = null,
  datasetPid3 = null,
  jobId = null;


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
  ...TestData.Job, 
  type: "all_access",
};
const jobDatasetPublic = {
  ...TestData.Job, 
  type: "public_access",
}
const jobAuthenticated = {
  ...TestData.Job, 
  type: "authenticated_access"
};
const jobDatasetAccess = {
  ...TestData.Job, 
  type: "dataset_access"
};
const jobDatasetOwner = {
  ...TestData.Job, 
  type: "owner_access"
};
const jobUser51 = {
  ...TestData.Job, 
  type: "user5.1"
};
const jobGroup5 = {
  ...TestData.Job, 
  type: "group5"
};



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

describe.only("1100: Jobs: Test New Job Model", () => {
  before((done) => {
    db.collection("Dataset").deleteMany({});
    db.collection("Job").deleteMany({});

    archiveJob = { ...TestData.ArchiveJob };
    retrieveJob = { ...TestData.RetrieveJob };
    publicJob = { ...TestData.PublicJob };
    done();
  });

  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "adminIngestor",
        password: TestData.Accounts["adminIngestor"]["password"],
      },
      (tokenVal) => {
        accessTokenAdminIngestor = tokenVal;
        utils.getToken(
          appUrl,
          {
            username: "user1",
            password: TestData.Accounts["user1"]["password"],
          },
          (tokenVal) => {
            accessTokenUser1 = tokenVal;
            utils.getToken(
              appUrl,
              {
                username: "user2",
                password: TestData.Accounts["user2"]["password"],
              },
              (tokenVal) => {
                accessTokenUser2 = tokenVal;
                utils.getToken(
                  appUrl,
                  {
                    username: "user5.1",
                    password: TestData.Accounts["user5.1"]["password"],
                  },
                  (tokenVal) => {
                    accessTokenUser51 = tokenVal;
                    utils.getToken(
                      appUrl,
                      {
                        username: "user5.2",
                        password:
                          TestData.Accounts["user5.2"]["password"],
                      },
                      (tokenVal) => {
                        accessTokenUser52 = tokenVal;
                        utils.getToken(
                          appUrl,
                          {
                            username: "admin",
                            password: TestData.Accounts["admin"]["password"],
                          },
                          (tokenVal) => {
                            accessTokenAdmin = tokenVal;
                            done();
                          },
                        );
                      },
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  });

  it.only("0010: adds dataset 1 as Admin Ingestor", async () => {
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

  it.only("0020: adds another new raw dataset", async () => {
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

  it("0030: adds another new raw dataset", async () => {
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
  it("0040: Adds a new job as admin for admin ownerGroup for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "admin";
    jobAll["ownerGroup"] = "admin";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0050: Adds a new job as admin for group1 ownerGroup for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "user1";
    jobAll["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });

  it("0060: Adds a new job as admin for group1 ownerGroup and no ownerUser for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerGroup"] = "group1";
    jobAll["ownerUser"] = "";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0065: Adds a new job as admin for anonymous owner for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerGroup"] = "";
    jobAll["ownerUser"] = "";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });

  it("0070: Adds a new job as user1 for user1 ownerUser and group1 ownerGroup for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "user1";
    jobAll["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0080: Adds a new job as user1 for group1 ownerGroup for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "";
    jobAll["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0090: Adds a new job as user1 for user 5.1 ownerUser and group5 ownerGroup for #all, which should fail as bad request", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "user5.1";
    jobAll["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.not.have.property("ownerGroup");
      });
  });

  it("0100: Adds a new job as user1 for group5 ownerGroup and no ownerUser for #all, which should fail", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "";
    jobAll["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.not.have.property("ownerGroup");
      });
  });
  it("0110: Adds a new job as user5.1 for user5.1 ownerUser and group5 ownerGroup for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid2];
    jobAll["ownerUser"] = "user5.1";
    jobAll["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0120: Adds a new job as user5.1 for group5 ownerGroup for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "";
    jobAll["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0130: Adds a new job as user 5.1 for ownerUser user1 for group1 ownerGroup for #all, which should fail as bad request", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "user1";
    jobAll["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.not.have.property("ownerGroup");
      });
  });

  it("0140: Adds a new job as user5.1 for group1 ownerGroup and no ownerUser for #all, which should fail", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "";
    jobAll["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.should.not.have.property("ownerGroup");
      });
  });
  it("0150: Adds a new job as unauthenticated user for #all", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "";
    jobAll["ownerGroup"] = "";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
      });
  });

  it("0160: Adds a new job as unauthenticated user for group1 ownerGroup for #all, which should fail", async () => {
    jobAll["jobParams"]["datasetIds"] = [datasetPid1];
    jobAll["ownerUser"] = "";
    jobAll["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAll)
      .set("Accept", "application/json")
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0170: Adds a new job as admin for admin ownerGroup with published datasets for #datasetPublic", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1];
    jobDatasetPublic["ownerUser"] = "admin";
    jobDatasetPublic["ownerGroup"] = "admin";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0180: Adds a new job as admin for admin ownerGroup with one unpublished dataset for #datasetPublic", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1, datasetPid2];
    jobDatasetPublic["ownerUser"] = "admin";
    jobDatasetPublic["ownerGroup"] = "admin";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });

  it("0185: Adds a new job as admin for anonymous owner for #datasetPublic", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1];
    jobDatasetPublic["ownerGroup"] = "";
    jobDatasetPublic["ownerUser"] = "";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0190: Adds a new job as user1 for user1 ownerUser and group1 ownerGroup with published datasets for #datasetPublic", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1];
    jobDatasetPublic["ownerUser"] = "user1";
    jobDatasetPublic["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  
  it("0200: Adds a new job as user1 for user1 ownerUser and group1 ownerGroup with onepublished datasets for #datasetPublic", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1, datasetPid2, datasetPid3];
    jobDatasetPublic["ownerUser"] = "user1";
    jobDatasetPublic["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0210: Adds a new job as user5.1 for user5.1 ownerUser and group5 ownerGroup with published datasets for #datasetPublic", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1];
    jobDatasetPublic["ownerUser"] = "user5.1";
    jobDatasetPublic["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  
  it("0220: Adds a new job as user5.1 for user5.1 ownerUser and group5 ownerGroup with onepublished datasets for #datasetPublic, which should fail", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1, datasetPid2, datasetPid3];
    jobDatasetPublic["ownerUser"] = "user5";
    jobDatasetPublic["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0230: Adds a new job as unauthenticated user for #datasetPublic", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1];
    jobDatasetPublic["ownerUser"] = "";
    jobDatasetPublic["ownerGroup"] = "";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
      });
  });

  it.only("0240: Adds a new job as unauthenticated user for #datasetPublic with one unpublished dataset, which should fail", async () => {
    jobDatasetPublic["jobParams"]["datasetIds"] = [datasetPid1, datasetPid2];
    jobDatasetPublic["ownerUser"] = "";
    jobDatasetPublic["ownerGroup"] = "";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetPublic)
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode) // now it's the same error as it should, but the actual check it should go through is not entered 
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });
  it("0250: Adds a new job as unauthenticated user for #authenticated which should fail", async () => {
    jobAuthenticated["jobParams"]["datasetIds"] = [datasetPid1, datasetPid2];
    jobAuthenticated["ownerUser"] = "";
    jobAuthenticated["ownerGroup"] = "";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobAuthenticated)
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0260: Adds a new job as user1 for user1 ownerUser and group1 ownerGroup for #datasetAccess with access to datasets", async () => {
    jobDatasetAccess["jobParams"]["datasetIds"] = [datasetPid1,datasetPid3];
    jobDatasetAccess["ownerUser"] = "user1";
    jobDatasetAccess["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetAccess)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0270: Adds a new job as user1 for user1 ownerUser and group1 ownerGroup for #datasetAccess with a dataset to which it has no access, which should fail", async () => {
    jobDatasetAccess["jobParams"]["datasetIds"] = [datasetPid1,datasetPid2, datasetPid3];
    jobDatasetAccess["ownerUser"] = "user1";
    jobDatasetAccess["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetAccess)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.CreationForbiddenStatusCodeAccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });
  it("0280: Adds a new job as user5.1 for user5.1 ownerUser and group5 ownerGroup for #datasetAccess with access to datasets", async () => {
    jobDatasetAccess["jobParams"]["datasetIds"] = [datasetPid1,datasetPid3];
    jobDatasetAccess["ownerUser"] = "user5.1";
    jobDatasetAccess["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetAccess)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0290: Adds a new job as user5.1 for user5.1 ownerUser and group5 ownerGroup for #datasetAccess with a dataset to which it has no access, which should fail", async () => {
    jobDatasetAccess["jobParams"]["datasetIds"] = [datasetPid1,datasetPid2, datasetPid3];
    jobDatasetAccess["ownerUser"] = "user5.1";
    jobDatasetAccess["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetAccess)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.CreationForbiddenStatusCodeAccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });

  it("0300: Adds a new job as user1 for user1 ownerUser and group1 ownerGroup for #datasetOwner with access to datasets", async () => {
    jobDatasetOwner["jobParams"]["datasetIds"] = [datasetPid1];
    jobDatasetOwner["ownerUser"] = "user1";
    jobDatasetOwner["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetOwner)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0310: Adds a new job as user1 for user1 ownerUser and group1 ownerGroup for #datasetOwner with a dataset to which it has no access, which should fail", async () => {
    jobDatasetOwner["jobParams"]["datasetIds"] = [datasetPid1, datasetPid3];
    jobDatasetOwner["ownerUser"] = "user1";
    jobDatasetOwner["ownerGroup"] = "group1";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetOwner)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.CreationForbiddenStatusCodeAccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });
  it("0320: Adds a new job as user5.1 for user5.1 ownerUser and group5 ownerGroup for #datasetOwner with access to datasets", async () => {
    jobDatasetOwner["jobParams"]["datasetIds"] = [datasetPid3];
    jobDatasetOwner["ownerUser"] = "user5.1";
    jobDatasetOwner["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetOwner)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal('jobCreated');
        jobId = res.body["id"];
      });
  });
  it("0330: Adds a new job as user5.1 for user5.1 ownerUser and group5 ownerGroup for #datasetOwner with a dataset to which it has no access, which should fail", async () => {
    jobDatasetOwner["jobParams"]["datasetIds"] = [datasetPid2];
    jobDatasetOwner["ownerUser"] = "user5.1";
    jobDatasetOwner["ownerGroup"] = "group5";
    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(jobDatasetOwner)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.CreationForbiddenStatusCodeAccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
      });
  });
  // it("0050: Adds a new archive job request contains empty datasetList, which should fail", async () => {
  //   const empty = { ...TestData.ArchiveJob };
  //   empty.datasetList = [];
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(empty)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.should.have.property("error");
  //     });
  // });

  // it("0060: Adds a new archive job request on non exist dataset which should fail", async () => {
  //   let nonExistDataset = {
  //     ...TestData.ArchiveJob,
  //     datasetList: [
  //       {
  //         pid: "dummy",
  //         files: [],
  //       },
  //     ],
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(nonExistDataset)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res, err) => {
  //       if (err) {
  //         return done(err);
  //       }
  //       res.body.should.have.property("message");
  //     });
  // });

  // it("0070: Check if dataset 1 was updated by job request", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Datasets/" + pid1)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulGetStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.archivable")
  //         .and.equal(false);
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.retrievable")
  //         .and.equal(false);
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.archiveStatusMessage")
  //         .and.equal("scheduledForArchiving");
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.publishable")
  //         .and.equal(false);

  //       datasetLiveCycle1 = res.body.datasetlifecycle;
  //     });
  // });
  // it("0080: Check if dataset 2 was updated by job request", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Datasets/" + pid2)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulGetStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.archivable")
  //         .and.equal(false);
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.retrievable")
  //         .and.equal(false);
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.archiveStatusMessage")
  //         .and.equal("scheduledForArchiving");
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.publishable")
  //         .and.equal(false);
  //       datasetLiveCycle2 = res.body.datasetlifecycle;
  //     });
  // });

  // it("0090: Create retrieve job request on same dataset, which should fail as well because not yet retrievable", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(TestData.RetrieveJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.ConflictStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res, err) => {
  //       if (err) {
  //         return done(err);
  //       }
  //       res.body.should.have.property("error");
  //     });
  // });

  // it("0100: Send an update status to dataset 1, simulating the archive system response", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Datasets/" + pid1)
  //     .send({
  //       datasetlifecycle: {
  //         ...datasetLiveCycle1,
  //         retrievable: true,
  //         archiveStatusMessage: "datasetOnArchiveDisk",
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.retrievable")
  //         .and.equal(true);
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.publishable")
  //         .and.equal(false);
  //     });
  // });
  // it("0110: Send an update status to dataset 2, simulating the archive system response", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Datasets/" + pid2)
  //     .send({
  //       datasetlifecycle: {
  //         ...datasetLiveCycle2,
  //         retrievable: true,
  //         archiveStatusMessage: "datasetOnArchiveDisk",
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.retrievable")
  //         .and.equal(true);
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.publishable")
  //         .and.equal(false);
  //     });
  // });

  // // change policy to suppress emails
  // it("0120: Disable notification by email", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Policies/updateWhere")
  //     .send({
  //       ownerGroupList: TestData.RawCorrect.ownerGroup,
  //       data: {
  //         archiveEmailNotification: false,
  //         retrieveEmailNotification: false,
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .set("Content-Type", "application/x-www-form-urlencoded")
  //     .expect(TestData.SuccessfulPostStatusCode)
  //     .then((res) => {
  //       console.log("Result policy update:", res.body);
  //       //res.body.not.equal({});
  //     });
  // });

  // it("0130: Adds a new archive job request for same data which should fail", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(TestData.ArchiveJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.ConflictStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res, err) => {
  //       if (err) {
  //         return done(err);
  //       }
  //       res.body.should.have.property("error");
  //     });
  // });

  // it("0140: Send an update status to the archive job request, signal successful archiving", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Jobs/" + archiveJobId)
  //     .send({
  //       jobStatusMessage: "finishedSuccessful",
  //       jobResultObject: {
  //         status: "okay",
  //         message: "Archive job was finished successfully",
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/);
  // });

  // it("0150: Adds a new retrieve job request on same dataset, which should succeed now", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(TestData.RetrieveJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res, err) => {
  //       if (err) {
  //         return done(err);
  //       }
  //       res.body.should.have.property("id");
  //       retrieveJobId = res.body["id"];
  //     });
  // });

  // it("0160: Read contents of dataset 1 after retrieve job and make sure that still retrievable", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Datasets/" + pid1)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulGetStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.retrievable")
  //         .and.equal(true);
  //     });
  // });

  // it("0170: Send an update status to the dataset", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Datasets/" + pid1)
  //     .send({
  //       datasetlifecycle: {
  //         ...datasetLiveCycle1,
  //         retrieveReturnMessage: {
  //           text: "Some dummy retrieve message",
  //         },
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested.property(
  //         "datasetlifecycle.retrieveReturnMessage",
  //       );
  //     });
  // });

  // it("0180: Send an update status to the dataset, simulating the archive system response of finished job with partial failure", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Datasets/" + pid1)
  //     .send({
  //       datasetlifecycle: {
  //         ...datasetLiveCycle1,
  //         retrievable: true,
  //         archiveStatusMessage: "datasetOnArchiveDisk",
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.retrievable")
  //         .and.equal(true);
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.publishable")
  //         .and.equal(false);
  //     });
  // });

  // it("0190: Send an update status message to the Job", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Jobs/" + retrieveJobId)
  //     .send({
  //       jobStatusMessage: "finishedUnsuccessful",
  //       jobResultObject: {
  //         status: "bad",
  //         message: "System A failed",
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("jobResultObject");
  //     });
  // });

  // it("0200: Send an update status to the datasets, simulating the archive system response of successful job", async () => {
  //   await request(appUrl)
  //     .patch("/api/v3/Datasets/" + pid1)
  //     .send({
  //       datasetlifecycle: {
  //         ...datasetLiveCycle1,
  //         retrievable: true,
  //         archiveStatusMessage: "datasetOnArchiveDisk",
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.retrievable")
  //         .and.equal(true);
  //     });

  //   return request(appUrl)
  //     .patch("/api/v3/Datasets/" + pid2)
  //     .send({
  //       datasetlifecycle: {
  //         ...datasetLiveCycle2,
  //         retrievable: true,
  //         archiveStatusMessage: "datasetOnArchiveDisk",
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested
  //         .property("datasetlifecycle.retrievable")
  //         .and.equal(true);
  //     });
  // });

  // it("0210: Send an update status message to the Job", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Jobs/" + retrieveJobId)
  //     .send({
  //       jobStatusMessage: "finishedSuccessful",
  //       jobResultObject: {
  //         status: "okay",
  //         message: "Job archiving worked",
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("jobStatusMessage").and.be.string;
  //     });
  // });

  // // NOTE: Missing endpoint!!! /api/v3/Jobs/update?where. Do we need one???
  // // it("Bulk update Job status prepare to trigger sending email mechanism", async () => {
  // //   const filter = {
  // //     id: {
  // //       inq: [archiveJobId, retrieveJobId],
  // //     },
  // //   };
  // //   return request(appUrl)
  // //     .post("/api/v3/Jobs/update?where=" + JSON.stringify(filter))
  // //     .send({
  // //       jobStatusMessage: "test",
  // //     })
  // //     .set("Accept", "application/json")
  // //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  // //     .expect(200)
  // //     .expect("Content-Type", /json/)
  // //     .then((res) => {
  // //       res.body.should.have.property("count").and.equal(2);
  // //       return;
  // //     });
  // // });

  // // NOTE: Missing endpoint!!! /api/v3/Jobs/update?where. Do we need one???
  // // it("Bulk update Job status, should send out email", async () => {
  // //   var filter = {
  // //     id: {
  // //       inq: [archiveJobId, retrieveJobId],
  // //     },
  // //   };
  // //   return request(appUrl)
  // //     .post("/api/v3/Jobs/update?where=" + JSON.stringify(filter))
  // //     .send({
  // //       jobStatusMessage: "finishedSuccessful",
  // //     })
  // //     .set("Accept", "application/json")
  // //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  // //     .expect(200)
  // //     .expect("Content-Type", /json/)
  // //     .then((res) => {
  // //       res.body.should.have.property("count").and.equal(2);
  // //       //setTimeout(done, 3000);
  // //       return;
  // //     });
  // // });

  // it("0220: adds a new origDatablock", async () => {
  //   return request(appUrl)
  //     .post(`/api/v3/datasets/${pid1}/OrigDatablocks`)
  //     .send(TestData.OrigDataBlockCorrect1)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have
  //         .property("size")
  //         .and.equal(TestData.OrigDataBlockCorrect1.size);
  //       res.body.should.have.property("id").and.be.string;
  //       origDatablockId = res.body["id"];
  //     });
  // });

  // it("0230: Adds a new public job request on private datasets, which should fails", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(publicJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.ConflictStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("error");
  //     });
  // });

  // it("0240: Set to true for one of the dataset", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Datasets/" + pid1)
  //     .send({
  //       isPublished: true,
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested.property("isPublished").and.equal(true);
  //     });
  // });

  // it("0250: Adds a new public job request on one public and one private dataset, which should fails", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(publicJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.ConflictStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("error");
  //     });
  // });

  // it("0260: Update isPublished to true on second dataset", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Datasets/" + pid2)
  //     .send({
  //       isPublished: true,
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.nested.property("isPublished").and.equal(true);
  //     });
  // });

  // it("0270: Adds a new public job request without authentication", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(publicJob)
  //     .set("Accept", "application/json")
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       publicJobIds.push(res.body["id"]);
  //     });
  // });

  // it("0280: Adds a new public job request with authentication", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(publicJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       publicJobIds.push(res.body["id"]);
  //     });
  // });

  // it("0290: Send an update status to the public job request, signal finished job with partial failure", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Jobs/" + publicJobIds[0])
  //     .send({
  //       jobStatusMessage: "finishedUnsuccessful",
  //       jobResultObject: {
  //         good: [
  //           {
  //             pid: decodeURIComponent(pid1),
  //             downloadLink: "Globus link",
  //           },
  //         ],
  //         bad: [
  //           {
  //             pid: decodeURIComponent(pid2),
  //             downloadLink: "Globus link",
  //             availableFiles: [
  //               {
  //                 file: "N1039-1.tif",
  //                 reason: "ok",
  //               },
  //               {
  //                 file: "N1039-2.tif",
  //                 reason: "ok",
  //               },
  //             ],
  //             unavailableFiles: [
  //               {
  //                 file: "N1039-3.tif",
  //                 reason: "no space in destination",
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/);
  // });

  // it("0300: Adds a new public job request to download some selected files", async () => {
  //   publicJob.datasetList[0].files = ["N1039-1.tif", "N1039-2.tif"];
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(publicJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       //reset
  //       publicJob.datasetList[0].files = [];

  //       res.body.should.have.property("type").and.be.string;
  //       publicJobIds.push(res.body["id"]);
  //     });
  // });

  // it("0310: Send an update status to the public job request, signal successful job", async () => {
  //   return request(appUrl)
  //     .patch("/api/v3/Jobs/" + publicJobIds[1])
  //     .send({
  //       jobStatusMessage: "finishedSuccessful",
  //       jobResultObject: {
  //         good: [
  //           {
  //             pid: pid1,
  //             downloadLink: "Globus link 1",
  //           },
  //           {
  //             pid: pid2,
  //             downloadLink: "Globus link 2",
  //           },
  //         ],
  //         bad: [],
  //       },
  //     })
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulPatchStatusCode)
  //     .expect("Content-Type", /json/);
  // });

  // // NOTE: We don't have put endpoint on the jobs here, only patch.
  // // Patch without id is returning 404 nor found. Maybe this will be valid one if we need and add put endpoint later?
  // // it("Add new job using put, which should fails. Ensure that adding new job without authentication using put is not possible ", async () => {
  // //   return request(appUrl)
  // //     .put("/api/v3/Jobs/")
  // //     .send(testPublicJob)
  // //     .set("Accept", "application/json")
  // //     .expect(401)
  // //     .expect("Content-Type", /json/);
  // // });

  // it("0320: Adds a new public job request with to download some selected files that dont exist, which should fail", async () => {
  //   publicJob.datasetList[0].files = ["N1039-1.tif", "N1039-101.tif"];
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(publicJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       //reset
  //       publicJob.datasetList[0].files = [];

  //       res.should.have.property("error").and.be.string;
  //     });
  // });

  // it("0330: should delete the archive Job", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Jobs/" + archiveJobId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode)
  //     .expect("Content-Type", /json/);
  // });

  // it("0340: should delete the retrieve Job", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Jobs/" + retrieveJobId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode);
  // });

  // publicJobIds.forEach((jobId) => {
  //   it("0350: should delete the public Job" + jobId, async () => {
  //     return request(appUrl)
  //       .delete("/api/v3/Jobs/" + jobId)
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //       .expect(TestData.SuccessfulDeleteStatusCode)
  //       .expect("Content-Type", /json/);
  //   });
  // });

  // it("0360: should delete the originDataBlock", async () => {
  //   return request(appUrl)
  //     .delete(`/api/v3/datasets/${pid1}/OrigDatablocks/` + origDatablockId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode);
  // });

  // it("0370: should delete the dataset #1", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Datasets/" + pid1)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode)
  //     .expect("Content-Type", /json/);
  // });

  // it("0390: should delete the dataset #2", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Datasets/" + pid2)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode)
  //     .expect("Content-Type", /json/);
  // });
});
