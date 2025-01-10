
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



describe.skip("1100: Jobs: Test New Job Model Authorization for #all jobs", () => {
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
})
