// for #all and #authorized
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
    describe("1110:  #all configuration", () => {
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

        it("0040: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with no datasets in job parameters, which should fail", async () => {
            const newJob = {
                ...jobAll,
                ownerUser: "admin",
                ownerGroup: "admin",
                jobParams: {
                    datasetList: [],
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
                    res.body.should.not.have.property("id")
                    res.body.should.have.property("message").and.be.equal("List of passed datasets is empty.");
                });
        });

        it("0050: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration with not existing dataset IDs, which should fail", async () => {
            const newJob = {
                ...jobAll,
                ownerUser: "admin",
                ownerGroup: "admin",
                jobParams: {
                    datasetList: [
                        { pid: "fakeID", files: [] },
                        { pid: "fakeID2", files: [] },
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
                    res.body.should.not.have.property("id")
                    res.body.should.have.property("message").and.be.equal("Datasets with pid fakeID,fakeID2 do not exist.");
                });
        });

        it("0060: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with no jobParams parameter, which should fail", async () => {
            const newJob = {
                type: "all_access",
                ownerUser: "admin",
                ownerGroup: "admin",
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
                });
        });

        it("0065: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#datasetPublic' configuration with empty jobParams parameter", async () => {
            const newJob = {
                type: "all_access",
                ownerUser: "admin",
                ownerGroup: "admin",
                jobParams: {},
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

        it("0070: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
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
                    allJob1 = res.body["id"];
                    encodedAllJobOwnedByAdmin = encodeURIComponent(allJob1);
                });
        });

        it("0080: Add a new job as a user from ADMIN_GROUPS for another user in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
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
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.EntryCreatedStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.have.property("type").and.be.string;
                    res.body.should.have.property("ownerGroup").and.be.equal("group1");
                    res.body.should.have.property("ownerUser").and.be.equal("user1");
                    res.body.should.have.property("statusCode").to.be.equal("jobCreated");
                    allJob2 = res.body["id"];
                    encodedAllJobOwnedByUser1 = encodeURIComponent(allJob2);
                });
        });

        it("0090: Add a new job as a user from ADMIN_GROUPS for undefined user from another group user in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
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
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.EntryCreatedStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.have.property("type").and.be.string;
                    res.body.should.have.property("ownerGroup").and.be.equal("group1");
                    res.body.should.not.have.property("ownerUser");
                    res.body.should.have.property("statusCode").to.be.equal("jobCreated");
                    allJob3 = res.body["id"];
                    encodedAllJobOwnedByGroup1 = encodeURIComponent(allJob3);
                });
        });

        it("0100: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
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
                    res.body.should.not.have.property("ownerGroup");
                    res.body.should.not.have.property("ownerUser");
                    res.body.should.have.property("statusCode").to.be.equal("jobCreated");
                    allJob6 = res.body["id"];
                    encodedAllJobOwnedByAnonym = encodeURIComponent(allJob6);
                });
        });

        it("0110: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
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

        it("0120: Add a new job as a user from CREATE_JOB_GROUPS for his/her group in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
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

        it("0130: Add a new job as a user from CREATE_JOB_GROUPS for another user in '#all' configuration, which should fail as bad request", async () => {
            const newJob = {
                ...jobAll,
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
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.BadRequestStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
                });
        });

        it("0140: Add a new job as a user from CREATE_JOB_GROUPS for another group in '#all' configuration, which should fail as bad request", async () => {
            const newJob = {
                ...jobAll,
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
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.BadRequestStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Invalid new job. User needs to belong to job owner group.");
                });
        });

        it("0150: Add a new job as a user from CREATE_JOB_GROUPS for anonymous user in '#all' configuration, which should fail as bad request", async () => {
            const newJob = {
                ...jobAll,
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
                .expect(TestData.BadRequestStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Invalid new job. Owner group should be specified.");
                });
        });

        it("0160: Add a new job as a normal user for himself/herself in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
                ownerUser: "user5.1",
                ownerGroup: "group5",
                jobParams: {
                    datasetList: [
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
                    allJob4 = res.body["id"];
                    encodedAllJobOwnedByUser51 = encodeURIComponent(allJob4);
                });
        });

        it("0170: Add a new job as a normal user for his/her group in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
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
                    allJob5 = res.body["id"];
                    encodedAllJobOwnedByGroup5 = encodeURIComponent(allJob5);
                });
        });

        it("0180: Add a new job as a normal user for another user in '#all' configuration, which should fail as bad request", async () => {
            const newJob = {
                ...jobAll,
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
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.BadRequestStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Invalid new job. User owning the job should match user logged in.");
                });
        });

        it("0190: Add a new job as a normal user for another group in '#all' configuration, which should fail as bad request", async () => {
            const newJob = {
                ...jobAll,
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
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.BadRequestStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Invalid new job. User needs to belong to job owner group.");
                });
        });

        it("0200: Add a new job as a normal user for anonymous user in '#all' configuration, which should fail as bad request", async () => {
            const newJob = {
                ...jobAll,
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
                .expect(TestData.BadRequestStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Invalid new job. Owner group should be specified.");
                });
        });

        it("0210: Adds a new job as unauthenticated user in '#all' configuration", async () => {
            const newJob = {
                ...jobAll,
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

        it("0220: Adds a new job as unauthenticated user for another user in '#all' configuration, which should fail as bad request", async () => {
            const newJob = {
                ...jobAll,
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
                .expect(TestData.BadRequestStatusCode)
                .expect("Content-Type", /json/)
                .then((res) => {
                    res.body.should.not.have.property("id");
                    res.body.should.have.property("message").and.be.equal("Invalid new job. Unauthenticated user cannot initiate a job owned by another user.");
                });
        });

        it("0780: Adds a status update to a job as a user from ADMIN_GROUPS for his/her job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAdmin}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0790: Adds a Status update to a job as a user from ADMIN_GROUPS for another user's job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser1}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0800: Adds a Status update to a job as a user from ADMIN_GROUPS for another group's job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup1}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0810: Adds a Status update to a job as a user from ADMIN_GROUPS for anonymous user's job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAnonym}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenAdmin}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0820: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser1}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0830: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser51}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0840: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for his/her group in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup1}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0850: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for another user's group in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup5}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0860: Adds a Status update to a job as a user from UPDATE_JOB_GROUPS for anonymous user's group in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAnonym}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser1}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0870: Adds a Status update to a job as a normal user  for his/her job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser51}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0880: Adds a Status update to a job as a normal user for another user's job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser1}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0890: Adds a Status update to a job as a normal user for his/her group in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup5}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0900: Adds a Status update to a job as a normal user for another user's group in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup1}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0910: Adds a Status update to a job as a normal user for anonymous user's group in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAnonym}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .set({ Authorization: `Bearer ${accessTokenUser51}` })
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0920: Adds a Status update to a job as unauthhenticated user for anonymous job in '#all' configuration", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByAnonym}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .expect(TestData.SuccessfulPatchStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0930: Adds a Status update to a job as unauthhenticated user for anouther group's job in '#all' configuration, which should fail as forbidden", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByGroup1}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/);
        });

        it("0940: Adds a Status update to a job as unauthhenticated user for another user's job in '#all' configuration, which should fail as forbidden", async () => {
            return request(appUrl)
                .patch(`/api/v3/Jobs/${encodedAllJobOwnedByUser1}`)
                .send({
                    statusMessage: "update status of a job",
                    statusCode: "job finished/blocked/etc",
                })
                .set("Accept", "application/json")
                .expect(TestData.AccessForbiddenStatusCode)
                .expect("Content-Type", /json/);
        });
    });
    describe("1120: #authenticated configuration", () => {


        it("0340: Add a new job as a user from ADMIN_GROUPS for himself/herself in '#authenticated' configuration", async () => {
            const newJob = {
              ...jobAuthenticated,
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
        
          it("0350: Add a new job as a user from ADMIN_GROUPS for another user in '#authenticated' configuration", async () => {
            const newJob = {
              ...jobAuthenticated,
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
          it("0360: Add a new job as a user from ADMIN_GROUPS for another group in '#authenticated' configuration", async () => {
            const newJob = {
              ...jobAuthenticated,
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
        
          it("0370: Add a new job as a user from ADMIN_GROUPS for anonymous user in '#authenticated' configuration", async () => {
            const newJob = {
              ...jobAuthenticated,
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
        
          it("0380: Add a new job as a user from CREATE_JOB_GROUPS for himself/herself in '#authenticated' configuration", async () => {
            const newJob = {
              ...jobAuthenticated,
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
        
          it("0390: Add a new job as a normal user for himself/herself in '#authenticated' configuration", async () => {
            const newJob = {
              ...jobAuthenticated,
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
              });
          });
        
          it("0400: Add a new job as unauthenticated user in '#authenticated' configuration, which should fail as forbidden", async () => {
            const newJob = {
              ...jobAuthenticated,
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
})
