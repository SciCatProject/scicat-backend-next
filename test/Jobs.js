/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser3 = null,
  accessTokenUser51 = null,
  accessTokenUser52 = null,
  accessTokenAdmin = null;

let datasetPid1 = null,
  datasetPid2 = null,
  datasetPid3 = null,
  jobId1 = null,
  encodedJobId1 = null,
  jobId2 = null,
  encodedJobId2 = null,
  jobId3 = null,
  encodedJobId3 = null,
  jobId4 = null,
  encodedJobId4 = null,
  jobId5 = null,
  encodedJobId5 = null,
  jobId6 = null,
  encodedJobId6 = null,
  jobId7 = null, // need to first create a job for that
  encodedJobId7 = null,
  jobId8 = null,
  encodedJobId8 = null;


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
  type: "user_access"
};
const jobGroup5 = {
  ...TestData.Job, 
  type: "group_access"
};

describe.only("1100: Jobs: Test New Job Model", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("Job").deleteMany({});
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
                username: "user3",
                password: TestData.Accounts["user3"]["password"],
              },
              (tokenVal) => {
                accessTokenUser3 = tokenVal;
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
  
  it("0040: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with no datasets, which should fail", async () => {
    const newDataset = {
      ...jobAll,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id")
      });
  });

  it("0050: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with not existing dataset IDs, which should fail", async () => {
    const newDataset = {
      ...jobAll,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: ["fakeID"],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id")
      });
  });

  it("0060: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with no datasetIds parameter", async () => {
    const newDataset = {
      ...jobAll,
      ownerUser: "admin",
      ownerGroup: "admin",
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
        jobId1 = res.body["id"];
        encodedJobId1 = encodeURIComponent(jobId1);
      });
  });

  // it("0039: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with no jobParams parameter", async () => {
  //   const newDataset = {
  //     type: "public_access",
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newDataset)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.propert("message").and.be.equal("Dataset ids list was not provided in jobParams");
  //     });
  // });

  it("0070: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration", async () => {
    const newDataset = {
      ...jobAll,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0080: Add a new job as a user from ADMIN_GROUPS for another user in '#all' configuration", async () => {
    const newDataset = {
      ...jobAll,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
        jobId2 = res.body["id"];
        encodedJobId2 = encodeURIComponent(jobId2);
      });
  });

  it("0090: Add a new job as a user from ADMIN_GROUPS for undefined user from another group user in '#all' configuration", async () => {
    const newDataset = {
      ...jobAll,
      ownerGroup: "group1",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
        jobId3 = res.body["id"];
        encodedJobId3 = encodeURIComponent(jobId3);
      });
  });

  it("0100: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#all' configuration", async () => {
    const newDataset = {
      ...jobAll,
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
        jobId6 = res.body["id"];
        encodedJobId6 = encodeURIComponent(jobId6);
      });
  });

  it("0110: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#all' configuration", async () => {
    const newDataset = {
      ...jobAll,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0120: Add a new job as a user from CREATE_JOB_GROUPS for his/her group in '#all' configuration", async () => {
    const newDataset = {
      ...jobAll,
      ownerGroup: "group1",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0130: AAdd a new job as a user from CREATE_JOB_GROUPS for another user in '#all' configuration, which should fail as bad request", async () => {
    const newDataset = {
      ...jobAll,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
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
    const newDataset = {
      ...jobAll,
      ownerGroup: "group5",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
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
    const newDataset = {
      ...jobAll,
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
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
    const newDataset = {
      ...jobAll,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
        jobId4 = res.body["id"];
        encodedJobId4 = encodeURIComponent(jobId4);
      });
  });

  it("0170:Add a new job as a normal user for his/her group in '#all' configuration", async () => {
    const newDataset = {
      ...jobAll,
      ownerGroup: "group5",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
        jobId5 = res.body["id"];
        encodedJobId5 = encodeURIComponent(jobId5);
      });
  });

  it("0180: Add a new job as a normal user for another user in '#all' configuration, which should fail as bad request", async () => {
    const newDataset = {
      ...jobAll,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
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
    const newDataset = {
      ...jobAll,
      ownerGroup: "group1",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
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
    const newDataset = {
      ...jobAll,
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
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
    const newDataset = {
      ...jobAll,
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerUser");
        res.body.should.not.have.property("ownerGroup");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0220: Adds a new job as unauthenticated user for another user in '#all' configuration, which should fail as bad request", async () => {
    const newDataset = {
      ...jobAll,
      ownerGroup: "group1",
      jobParams: {
        ...jobAll.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. Unauthenticated user cannot initiate a job owned by another user.");
      });
  });
  
  it("0230: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with all published datasets", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0240: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with one unpublished dataset", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0250: Add a new job as a user from ADMIN_GROUPS for another user in '#datasetPublic' configuration with one unpublished dataset", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0260: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetPublic' configuration with one unpublished dataset", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0270: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#datasetPublic' configuration with one unpublished dataset", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0280: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetPublic' configuration with all published datasets", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });
  
  it("0290: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetPublic' configuration with one unpublished dataset", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0300: Add a new job as a normal user himself/herself in '#datasetPublic' configuration with all published datasets", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1,],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });
  
  it("0310: Add a new job as a normal user himself/herself in '#datasetPublic' configuration with one unpublished dataset, which should fail ad forbidden", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this dataset.");
      });
  });

  it("0320: Add a new job as anonymous user in '#datasetPublic' configuration with all published datasets", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerUser");
        res.body.should.not.have.property("ownerGroup");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0330: Add a new job as anonymous user in '#datasetPublic' configuration with one unpublished dataset, which should fail as forbidden", async () => {
    const newDataset = {
      ...jobDatasetPublic,
      jobParams: {
        ...jobDatasetPublic.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode) 
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this dataset.");
      });
  });

  it("0340: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#authenticated' configuration", async () => {
    const newDataset = {
      ...jobAuthenticated,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobAuthenticated.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0350: Add a new job as a user from ADMIN_GROUPS for another user in '#authenticated' configuration", async () => {
    const newDataset = {
      ...jobAuthenticated,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobAuthenticated.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });  
  it("0360: Add a new job as a user from ADMIN_GROUPS for another group in '#authenticated' configuration", async () => {
    const newDataset = {
      ...jobAuthenticated,
      ownerGroup: "group1",
      jobParams: {
        ...jobAuthenticated.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0370: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#authenticated' configuration", async () => {
    const newDataset = {
      ...jobAuthenticated,
      jobParams: {
        ...jobAuthenticated.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0380: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#authenticated' configuration", async () => {
    const newDataset = {
      ...jobAuthenticated,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobAuthenticated.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0390: Add a new job as a normal user for himself/herself in '#authenticated' configuration", async () => {
    const newDataset = {
      ...jobAuthenticated,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobAuthenticated.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0400: Add a new job as unauthenticated user in '#authenticated' configuration, which should fail as forbidden", async () => {
    const newDataset = {
      ...jobAuthenticated,
      jobParams: {
        ...jobAuthenticated.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this dataset.");
      });
  });
 
  it("0410: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetAccess' configuration", async () => {
    const newDataset = {
      ...jobDatasetAccess,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobDatasetAccess.jobParams,
        datasetIds: [datasetPid1, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0420: Add a new job as a user from ADMIN_GROUPS for another user in '#datasetAccess' configuration", async () => {
    const newDataset = {
      ...jobDatasetAccess,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetAccess.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0430: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetAccess' configuration", async () => {
    const newDataset = {
      ...jobDatasetAccess,
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetAccess.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0440: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#datasetAccess' configuration", async () => {
    const newDataset = {
      ...jobDatasetAccess,
      jobParams: {
        ...jobDatasetAccess.jobParams,
        datasetIds: [datasetPid1, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0450: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetAccess' configuration with access to datasets", async () => {
    const newDataset = {
      ...jobDatasetAccess,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetAccess.jobParams,
        datasetIds: [datasetPid1, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });


  it("0460: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetAccess' configuration with no access to datasets", async () => {
    const newDataset = {
      ...jobDatasetAccess,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetAccess.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0470: Adds a new job as user1 for user5.1 ownerUser and group5 ownerGroup for #datasetAccess, which should fail", async () => {
      const newDataset = {
        ...jobDatasetAccess,
        ownerUser: "user5.1",
        ownerGroup: "group5",
        jobParams: {
          ...jobDatasetAccess.jobParams,
          datasetIds: [datasetPid1, datasetPid2, datasetPid3],
        },
      };
      return request(appUrl)
        .post("/api/v3/Jobs")
        .send(newDataset)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("id");
          res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
        });
    });

  it("0480: Add a new job as a normal user for himself/herself in '#datasetAccess' configuration with access to datasets", async () => {
    const newDataset = {
      ...jobDatasetAccess,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobDatasetAccess.jobParams,
        datasetIds: [datasetPid1, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0490: Add a new job as a normal user for himself/herself in '#datasetAccess' configuration with no access to datasets, which should fail as forbidden", async () => {
    const newDataset = {
      ...jobDatasetAccess,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobDatasetAccess.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this dataset.");
      });
  });

  it("0500: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetOwner' configuration", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0510: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetOwner' configuration", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0520: Add a new job as a user from ADMIN_GROUPS for another user in '#datasetOwner' configuration", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0530: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetOwner' configuration", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0540: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#datasetOwner' configuration", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid1, datasetPid2, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0550: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetOwner' configuration with datasets owned by his/her group", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0560: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetOwner' configuration with datasets owned by his/her group", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid1, datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0570: Add a new job as a normal user for himself/herself in '#datasetOwner' configuration with datasets owned by his/her group", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid3],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0580: Add a new job as a normal user for himself/herself in '#datasetOwner' configuration with datasets not owned by his/her group, which should fail as forbidden", async () => {
    const newDataset = {
      ...jobDatasetOwner,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobDatasetOwner.jobParams,
        datasetIds: [datasetPid1],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this dataset.");
      });
  });


  it("0590: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#USER5.1' configuration", async () => {
    const newDataset = {
      ...jobUser51,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0600: Add a new job as a user from ADMIN_GROUPS for another user in '#USER5.1' configuration", async () => {
    const newDataset = {
      ...jobUser51,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0610: Add a new job as a user from ADMIN_GROUPS for another group in '#USER5.1' configuration", async () => {
    const newDataset = {
      ...jobUser51,
      ownerGroup: "group1",
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0620: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#USER5.1' configuration", async () => {
    const newDataset = {
      ...jobUser51,
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0630: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself user in '#USER5.1' configuration", async () => {
    const newDataset = {
      ...jobUser51,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0640: Add a new job as a user from CREATE_JOB_GROUPS for user5.1 in '#USER5.1' configuration, which should fail as bad request", async () => {
    const newDataset = {
      ...jobUser51,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
      });
  });

  it("0650: Adds a new job as user5.1 himself/herself in '#USER5.1' configuration", async () => {
    const newDataset = {
      ...jobUser51,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });


  it("0660: Adds a new job as user5.1 for no ownerUser and group5 ownerGroup in #USER5.1 configuration", async () => {
    const newDataset = {
      ...jobUser51,
      ownerGroup: "group5",
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0670: Adds a new job as user5.2 for himself/herself in #USER5.1, which should fail as forbidden", async () => {
    const newDataset = {
      ...jobUser51,
      ownerUser: "user5.2",
      ownerGroup: "group5",
      jobParams: {
        ...jobUser51.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser52}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this dataset.");
      });
  });

  it("0680: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#@group5' configuration", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("admin");
        res.body.should.have.property("ownerUser").and.be.equal("admin");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0690: Add a new job as a user from ADMIN_GROUPS for another user in '#@group5' configuration", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0700: Add a new job as a user from ADMIN_GROUPS for another group in '#@group5' configuration", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerGroup: "group1",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0710: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#@group5' configuration", async () => {
    const newDataset = {
      ...jobGroup5,
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.not.have.property("ownerGroup");
        res.body.should.not.have.property("ownerUser");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0720: Add a new job as a user from CREATE_JOB_GROUPS for another group in '#@group5' configuration", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group1");
        res.body.should.have.property("ownerUser").and.be.equal("user1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0730: Add a new job as a user from CREATE_JOB_GROUPS for user 5.1 in '#@group5' configuration, which should fail as bad request", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
      });
  });

  it("0740: Add a new job as a user 5.1 for himself/herself in '#@group5' configuration", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0750: Add a new job as a user 5.1 for another user in his/her group in '#@group5' configuration", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerGroup: "group5",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0760: Add a new job as a user 5.2 for himself/herself in '#@group5' configuration", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerUser: "user5.2",
      ownerGroup: "group5",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser52}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.2");
        res.body.should.have.property("statusMessage").to.be.equal("jobCreated");
      });
  });

  it("0770: Adds a new job as user3 for himself/herself in #@group5 configuration, which should fail as forbidden", async () => {
    const newDataset = {
      ...jobGroup5,
      ownerUser: "user3",
      ownerGroup: "group3",
      jobParams: {
        ...jobGroup5.jobParams,
        datasetIds: [datasetPid1, datasetPid2],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newDataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this dataset.");
      });
  });

  it("0780: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#all' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedJobId1}`)
        .send({ 
          statusCode: "update status of a job", 
          statusMessage: "job finished/blocked/etc", 
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
});

it("0790: Adds a Status update to a job as a user from ADMIN_GROUPS for another user's job in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId2}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});

it("0800: Adds a Status update to a job as a user from ADMIN_GROUPS for another group's job in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId3}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});

it("0810: Adds a Status update to a job as a user from ADMIN_GROUPS for anonym user's job in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId6}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});

it("0820: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her job in '#all' configuration", async () => {
  
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId2}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
 });
it("0830: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId4}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});
it("0840: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her group in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId3}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});
it("0850: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId4}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});

it("0860: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonym user's group in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId6}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});
it("0870: Adds a Status update to a job as a normal user  for his/her job in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId4}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});
it("0880: Adds a Status update to a job as a normal user for another user's job in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId2}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});
it("0890: Adds a Status update to a job as a normal user for his/her group in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId5}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});
it("0900: Adds a Status update to a job as a normal user for another user's group in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId3}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});


it("0910: Adds a Status update to a job as a normal user for anonym user's group in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId6}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
});
it("0920: Adds a Status update to a job as unauthhenticated user for anonymous job in '#all' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedJobId6}`)
      .send({ 
        statusCode: "update status of a job", 
        statusMessage: "job finished/blocked/etc", 
      })
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
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
  //       ret
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

  // // NOTE: We don't have put endpoint on the jobs here, patch.
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
