/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenAdminIngestor = null,
  accessTokenUser1 = null,
  accessTokenUser3 = null,
  accessTokenUser51 = null,
  accessTokenUser52 = null,
  accessTokenAdmin = null,
  accessTokenArchiveManager = null;

let datasetPid1 = null,
  datasetPid2 = null,
  datasetPid3 = null,
  
  // for #all job permissions
  allJob1 = null,
  encodedAllJobOwnedByAdmin = null,
  allJob2 = null,
  encodedAllJobOwnedByUser1 = null,
  allJob3 = null,
  encodedAllJobOwnedByGroup1 = null,
  allJob4 = null,
  encodedAllJobOwnedByUser51 = null,
  allJob5 = null,
  encodedAllJobOwnedByGroup5 = null,
  allJob6 = null,
  encodedAllJobOwnedByAnonym = null,

  // for #dataset_owner job permissions
  datasetOwnerJob1 = null,
  encodedDatasetOwnerJobOwnedByAdmin = null,
  datasetOwnerJob2 = null,
  encodedDatasetOwnerJobOwnedByUser1 = null,
  datasetOwnerJob3 = null,
  encodedDatasetOwnerJobOwnedByGroup1 = null,
  datasetOwnerJob4 = null,
  encodedDatasetOwnerJobOwnedByUser51 = null,
  datasetOwnerJob5 = null,
  encodedDatasetOwnerJobOwnedByGroup5 = null,
  datasetOwnerJob6 = null,
  encodedDatasetOwnerJobOwnedByAnonym = null,

  // for #dataset_access job permissions
  datasetAccessJob1 = null,
  encodedDatasetAccessJobOwnedByAdmin = null,
  datasetAccessJob2 = null,
  encodedDatasetAccessJobOwnedByUser1 = null,
  datasetAccessJob3 = null,
  encodedDatasetAccessJobOwnedByGroup1 = null,
  datasetAccessJob4 = null,
  encodedDatasetAccessJobOwnedByUser51 = null,
  datasetAccessJob5 = null,
  encodedDatasetAccessJobOwnedByGroup5 = null,
  datasetAccessJob6 = null,
  encodedDatasetAccessJobOwnedByAnonym = null,

  // for user-based job permissions (USER5.1)
  userSpecJob1 = null,
  encodedUserSpecJobOwnedByAdmin = null,
  userSpecJob2 = null,
  encodedUserSpecJobOwnedByUser1 = null,
  userSpecJob3 = null,
  encodedUserSpecJobOwnedByGroup1 = null,
  userSpecJob4 = null,
  encodedUserSpecJobOwnedByUser51 = null,
  userSpecJob5 = null,
  encodedUserSpecJobOwnedByGroup5 = null,
  userSpecJob6 = null,
  encodedUserSpecJobOwnedByAnonym = null,
  userSpecJob7 = null,
  encodedUserSpecJobOwnedByUser52 = null,

  // for group-based job permissions (GROUP5)
  groupSpecJob1 = null,
  encodedGroupSpecJobOwnedByAdmin = null,
  groupSpecJob2 = null,
  encodedGroupSpecJobOwnedByUser1 = null,
  groupSpecJob3 = null,
  encodedGroupSpecJobOwnedByGroup1 = null,
  groupSpecJob4 = null,
  encodedGroupSpecJobOwnedByUser51 = null,
  groupSpecJob5 = null,
  encodedGroupSpecJobOwnedByGroup5 = null,
  groupSpecJob6 = null,
  encodedGroupSpecJobOwnedByAnonym = null,
  groupSpecJob7 = null,
  encodedGroupSpecJobOwnedByUser52 = null,
  groupSpecJob8 = null,
  encodedGroupSpecJobOwnedByUser3 = null,

  jobIdValidate1 = null,
  encodedJobIdValidate1 = null;

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
const jobDatasetPublic = {
  type: "public_access",
}
const jobAuthenticated = {
  type: "authenticated_access"
};
const jobDatasetAccess = {
  type: "dataset_access"
};
const jobDatasetOwner = {
  type: "owner_access"
};
const jobUser51 = {
  type: "user_access"
};
const jobGroup5 = {
  type: "group_access"
};
const archiveJob = {
  type: "archive"
};
const retrieveJob = {
  type: "retrieve"
};
const publicJob = {
  type: "public"
};
const jobValidate = {
  type: "validate"
};

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

  after(() => { // because we're not deleting all the jobs and don't delete datasets
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

  // it("0040: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with no datasets in job parameters, which should fail", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //     jobParams: {
  //       datasetList: [],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id")
  //       res.body.should.have.property("message").and.be.equal("List of passed datasets is empty.");
  //     });
  // });

  // it("0050: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with not existing dataset IDs, which should fail", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //     jobParams: {
  //       datasetList: [
  //         { pid: "fakeID", files: [] },
  //         { pid: "fakeID2", files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id")
  //       res.body.should.have.property("message").and.be.equal("Datasets with pid fakeID,fakeID2 do not exist.");
  //     });
  // });

  // it("0060: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with no jobParams parameter, which should fail", async () => {
  //   const newJob = {
  //     type: "all_access",
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //     });
  // });

  // it("0065: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with empty jobParams parameter", async () => {
  //   const newJob = {
  //     type: "all_access",
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //     jobParams: {},
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("admin");
  //       res.body.should.have.property("ownerUser").and.be.equal("admin");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0070: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("admin");
  //       res.body.should.have.property("ownerUser").and.be.equal("admin");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       allJob1 = res.body["id"];
  //       encodedAllJobOwnedByAdmin = encodeURIComponent(allJob1);
  //     });
  // });

  // it("0080: Add a new job as a user from ADMIN_GROUPS for another user in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       allJob2 = res.body["id"];
  //       encodedAllJobOwnedByUser1 = encodeURIComponent(allJob2);
  //     });
  // });

  // it("0090: Add a new job as a user from ADMIN_GROUPS for undefined user from another group user in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       allJob3 = res.body["id"];
  //       encodedAllJobOwnedByGroup1 = encodeURIComponent(allJob3);
  //     });
  // });

  // it("0100: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.not.have.property("ownerGroup");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       allJob6 = res.body["id"];
  //       encodedAllJobOwnedByAnonym = encodeURIComponent(allJob6);
  //     });
  // });

  // it("0110: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0120: Add a new job as a user from CREATE_JOB_GROUPS for his/her group in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0130: Add a new job as a user from CREATE_JOB_GROUPS for another user in '#all' configuration, which should fail as bad request", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerUser: "user5.1",
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
  //     });
  // });

  // it("0140: Add a new job as a user from CREATE_JOB_GROUPS for another group in '#all' configuration, which should fail as bad request", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Invalid new job. User needs to belong to job owner group.");
  //     });
  // });

  // it("0150: Add a new job as a user from CREATE_JOB_GROUPS for anonymous user in '#all' configuration, which should fail as bad request", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Invalid new job. Owner group should be specified.");
  //     });
  // });

  // it("0160: Add a new job as a normal user for himself/herself in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerUser: "user5.1",
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group5");
  //       res.body.should.have.property("ownerUser").and.be.equal("user5.1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       allJob4 = res.body["id"];
  //       encodedAllJobOwnedByUser51 = encodeURIComponent(allJob4);
  //     });
  // });

  // it("0170: Add a new job as a normal user for his/her group in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group5");
  //       res.body.should.have.property("ownerUser").and.be.equal("user5.1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       allJob5 = res.body["id"];
  //       encodedAllJobOwnedByGroup5 = encodeURIComponent(allJob5);
  //     });
  // });

  // it("0180: Add a new job as a normal user for another user in '#all' configuration, which should fail as bad request", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
  //     });
  // });

  // it("0190: Add a new job as a normal user for another group in '#all' configuration, which should fail as bad request", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Invalid new job. User needs to belong to job owner group.");
  //     });
  // });

  // it("0200: Add a new job as a normal user for anonymous user in '#all' configuration, which should fail as bad request", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Invalid new job. Owner group should be specified.");
  //     });
  // });

  // it("0210: Adds a new job as unauthenticated user in '#all' configuration", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.not.have.property("ownerGroup");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0220: Adds a new job as unauthenticated user for another user in '#all' configuration, which should fail as bad request", async () => {
  //   const newJob = {
  //     ...jobAll,
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Invalid new job. Unauthenticated user cannot initiate a job owned by another user.");
  //     });
  // });

  // it("0230: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with all published datasets", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("admin");
  //       res.body.should.have.property("ownerUser").and.be.equal("admin");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0240: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with one unpublished dataset", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("admin");
  //       res.body.should.have.property("ownerUser").and.be.equal("admin");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0250: Add a new job as a user from ADMIN_GROUPS for another user in '#datasetPublic' configuration with one unpublished dataset", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0260: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetPublic' configuration with one unpublished dataset", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0270: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#datasetPublic' configuration with one unpublished dataset", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.not.have.property("ownerGroup");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0280: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetPublic' configuration with all published datasets", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0290: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetPublic' configuration with one unpublished dataset", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0300: Add a new job as a normal user himself/herself in '#datasetPublic' configuration with a published dataset", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     ownerUser: "user5.1",
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group5");
  //       res.body.should.have.property("ownerUser").and.be.equal("user5.1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0310: Add a new job as a normal user himself/herself in '#datasetPublic' configuration with unpublished datasets, which should fail as forbidden", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     ownerUser: "user5.1",
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.AccessForbiddenStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
  //     });
  // });

  
  it("0311: Add a new public job as a normal user himself/herself with a published dataset", async () => {
    const newJob = {
      ...publicJob,
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
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.1");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0312: Add a new public job as a normal user himself/herself with unpublished datasets, which should fail", async () => {
    const newJob = {
      ...publicJob,
      ownerUser: "user5.1",
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
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("The following datasets are not public.");
      });
  });

  it("0313: Add a new archive job as a normal user himself/herself with an archivable dataset", async () => {
    const newJob = {
      ...archiveJob,
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
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  it("0314: Add a new retrieve job as a normal user himself/herself with a non retrievable dataset, which should fail", async () => {
    const newJob = {
      ...retrieveJob,
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
      .expect(TestData.ConflictStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("The following datasets are not in retrievable state for a retrieve job.");
      });
  });

  it("0315: Add a new public job as a normal user himself/herself with unknown files, which should fail", async () => {
    const newJob = {
      ...publicJob,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [ "fakeID" ] },
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
        res.body.should.have.property("message").and.be.equal("At least one requested file could not be found.");
      });
  });

  it("0316: Add a new public job as a normal user himself/herself choosing only specific files", async () => {
    const newJob = {
      ...publicJob,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [ "N1039-1.tif", "N1039-2.tif" ] },
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
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
      });
  });

  // it("0320: Add a new job as anonymous user in '#datasetPublic' configuration with all published datasets", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.not.have.property("ownerGroup");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0330: Add a new job as anonymous user in '#datasetPublic' configuration with one unpublished dataset, which should fail as forbidden", async () => {
  //   const newJob = {
  //     ...jobDatasetPublic,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .expect(TestData.AccessForbiddenStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
  //     });
  // });

  // it("0340: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#authenticated' configuration", async () => {
  //   const newJob = {
  //     ...jobAuthenticated,
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("admin");
  //       res.body.should.have.property("ownerUser").and.be.equal("admin");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0350: Add a new job as a user from ADMIN_GROUPS for another user in '#authenticated' configuration", async () => {
  //   const newJob = {
  //     ...jobAuthenticated,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });
  // it("0360: Add a new job as a user from ADMIN_GROUPS for another group in '#authenticated' configuration", async () => {
  //   const newJob = {
  //     ...jobAuthenticated,
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0370: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#authenticated' configuration", async () => {
  //   const newJob = {
  //     ...jobAuthenticated,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.not.have.property("ownerGroup");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0380: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#authenticated' configuration", async () => {
  //   const newJob = {
  //     ...jobAuthenticated,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0390: Add a new job as a normal user for himself/herself in '#authenticated' configuration", async () => {
  //   const newJob = {
  //     ...jobAuthenticated,
  //     ownerUser: "user5.1",
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group5");
  //       res.body.should.have.property("ownerUser").and.be.equal("user5.1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0400: Add a new job as unauthenticated user in '#authenticated' configuration, which should fail as forbidden", async () => {
  //   const newJob = {
  //     ...jobAuthenticated,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .expect(TestData.AccessForbiddenStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
  //     });
  // });

  // it("0410: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetAccess' configuration", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerUser: "admin",
  //     ownerGroup: "admin",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("admin");
  //       res.body.should.have.property("ownerUser").and.be.equal("admin");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       datasetOwnerJob1 = res.body["id"];
  //       encodedDatasetOwnerJobOwnedByAdmin = encodeURIComponent(datasetOwnerJob1);
  //     });
  // });

  // it("0420: Add a new job as a user from ADMIN_GROUPS for another user in '#datasetAccess' configuration", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       datasetOwnerJob2 = res.body["id"];
  //       encodedDatasetOwnerJobOwnedByUser1 = encodeURIComponent(datasetOwnerJob2);
  //     });
  // });

  // it("0430: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetAccess' configuration", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       datasetOwnerJob3 = res.body["id"];
  //       encodedDatasetOwnerJobOwnedByGroup1 = encodeURIComponent(datasetOwnerJob3);
  //     });
  // });

  // it("0435: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetAccess' configuration", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group5");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       datasetOwnerJob5 = res.body["id"];
  //       encodedDatasetOwnerJobOwnedByGroup5 = encodeURIComponent(datasetOwnerJob5);
  //     });
  // });

  // it("0440: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#datasetAccess' configuration", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.not.have.property("ownerGroup");
  //       res.body.should.not.have.property("ownerUser");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       datasetOwnerJob6 = res.body["id"];
  //       encodedDatasetOwnerJobOwnedByAnonym = encodeURIComponent(datasetOwnerJob6);
  //     });
  // });

  // it("0450: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetAccess' configuration with access to datasets", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0460: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetAccess' configuration with no access to datasets", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerUser: "user1",
  //     ownerGroup: "group1",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group1");
  //       res.body.should.have.property("ownerUser").and.be.equal("user1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //     });
  // });

  // it("0470: Adds a new job as user1 for user5.1 ownerUser and group5 ownerGroup for #datasetAccess, which should fail", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerUser: "user5.1",
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };
  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //     .expect(TestData.BadRequestStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
  //     });
  // });

  // it("0480: Add a new job as a normal user for himself/herself in '#datasetAccess' configuration with access to datasets", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerUser: "user5.1",
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.EntryCreatedStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("type").and.be.string;
  //       res.body.should.have.property("ownerGroup").and.be.equal("group5");
  //       res.body.should.have.property("ownerUser").and.be.equal("user5.1");
  //       res.body.should.have.property("statusCode").to.be.equal("jobCreated");
  //       datasetOwnerJob4 = res.body["id"];
  //       encodedDatasetOwnerJobOwnedByUser51 = encodeURIComponent(datasetOwnerJob4);
  //     });
  // });

  // it("0490: Add a new job as a normal user for himself/herself in '#datasetAccess' configuration with no access to datasets, which should fail as forbidden", async () => {
  //   const newJob = {
  //     ...jobDatasetAccess,
  //     ownerUser: "user5.1",
  //     ownerGroup: "group5",
  //     jobParams: {
  //       datasetList: [
  //         { pid: datasetPid1, files: [] },
  //         { pid: datasetPid2, files: [] },
  //         { pid: datasetPid3, files: [] },
  //       ],
  //     },
  //   };

  //   return request(appUrl)
  //     .post("/api/v3/Jobs")
  //     .send(newJob)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //     .expect(TestData.AccessForbiddenStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.not.have.property("id");
  //       res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
  //     });
  // });

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
        datasetAccessJob1 = res.body["id"];
        encodedDatasetAccessJobOwnedByAdmin = encodeURIComponent(datasetAccessJob1);
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
        datasetAccessJob2 = res.body["id"];
        encodedDatasetAccessJobOwnedByUser1 = encodeURIComponent(datasetAccessJob2);
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
        datasetAccessJob3 = res.body["id"];
        encodedDatasetAccessJobOwnedByGroup1 = encodeURIComponent(datasetAccessJob3);
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
        datasetAccessJob5 = res.body["id"];
        encodedDatasetAccessJobOwnedByGroup5 = encodeURIComponent(datasetAccessJob5);
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
        datasetAccessJob6 = res.body["id"];
        encodedDatasetAccessJobOwnedByAnonym = encodeURIComponent(datasetAccessJob6);
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
        datasetAccessJob4 = res.body["id"];
        encodedDatasetAccessJobOwnedByUser51 = encodeURIComponent(datasetAccessJob4);
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

  it("0590: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#USER5.1' configuration", async () => {
    const newJob = {
      ...jobUser51,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        userSpecJob1 = res.body["id"];
        encodedUserSpecJobOwnedByAdmin = encodeURIComponent(userSpecJob1);
      });
  });

  it("0600: Add a new job as a user from ADMIN_GROUPS for another user in '#USER5.1' configuration", async () => {
    const newJob = {
      ...jobUser51,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        userSpecJob2 = res.body["id"];
        encodedUserSpecJobOwnedByUser1 = encodeURIComponent(userSpecJob2);
      });
  });

  it("0610: Add a new job as a user from ADMIN_GROUPS for another group in '#USER5.1' configuration", async () => {
    const newJob = {
      ...jobUser51,
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        userSpecJob3 = res.body["id"];
        encodedUserSpecJobOwnedByGroup1 = encodeURIComponent(userSpecJob3);
      });
  });

  it("0615: Add a new job as a user from ADMIN_GROUPS for another group in '#USER5.1' configuration", async () => {
    const newJob = {
      ...jobUser51,
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        userSpecJob5 = res.body["id"];
        encodedUserSpecJobOwnedByGroup5 = encodeURIComponent(userSpecJob5);
      });
  });

  it("0616: Add a new job as a user from ADMIN_GROUPS for another user in '#USER5.1' configuration", async () => {
    const newJob = {
      ...jobUser51,
      ownerUser: "user5.2",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        res.body.should.have.property("ownerUser").and.be.equal("user5.2");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        userSpecJob7 = res.body["id"];
        encodedUserSpecJobOwnedByUser52 = encodeURIComponent(userSpecJob7);
      });
  });


  it("0620: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#USER5.1' configuration", async () => {
    const newJob = {
      ...jobUser51,
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        userSpecJob6 = res.body["id"];
        encodedUserSpecJobOwnedByAnonym = encodeURIComponent(userSpecJob6);
      });
  });

  it("0630: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself user in '#USER5.1' configuration", async () => {
    const newJob = {
      ...jobUser51,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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

  it("0640: Add a new job as a user from CREATE_JOB_GROUPS for user5.1 in '#USER5.1' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobUser51,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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

  it("0650: Adds a new job as user5.1 himself/herself in '#USER5.1' configuration", async () => {
    const newJob = {
      ...jobUser51,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
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
        userSpecJob4 = res.body["id"];
        encodedUserSpecJobOwnedByUser51 = encodeURIComponent(userSpecJob4);
      });
  });

  it("0660: Adds a new job as user5.1 for no ownerUser and group5 ownerGroup in #USER5.1 configuration", async () => {
    const newJob = {
      ...jobUser51,
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
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
      });
  });

  it("0670: Adds a new job as user5.2 for himself/herself in #USER5.1, which should fail as forbidden", async () => {
    const newJob = {
      ...jobUser51,
      ownerUser: "user5.2",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser52}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
      });
  });

  it("0680: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerUser: "admin",
      ownerGroup: "admin",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        groupSpecJob1 = res.body["id"];
        encodedGroupSpecJobOwnedByAdmin = encodeURIComponent(groupSpecJob1);
      });
  });

  it("0690: Add a new job as a user from ADMIN_GROUPS for another user in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        groupSpecJob2 = res.body["id"];
        encodedGroupSpecJobOwnedByUser1 = encodeURIComponent(groupSpecJob2);
      });
  });

  it("0700: Add a new job as a user from ADMIN_GROUPS for another group in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        groupSpecJob3 = res.body["id"];
        encodedGroupSpecJobOwnedByGroup1 = encodeURIComponent(groupSpecJob3);
      });
  });

  it("0705: Add a new job as a user from ADMIN_GROUPS for another group in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        groupSpecJob5 = res.body["id"];
        encodedGroupSpecJobOwnedByGroup5 = encodeURIComponent(groupSpecJob5);
      });
  });

  it("0706: Add a new job as a user from ADMIN_GROUPS for another user in '@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerUser: "user3",
      ownerGroup: "group3",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        res.body.should.have.property("ownerGroup").and.be.equal("group3");
        res.body.should.have.property("ownerUser").and.be.equal("user3");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        groupSpecJob8 = res.body["id"];
        encodedGroupSpecJobOwnedByUser3 = encodeURIComponent(groupSpecJob8);
      });
  });

  it("0710: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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
        groupSpecJob6 = res.body["id"];
        encodedGroupSpecJobOwnedByAnonym = encodeURIComponent(groupSpecJob6);
      });
  });

  it("0720: Add a new job as a user from CREATE_JOB_GROUPS for another group in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerUser: "user1",
      ownerGroup: "group1",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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

  it("0730: Add a new job as a user from CREATE_JOB_GROUPS for user 5.1 in '#@group5' configuration, which should fail as bad request", async () => {
    const newJob = {
      ...jobGroup5,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
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

  it("0740: Add a new job as a user 5.1 for himself/herself in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerUser: "user5.1",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
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
        groupSpecJob4 = res.body["id"];
        encodedGroupSpecJobOwnedByUser51 = encodeURIComponent(groupSpecJob4);
      });
  });

  it("0750: Add a new job as a user 5.1 for another user in his/her group in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
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
      });
  });

  it("0760: Add a new job as a user 5.2 for himself/herself in '#@group5' configuration", async () => {
    const newJob = {
      ...jobGroup5,
      ownerUser: "user5.2",
      ownerGroup: "group5",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser52}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("type").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.equal("group5");
        res.body.should.have.property("ownerUser").and.be.equal("user5.2");
        res.body.should.have.property("statusCode").to.be.equal("jobCreated");
        groupSpecJob7 = res.body["id"];
        encodedGroupSpecJobOwnedByUser52 = encodeURIComponent(groupSpecJob7);
      });
  });

  it("0770: Adds a new job as user3 for himself/herself in #@group5 configuration, which should fail as forbidden", async () => {
    const newJob = {
      ...jobGroup5,
      ownerUser: "user3",
      ownerGroup: "group3",
      jobParams: {
        datasetList: [
          { pid: datasetPid1, files: [] },
          { pid: datasetPid2, files: [] },
        ],
      },
    };

    return request(appUrl)
      .post("/api/v3/Jobs")
      .send(newJob)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(TestData.AccessForbiddenStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.not.have.property("id");
        res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
      });
  });

  // it("0780: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAdmin}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0790: Adds a Status update to a job as a user from ADMIN_GROUPS for another user's job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser1}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0800: Adds a Status update to a job as a user from ADMIN_GROUPS for another group's job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup1}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0810: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAnonym}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0820: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser1}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0830: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser51}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0840: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her group in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup1}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0850: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup5}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0860: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonymous user's group in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAnonym}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser1}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0870: Adds a Status update to a job as a normal user  for his/her job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser51}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0880: Adds a Status update to a job as a normal user for another user's job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser1}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0890: Adds a Status update to a job as a normal user for his/her group in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup5}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0900: Adds a Status update to a job as a normal user for another user's group in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup1}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0910: Adds a Status update to a job as a normal user for anonymous user's group in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAnonym}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0920: Adds a Status update to a job as unauthhenticated user for anonymous job in '#all' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAnonym}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0930: Adds a Status update to a job as unauthhenticated user for anouther group's job in '#all' configuration, which should fail as forbidden", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup1}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .expect(TestData.AccessForbiddenStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("0940: Adds a Status update to a job as unauthhenticated user for another user's job in '#all' configuration, which should fail as forbidden", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser1}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .expect(TestData.AccessForbiddenStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  it("0950: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#jobOwnerUser' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAdmin}`)
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
      .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser1}`)
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
      .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByGroup1}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAnonym}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser1}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser51}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByGroup1}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByGroup5}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAnonym}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser51}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser1}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByGroup5}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByGroup1}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAnonym}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAnonym}`)
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
        .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAdmin}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1110: Adds a Status update to a job as a user from ADMIN_GROUPS for another group's job in '#jobOwnerGroup' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1120: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#jobOwnerGroup' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  // it("1130: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#jobOwnerGroup' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAnonym}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenAdmin}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  //   });


    it("1140: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her job in '#jobOwnerGroup' configuration", async () => {
      return request(appUrl)
          .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByUser1}`)
          .send({
            statusMessage: "update status of a job",
            statusCode: "job finished/blocked/etc",
          })
          .set("Accept", "application/json")
          .set({ Authorization: `Bearer ${accessTokenUser1}` })
          .expect(TestData.SuccessfulPatchStatusCode)
          .expect("Content-Type", /json/);
    });
    // it("1150: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
    //   return request(appUrl)
    //       .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByUser51}`)
    //       .send({
    //         statusMessage: "update status of a job",
    //         statusCode: "job finished/blocked/etc",
    //       })
    //       .set("Accept", "application/json")
    //       .set({ Authorization: `Bearer ${accessTokenUser1}` })
    //       .expect(TestData.AccessForbiddenStatusCode)
    //       .expect("Content-Type", /json/);
    // });
    it("1160: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her group in '#jobOwnerGroup' configuration", async () => {
      return request(appUrl)
          .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByGroup1}`)
          .send({
            statusMessage: "update status of a job",
            statusCode: "job finished/blocked/etc",
          })
          .set("Accept", "application/json")
          .set({ Authorization: `Bearer ${accessTokenUser1}` })
          .expect(TestData.SuccessfulPatchStatusCode)
          .expect("Content-Type", /json/);
    });
    // it("1170: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
    //   return request(appUrl)
    //       .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByGroup5}`)
    //       .send({
    //         statusMessage: "update status of a job",
    //         statusCode: "job finished/blocked/etc",
    //       })
    //       .set("Accept", "application/json")
    //       .set({ Authorization: `Bearer ${accessTokenUser1}` })
    //       .expect(TestData.AccessForbiddenStatusCode)
    //       .expect("Content-Type", /json/);
    // });

    // it("1180: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonymous user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
    //   return request(appUrl)
    //       .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAnonym}`)
    //       .send({
    //         statusMessage: "update status of a job",
    //         statusCode: "job finished/blocked/etc",
    //       })
    //       .set("Accept", "application/json")
    //       .set({ Authorization: `Bearer ${accessTokenUser1}` })
    //       .expect(TestData.AccessForbiddenStatusCode)
    //       .expect("Content-Type", /json/);
    // });

  // it("1190: Adds a Status update to a job as a normal user  for his/her job in '#jobOwnerGroup' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByUser51}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  it("1200: Adds a Status update to a job as a normal user for another user's job in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByUser1}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  // it("1210: Adds a Status update to a job as a normal user for his/her group in '#jobOwnerGroup' configuration", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByGroup5}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //       .expect(TestData.SuccessfulPatchStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  it("1220: Adds a Status update to a job as a normal user for another user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByGroup1}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  // it("1230: Adds a Status update to a job as a normal user for anonymous user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAnonym}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessTokenUser51}` })
  //       .expect(TestData.AccessForbiddenStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  // it("1240: Adds a Status update to a job as unauthhenticated user for anonymous user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
  //   return request(appUrl)
  //       .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAnonym}`)
  //       .send({
  //         statusMessage: "update status of a job",
  //         statusCode: "job finished/blocked/etc",
  //       })
  //       .set("Accept", "application/json")
  //       .expect(TestData.AccessForbiddenStatusCode)
  //       .expect("Content-Type", /json/);
  // });

  it("1250: Adds a Status update to a job as a user from ADMIN_GROUPS for his/her job in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByAdmin}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1260: Adds a Status update to a job as a user from ADMIN_GROUPS for another group's job in 'USER5.1' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1270: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in 'USER5.1' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1280: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByAnonym}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1290: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her job in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser1}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1300: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in 'USER5.1' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1310: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her group in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByGroup1}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1320: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in 'USER5.1' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByGroup5}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1330: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonymous user's group in 'USER5.1' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByAnonym}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1340: Adds a Status update to a job as user5.1 for his/her job in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1350: Adds a Status update to a job as user5.1 for another user's job in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser1}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1360: Adds a Status update to a job as user5.1 for his/her group in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByGroup5}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1370: Adds a Status update to a job as user5.1 for another user's group in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1380: Adds a Status update to a job as user5.1 for anonymous user's group in 'USER5.1' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByAnonym}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1390: Adds a Status update to a job as user5.2 for his/her job in 'USER5.1' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser52}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser52}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1400: Adds a Status update to a job as user5.2 for user's 5.1 in same group job in 'USER5.1' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser52}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1410: Adds a Status update to a job as user5.2 for another user in his/her group job in 'USER5.1' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedUserSpecJobOwnedByGroup5}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser52}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1420: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByAdmin}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1430: Adds a Status update to a job as a user from ADMIN_GROUPS for another group's job in '@group5' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1440: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '@group5' configuration", async () => {
  return request(appUrl)
      .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByGroup1}`)
      .send({
        statusMessage: "update status of a job",
        statusCode: "job finished/blocked/etc",
      })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulPatchStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1450: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByAnonym}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1460: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her job in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser1}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1470: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in '@group5' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1480: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her group in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByGroup1}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1490: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in '@group5' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByGroup5}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1500: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonymous user's group in '@group5' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByAnonym}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1510: Adds a Status update to a job as user5.1 for his/her job in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1520: Adds a Status update to a job as user5.1 for another user's job in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser1}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1530: Adds a Status update to a job as user5.1 for his/her group in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByGroup5}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1540: Adds a Status update to a job as user5.1 for another user's group in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1550: Adds a Status update to a job as user5.1 for anonymous user's group in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByAnonym}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1560: Adds a Status update to a job as user5.2 for his/her job in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser52}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser52}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });


  it("1570: Adds a Status update to a job as user5.2 for user's 5.1 in same group job in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser52}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1580: Adds a Status update to a job as user5.2 for another user in his/her group job in '@group5' configuration", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByGroup5}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser52}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1590: Adds a Status update to a job as user3 for his/her job in '@group5' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser3}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser3}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
  });

  it("1600: Adds a Status update to a job as user3 for user's 5.1 job in '@group5' configuration, which should fail as forbidden", async () => {
    return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedGroupSpecJobOwnedByUser51}`)
        .send({
          statusMessage: "update status of a job",
          statusCode: "job finished/blocked/etc",
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser3}` })
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
          res.body.should.be.an("array").to.have.lengthOf(64);
        });
  });

  it("1630: Access jobs as a user from ADMIN_GROUPS that were created by admin", async () => {
    const query = { where:{ createdBy: "admin" }};
    return request(appUrl)
        .get(`/api/v3/Jobs/`)
        .send({})
        .query("filter=" + encodeURIComponent(JSON.stringify(query)))
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array").to.have.lengthOf(37);
        });
  });

  it("1640: Access jobs as a user from ADMIN_GROUPS that were created by User1", async () => {
    const query = { where:{ createdBy: "user1" }};
    return request(appUrl)
        .get(`/api/v3/Jobs/`)
        .send({})
        .query("filter=" + encodeURIComponent(JSON.stringify(query)))
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array").to.have.lengthOf(11);
        });
  });

  it("1650: Access jobs as a user from ADMIN_GROUPS that were created by User5.1", async () => {
    const query = { where:{ createdBy: "user5.1" }};
    return request(appUrl)
        .get(`/api/v3/Jobs/`)
        .send({})
        .query("filter=" + encodeURIComponent(JSON.stringify(query)))
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array").to.have.lengthOf(13);
        });
  });

  it("1660: Access jobs as a user from ADMIN_GROUPS that were created by User5.2", async () => {
    const query = { where:{ createdBy: "user5.2" }};
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

  it("1670: Access jobs as a user from ADMIN_GROUPS that were created by anonymous user", async () => {
    const query = { where:{ createdBy: "anonymous" }};
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

  it("1680: Access jobs as a user from CREATE_JOB_GROUPS ", async () => {
    return request(appUrl)
        .get(`/api/v3/Jobs/`)
        .send({})
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array").to.have.lengthOf(25);
        });
  });

  it("1690: Access jobs as a user from CREATE_JOB_GROUPS that were created by admin", async () => {
    const query = { where:{ createdBy: "admin" }};
    return request(appUrl)
        .get(`/api/v3/Jobs/`)
        .send({})
        .query("filter=" + encodeURIComponent(JSON.stringify(query)))
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array").to.have.lengthOf(14);
        });
  });

  it("1700: Access jobs as a user from CREATE_JOB_GROUPS that were created by User1", async () => {
    const query = { where:{ createdBy: "user1" }};
    return request(appUrl)
        .get(`/api/v3/Jobs/`)
        .send({})
        .query("filter=" + encodeURIComponent(JSON.stringify(query)))
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser1}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.an("array").to.have.lengthOf(11);
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
          res.body.should.be.an("array").to.have.lengthOf(13);
        });
  });

  it("1720: Access jobs as a normal user (user5.1) that were created by admin", async () => {
    const query = { where:{ createdBy: "admin" }};
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
          res.body.should.be.an("array").to.have.lengthOf(2);
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAdmin}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser1}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByGroup1}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAnonym}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAdmin}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser1}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByGroup1}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser51}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAnonym}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAdmin}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser1}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByUser51}`)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("ownerUser").and.be.equal('user5.1');
          res.body.should.have.property("ownerGroup").and.be.equal("group5");
        });
  });

  it("1870: Get job od another user in his/her group as normal user, which should be forbidden", async () => {
    return request(appUrl)
        .get(`/api/v3/Jobs/${encodedUserSpecJobOwnedByUser52}`)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("ownerUser");
        });
  });

  it("1880: Get job from his/her own group as normal user, which should be forbidden", async () => {
    return request(appUrl)
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByGroup5}`)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenUser51}` })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("ownerUser");
        });
  });

  it("1890: Get anonymous user's job as normal user, which should be forbidden", async () => {
    return request(appUrl)
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAnonym}`)
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
        .get(`/api/v3/Jobs/${encodedDatasetAccessJobOwnedByAnonym}`)
        .set("Accept", "application/json")
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("ownerUser");
        });
  });

  it("1910: Delete job created by admin as Archive Manager", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + encodedDatasetAccessJobOwnedByAdmin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1920: Delete job created by admin as Admin", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + encodedDatasetAccessJobOwnedByUser1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1930: Delete job created by admin as CREATE_JOB_GROUPS user, which should fail", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + encodedDatasetAccessJobOwnedByGroup1)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.DeleteForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("1940: Delete job created by admin as normal user, which should fail", async () => {
    return request(appUrl)
      .delete("/api/v3/jobs/" + encodedDatasetAccessJobOwnedByGroup1)
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
        res.body.should.be.an("array").to.have.lengthOf(62);
      });
  });

  it("1970: Fullquery jobs as a user from ADMIN_GROUPS, limited by 5", async () => {
    const query = { limit: 5 };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .set("Accept", "application/json")
      .query("limits=" + encodeURIComponent(JSON.stringify(query)))
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(5);
      });
  });

  it("1980: Fullquery jobs as a user from ADMIN_GROUPS that were created by admin", async () => {
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
        res.body.should.be.an("array").to.have.lengthOf(35);
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
        res.body.should.be.an("array").to.have.lengthOf(11);
      });
  });

  it("2000: Fullquery jobs as a user from ADMIN_GROUPS that were created by User5.1, limited by 5", async () => {
    const queryFields = { createdBy: "user5.1" };
    const queryLimits = { limit: 5 };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(queryFields)))
      .query("limits=" + encodeURIComponent(JSON.stringify(queryLimits)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(5);
      });
  });

  it("2010: Fullquery jobs as a user from ADMIN_GROUPS that were created by User5.2", async () => {
    const query = { createdBy: "user5.2" };
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
        res.body.should.be.an("array").to.have.lengthOf(2);
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
        res.body.should.be.an("array").to.have.lengthOf(13);
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
        res.body.should.be.an("array").to.have.lengthOf(11);
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
        res.body.should.be.an("array").to.have.lengthOf(13);
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

  it("2080: Fullquery jobs as another normal user (user5.2)", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/fullquery`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser52}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(2);
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
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 35 }] });
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
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 11 }] });
      });
  });

  it("2130: Fullfacet jobs as a user from ADMIN_GROUPS that were created by User5.1", async () => {
    const queryFields = { createdBy: "user5.1" };
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .query("fields=" + encodeURIComponent(JSON.stringify(queryFields)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 13 }] });
      });
  });

  it("2140: Fullfacet jobs as a user from ADMIN_GROUPS that were created by User5.2", async () => {
    const query = { createdBy: "user5.2" };
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
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 2 }] });
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
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 13 }] });
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
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 11 }] });
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
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 13 }] });
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

  it("2200: Fullfacet jobs as another normal user (user5.2)", async () => {
    return request(appUrl)
      .get(`/api/v3/Jobs/fullfacet`)
      .send({})
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser52}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").that.deep.contains({ all: [{ totalSets: 2 }] });
      });
  });

  describe("3120: Validate Job Action", () => {

    it("0010: create validate job fails without required parameters", async () => {
      const newJob = {
        ...jobValidate,
        jobParams: {
          optionalParam: false,
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
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Requires 'jobParams.requiredParam'");
        });
    });

    it("0020: create validate job fails with the wrong types", async () => {
      const newJob = {
        type: "validate",
        jobParams: {
          requiredParam: 123,
          arrayOfStrings: ["ok"]
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
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for 'jobParams.requiredParam'");
        });
    });
    it("0030: create validate job fails with the wrong types", async () => {
      const newJob = {
        type: "validate",
        jobParams: {
          requiredParam: "ok",
          arrayOfStrings: "bad"
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
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for 'jobParams.arrayOfStrings'");
        });
    });
    it("0040: create validate job fails with the wrong types", async () => {
      const newJob = {
        type: "validate",
        jobParams: {
          requiredParam: "ok",
          arrayOfStrings: [123]
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
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for 'jobParams.arrayOfStrings'");
        });
    });

    it("0050: create validate succeeds with the right types", async () => {
      const newJob = {
        type: "validate",
        jobParams: {
          requiredParam: "ok",
          arrayOfStrings: ["ok"]
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
          res.body.should.have.property("type").and.equal("validate");
          res.body.should.have.property("createdBy").and.equal("admin");
          res.body.should.have.property("jobParams").that.deep.equals(newJob.jobParams);

          jobIdValidate1 = res.body["id"];
          encodedJobIdValidate1 = encodeURIComponent(jobIdValidate1);
        });
    });

    it("0060: update validate fails without the required parameters", async () => {
      const update = {
        statusCode: "finished",
        statusMessage: "done",
        jobResultObject: {
          requiredParam: "ok",
          arrayOfStringsMissing: ["fail"]
        }
      };

      return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedJobIdValidate1}`)
        .send(update)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for '$'");
        });

    });

    it("0070: update validate fails with incorrect types", async () => {
      const update = {
        statusCode: "finished",
        statusMessage: "done",
        jobResultObject: {
          requiredParam: "ok",
          arrayOfStringsMissing: [123]
        }
      };

      return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedJobIdValidate1}`)
        .send(update)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.not.have.property("type")
          res.body.should.have.property("message").and.be.equal("Invalid request. Invalid value for '$'");
        });

    });


    it("0080: updating validate succeeds with the required parameters", async () => {
      const update = {
        statusCode: "finished",
        statusMessage: "done",
        jobResultObject: {
          requiredParam: "ok",
          arrayOfStrings: ["ok"]
        }
      };

      return request(appUrl)
        .patch(`/api/v3/Jobs/${encodedJobIdValidate1}`)
        .send(update)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdmin}` })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("type").and.equal("validate");
          res.body.should.have.property("createdBy").and.equal("admin");
          res.body.should.have.property("jobParams").that.deep.equals(update.jobResultObject);
          res.body.should.have.property("jobResultObject").that.deep.equals(update.jobResultObject);
        });
    });
  });
});
