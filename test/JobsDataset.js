
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



describe.only("1100: Jobs: Test New Job Model Authorization for #all jobs", () => {
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
    describe("1130: #dataset_public configuration", () => {
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
        it("0230: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with all published datasets", async () => {
            const newJob = {
                ...jobDatasetPublic,
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
                });
        });

        it("0240: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with one unpublished dataset", async () => {
            const newJob = {
                ...jobDatasetPublic,
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
                });
        });

        it("0250: Add a new job as a user from ADMIN_GROUPS for another user in '#datasetPublic' configuration with one unpublished dataset", async () => {
            const newJob = {
                ...jobDatasetPublic,
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
                });
        });

        it("0260: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetPublic' configuration with one unpublished dataset", async () => {
            const newJob = {
                ...jobDatasetPublic,
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
                });
        });

        it("0270: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#datasetPublic' configuration with one unpublished dataset", async () => {
            const newJob = {
                ...jobDatasetPublic,
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
                });
        });

        it("0280: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetPublic' configuration with all published datasets", async () => {
            const newJob = {
                ...jobDatasetPublic,
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

        it("0290: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetPublic' configuration with one unpublished dataset", async () => {
            const newJob = {
                ...jobDatasetPublic,
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

        it("0300: Add a new job as a normal user himself/herself in '#datasetPublic' configuration with a published dataset", async () => {
            const newJob = {
                ...jobDatasetPublic,
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

        it("0310: Add a new job as a normal user himself/herself in '#datasetPublic' configuration with unpublished datasets, which should fail as forbidden", async () => {
            const newJob = {
                ...jobDatasetPublic,
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
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
                });
        });

        it("0320: Add a new job as anonymous user in '#datasetPublic' configuration with all published datasets", async () => {
            const newJob = {
                ...jobDatasetPublic,
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

        it("0330: Add a new job as anonymous user in '#datasetPublic' configuration with one unpublished dataset, which should fail as forbidden", async () => {
            const newJob = {
                ...jobDatasetPublic,
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
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
                });
        });


    });
    describe("1140: #dataset_access configuration", () => {

        it("0410: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetAccess' configuration", async () => {
            const newJob = {
                ...jobDatasetAccess,
                ownerUser: "admin",
                ownerGroup: "admin",
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
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.EntryCreatedStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.have.property("type").and.be.string;
                    res.body.should.have.property("ownerGroup").and.be.equal("admin");
                    res.body.should.have.property("ownerUser").and.be.equal("admin");
                    res.body.should.have.property("statusCode").to.be.equal("jobCreated");
                    datasetOwnerJob1 = res.body["id"];
                    encodedDatasetOwnerJobOwnedByAdmin = encodeURIComponent(datasetOwnerJob1);
                });
        });

        it("0420: Add a new job as a user from ADMIN_GROUPS for another user in '#datasetAccess' configuration", async () => {
            const newJob = {
                ...jobDatasetAccess,
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
                    datasetOwnerJob2 = res.body["id"];
                    encodedDatasetOwnerJobOwnedByUser1 = encodeURIComponent(datasetOwnerJob2);
                });
        });

        it("0430: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetAccess' configuration", async () => {
            const newJob = {
                ...jobDatasetAccess,
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
                    datasetOwnerJob3 = res.body["id"];
                    encodedDatasetOwnerJobOwnedByGroup1 = encodeURIComponent(datasetOwnerJob3);
                });
        });

        it("0435: Add a new job as a user from ADMIN_GROUPS for another group in '#datasetAccess' configuration", async () => {
            const newJob = {
                ...jobDatasetAccess,
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
                    datasetOwnerJob5 = res.body["id"];
                    encodedDatasetOwnerJobOwnedByGroup5 = encodeURIComponent(datasetOwnerJob5);
                });
        });

        it("0440: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#datasetAccess' configuration", async () => {
            const newJob = {
                ...jobDatasetAccess,
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
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.EntryCreatedStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.have.property("type").and.be.string;
                    res.body.should.not.have.property("ownerGroup");
                    res.body.should.not.have.property("ownerUser");
                    res.body.should.have.property("statusCode").to.be.equal("jobCreated");
                    datasetOwnerJob6 = res.body["id"];
                    encodedDatasetOwnerJobOwnedByAnonym = encodeURIComponent(datasetOwnerJob6);
                });
        });

        it("0450: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetAccess' configuration with access to datasets", async () => {
            const newJob = {
                ...jobDatasetAccess,
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

        it("0460: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#datasetAccess' configuration with no access to datasets", async () => {
            const newJob = {
                ...jobDatasetAccess,
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

        it("0470: Adds a new job as user1 for user5.1 ownerUser and group5 ownerGroup for #datasetAccess, which should fail", async () => {
            const newJob = {
                ...jobDatasetAccess,
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
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.BadRequestStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
                });
        });

        it("0480: Add a new job as a normal user for himself/herself in '#datasetAccess' configuration with access to datasets", async () => {
            const newJob = {
                ...jobDatasetAccess,
                ownerUser: "user5.1",
                ownerGroup: "group5",
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
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.EntryCreatedStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.have.property("type").and.be.string;
                    res.body.should.have.property("ownerGroup").and.be.equal("group5");
                    res.body.should.have.property("ownerUser").and.be.equal("user5.1");
                    res.body.should.have.property("statusCode").to.be.equal("jobCreated");
                    datasetOwnerJob4 = res.body["id"];
                    encodedDatasetOwnerJobOwnedByUser51 = encodeURIComponent(datasetOwnerJob4);
                });
        });

        it("0490: Add a new job as a normal user for himself/herself in '#datasetAccess' configuration with no access to datasets, which should fail as forbidden", async () => {
            const newJob = {
                ...jobDatasetAccess,
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
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Unauthorized to create this job.");
                });
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
        it("1130: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#jobOwnerGroup' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAnonym}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

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
        it("1150: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByUser51}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/);
        });
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
        it("1170: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByGroup5}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/);
        });
        it("1180: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonymous user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAnonym}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/);
        });
        it("1190: Adds a Status update to a job as a normal user  for his/her job in '#jobOwnerGroup' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByUser51}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });
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
        it("1210: Adds a Status update to a job as a normal user for his/her group in '#jobOwnerGroup' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByGroup5}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

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
        it("1230: Adds a Status update to a job as a normal user for anonymous user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAnonym}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/);
        });

        it("1240: Adds a Status update to a job as unauthhenticated user for anonymous user's group in '#jobOwnerGroup' configuration, which should fail as forbidden", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedDatasetOwnerJobOwnedByAnonym}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/);
        });
    });
    describe("1150: #dataset_owner configuration", () => {

    });
})
