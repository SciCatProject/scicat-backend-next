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
  jobId2 = null,
  jobId3 = null;

const dataset1 = {
  ...TestData.DerivedCorrectV4,
  isPublished: true,
  ownerGroup: "group1",
  accessGroups: ["group5"],
};

const dataset2 = {
  ...TestData.DerivedCorrectV4,
  isPublished: false,
  ownerGroup: "group3",
  accessGroups: [],
};

const dataset3 = {
  ...TestData.DerivedCorrectV4,
  isPublished: false,
  ownerGroup: "group5",
  accessGroups: ["group1"],
};

describe.only("1165: Jobs test filters and access", () => {
  before(async () => {
    db.collection("Dataset").deleteMany({});
    db.collection("Datablock").deleteMany({});
    db.collection("Job").deleteMany({});
    db.collection("Instrument").deleteMany({});
    db.collection("Sample").deleteMany({});

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

    accessTokenUser2 = await utils.getToken(appUrl, {
      username: "user2",
      password: TestData.Accounts["user2"]["password"],
    });

    accessTokenUser3 = await utils.getToken(appUrl, {
      username: "user3",
      password: TestData.Accounts["user3"]["password"],
    });

    accessTokenUser51 = await utils.getToken(appUrl, {
      username: "user5.1",
      password: TestData.Accounts["user5.1"]["password"],
    });

    await request(appUrl)
      .post("/api/v3/Instruments")
      .send(TestData.InstrumentCorrect1)
      .auth(accessTokenAdminIngestor, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        instrumentId = res.body.pid;
      });

    await request(appUrl)
      .post("/api/v3/Samples")
      .send({
        ...TestData.SampleCorrect,
        ownerGroup: TestData.Accounts.user1.role,
      })
      .auth(accessTokenAdminIngestor, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        sampleId = res.body.sampleId;
      });

    await request(appUrl)
      .post("/api/v4/datasets")
      .send({
        ...dataset1,
        instrumentIds: [instrumentId],
        sampleIds: [sampleId],
      })
      .set("Accept", "application/json")
      .auth(accessTokenAdminIngestor, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        datasetPid1 = res.body["pid"];
      });
    await request(appUrl)
      .post("/api/v4/datasets")
      .send({
        ...dataset2,
        instrumentIds: [instrumentId],
        sampleIds: [sampleId],
      })
      .set("Accept", "application/json")
      .auth(accessTokenAdminIngestor, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        datasetPid2 = res.body["pid"];
      });

    await request(appUrl)
      .post("/api/v4/datasets")
      .send({
        ...dataset3,
        instrumentIds: [instrumentId],
        sampleIds: [sampleId],
      })
      .set("Accept", "application/json")
      .auth(accessTokenAdminIngestor, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        datasetPid3 = res.body["pid"];
      });

    await request(appUrl)
      .post("/api/v4/Jobs")
      .send({
        type: "dataset_access",
        ownerUser: "admin",
        ownerGroup: "admin",
        jobParams: {
          datasetList: [{ pid: datasetPid1, files: [] }],
        },
      })
      .set("Accept", "application/json")
      .auth(accessTokenAdmin, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        jobId1 = res.body["id"];
      });

    await request(appUrl)
      .post("/api/v4/Jobs")
      .send({
        type: "dataset_access",
        ownerUser: "user1",
        ownerGroup: "group1",
        jobParams: {
          datasetList: [
            { pid: datasetPid1, files: [] },
            { pid: datasetPid2, files: [] },
            { pid: datasetPid3, files: [] },
          ],
        },
      })
      .set("Accept", "application/json")
      .auth(accessTokenAdmin, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        jobId2 = res.body["id"];
      });

    await request(appUrl)
      .post("/api/v4/Jobs")
      .send({
        type: "dataset_access",
        ownerUser: "user5.1",
        ownerGroup: "group5",
        jobParams: {
          datasetList: [
            { pid: datasetPid1, files: [] },
            { pid: datasetPid2, files: [] },
            { pid: datasetPid3, files: [] },
          ],
        },
      })
      .set("Accept", "application/json")
      .auth(accessTokenAdmin, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        jobId3 = res.body["id"];
      });
    console.log("Created jobs: ", jobId1, jobId2, jobId3);
  });

  //   after(() => {
  //     db.collection("Dataset").deleteMany({});
  //     db.collection("Datablock").deleteMany({});
  //     db.collection("Job").deleteMany({});
  //   });

  it("0100: Access jobs as a user from ADMIN_GROUPS with include query not specifying datasets", async () => {
    const query = { include: ["instruments"] };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("message")
          .and.be.equal(
            "Database filter 'include' must include 'datasets' field as it's the only other collection that can be merged for now. If you need to include other relations based on datasets, add 'datasets' to the query.",
          );
      });
  });
  it("0200: Access jobs as a user from ADMIN_GROUPS with wrong include query", async () => {
    const query = { include: ["datasets", "journals"] };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("message")
          .and.be.equal(
            "Provided include field 'journals' is not part of the job or dataset relations",
          );
      });
  });
  it("0300: Access jobs as a user from ADMIN_GROUPS with a not complete query.", async () => {
    const query = { include: ["datasets", "instruments"] };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("message")
          .and.be.equal(
            "Provided include field 'instruments' is not part of the job relation but part of dataset relation. Please specify it with 'datasets.instruments'",
          );
      });
  });
  it("0400: Access jobs as a user from ADMIN_GROUPS with a correct include query and fields query", async () => {
    const query = {
      include: ["datasets"],
      fields: ["type", "datasets.pid", "datasets.keywords"],
    };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
        res.body[0].should.include.keys(["type", "datasets"]);
        const job = res.body.find((j) => j.id === jobId1);
        job.datasets.should.be.an("array").to.have.lengthOf(1);
        job.datasets[0].should.include.keys(["pid", "keywords"]);
        job.datasets[0].pid.should.be.an("string").and.be.equal(datasetPid1);
        res.body[0].type.should.be.equal("dataset_access");
      });
  });
  it("0500: Access jobs as a user from ADMIN_GROUPS with no fields query that should return all properties of JobClass, order of includes doesn't matter", async () => {
    const query = { include: ["datasets.instruments", "datasets"] };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdmin}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
        res.body[0].should.include.keys([
          "createdBy",
          "updatedBy",
          "createdAt",
          "updatedAt",
          "ownerGroup",
          "accessGroups",
          "isPublished",
          "id",
          "ownerUser",
          "type",
          "statusCode",
          "statusMessage",
          "jobParams",
          "contactEmail",
          "configVersion",
          "jobResultObject",
          "datasets",
        ]);
      });
  });

  it("0600: Access jobs, datasets and instruments, that should be returned based on correct access", async () => {
    const query = {
      include: ["datasets", "datasets.instruments"],
      fields: ["id", "datasets.pid", "datasets.instruments.pid"],
    };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3); // user1 is in CreateJobPrivileged Groups, so can read any job
        const j1 = res.body.find((j) => j.id === jobId1);
        const j2 = res.body.find((j) => j.id === jobId2);
        const j3 = res.body.find((j) => j.id === jobId3);
        j1.should.include.keys(["id", "datasets"]);
        j1.datasets.should.be.an("array").to.have.lengthOf(1);
        const j1ds1 = j1.datasets.find((d) => d.pid === datasetPid1);
        j1ds1.should.include.keys(["pid", "instruments"]);
        j1ds1.instruments.should.be.an("array").to.have.lengthOf(1);
        const [instrument] = j1ds1.instruments;
        instrument.should.have.property("pid");
        instrument.pid.should.be.eq(instrumentId);

        j2.should.include.keys(["id", "datasets"]);
        j2.datasets.should.be.an("array").to.have.lengthOf(2);
        const j2ds1 = j2.datasets.find((d) => d.pid === datasetPid1);
        const j2ds3 = j2.datasets.find((d) => d.pid === datasetPid3);
        j2ds1.should.include.keys(["pid", "instruments"]);
        j2ds3.should.include.keys(["pid", "instruments"]);

        j3.should.include.keys(["id", "datasets"]);
        j3.datasets.should.be.an("array").to.have.lengthOf(2);
        const j3ds1 = j3.datasets.find((d) => d.pid === datasetPid1);
        const j3ds3 = j3.datasets.find((d) => d.pid === datasetPid3);
        j3ds1.should.include.keys(["pid", "instruments"]);
        j3ds3.should.include.keys(["pid", "instruments"]);
      });
  });
  it("0700: Access jobs, datasets and instruments, that should be returned based on correct access", async () => {
    const query = { include: ["datasets", "datasets.instruments"] };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser51}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(1);
        const job = res.body[0];
        job.should.have.property("id").and.be.equal(jobId3);
        job.should.include.keys([
          "createdBy",
          "updatedBy",
          "createdAt",
          "updatedAt",
          "ownerGroup",
          "accessGroups",
          "isPublished",
          "id",
          "ownerUser",
          "type",
          "statusCode",
          "statusMessage",
          "jobParams",
          "contactEmail",
          "configVersion",
          "jobResultObject",
          "datasets",
        ]);
        job.datasets.should.be.an("array").to.have.lengthOf(2);
        const ds1 = job.datasets.find((d) => d.pid === datasetPid1);
        const ds3 = job.datasets.find((d) => d.pid === datasetPid3);
        ds1.should.include.keys(["pid", "instruments"]);
        ds3.should.include.keys(["pid", "instruments"]);
      });
  });

  it("0800: Access jobs, datasets and instruments, that should be returned based on correct access", async () => {
    const query = {
      include: ["datasets", "datasets.samples", "datasets.instruments"],
    };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser3}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3); // user3 is in CreateJobPrivileged Groups, so can read any job
        const j1 = res.body.find((j) => j.id === jobId1);
        const j2 = res.body.find((j) => j.id === jobId2);
        const j3 = res.body.find((j) => j.id === jobId3);
        j1.should.include.keys(["id", "datasets"]);
        j1.datasets.should.be.an("array").to.have.lengthOf(1);
        const j1ds1 = j1.datasets.find((d) => d.pid === datasetPid1);
        j1ds1.should.include.keys(["pid", "instruments", "samples"]);
        j1ds1.instruments.should.be.an("array").to.have.lengthOf(1);
        const [instrument] = j1ds1.instruments;
        instrument.should.have.property("pid");
        instrument.pid.should.be.eq(instrumentId);
        j1ds1.samples.should.be.an("array").to.have.lengthOf(0);

        j2.should.include.keys(["id", "datasets"]);
        j2.datasets.should.be.an("array").to.have.lengthOf(2);
        const j2ds1 = j2.datasets.find((d) => d.pid === datasetPid1);
        const j2ds2 = j2.datasets.find((d) => d.pid === datasetPid2);
        j2ds1.should.include.keys(["pid", "instruments", "samples"]);
        j2ds2.should.include.keys(["pid", "instruments", "samples"]);

        j3.should.include.keys(["id", "datasets"]);
        j3.datasets.should.be.an("array").to.have.lengthOf(2);
        const j3ds1 = j3.datasets.find((d) => d.pid === datasetPid1);
        const j3ds2 = j3.datasets.find((d) => d.pid === datasetPid2);
        j3ds1.should.include.keys(["pid", "instruments", "samples"]);
        j3ds2.should.include.keys(["pid", "instruments", "samples"]);
      });
  });

  it("0900: Access jobs, datasets and instruments, that should be returned based on correct access", async () => {
    const query = {
      include: ["datasets", "datasets.samples", "datasets.instruments"],
    };
    return request(appUrl)
      .get(`/api/v4/Jobs/`)
      .send({})
      .query("filter=" + encodeURIComponent(JSON.stringify(query)))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array").to.have.lengthOf(3);
        const j1 = res.body.find((j) => j.id === jobId1);
        const j2 = res.body.find((j) => j.id === jobId2);
        const j3 = res.body.find((j) => j.id === jobId3);
        j1.should.include.keys(["id", "datasets"]);
        j1.datasets.should.be.an("array").to.have.lengthOf(1);
        const j1ds1 = j1.datasets.find((d) => d.pid === datasetPid1);
        j1ds1.should.include.keys(["pid", "instruments"]);
        j1ds1.instruments.should.be.an("array").to.have.lengthOf(1);
        const [instrument] = j1ds1.instruments;
        instrument.should.have.property("pid");
        instrument.pid.should.be.eq(instrumentId);
        j1ds1.samples.should.be.an("array").to.have.lengthOf(1);

        j2.should.include.keys(["id", "datasets"]);
        // j2.datasets.should.be.an("array").to.have.lengthOf(3)
        const j2ds1 = j2.datasets.find((d) => d.pid === datasetPid1);
        const j2ds2 = j2.datasets.find((d) => d.pid === datasetPid2);
        const j2ds3 = j2.datasets.find((d) => d.pid === datasetPid3);
        j2ds1.should.include.keys(["pid", "instruments"]);
        j2ds2.should.include.keys(["pid", "instruments"]);
        j2ds3.should.include.keys(["pid", "instruments"]);

        j3.should.include.keys(["id", "datasets"]);
        j3.datasets.should.be.an("array").to.have.lengthOf(3);
        const j3ds1 = j3.datasets.find((d) => d.pid === datasetPid1);
        const j3ds2 = j2.datasets.find((d) => d.pid === datasetPid2);
        const j3ds3 = j3.datasets.find((d) => d.pid === datasetPid3);
        j3ds1.should.include.keys(["pid", "instruments"]);
        j3ds2.should.include.keys(["pid", "instruments"]);
        j3ds3.should.include.keys(["pid", "instruments"]);
      });
  });
});
