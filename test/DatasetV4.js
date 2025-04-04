/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const { v4: uuidv4 } = require("uuid");

let accessTokenAdminIngestor = null;
let accessTokenArchiveManager = null;
let accessTokenUser1 = null;
let accessTokenUser2 = null;
let derivedDatasetMinPid = null;

describe("2500: Datasets v4 tests", () => {
  before(async () => {
    db.collection("Dataset").deleteMany({});

    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });

    accessTokenUser1 = await utils.getToken(appUrl, {
      username: "user1",
      password: TestData.Accounts["user1"]["password"],
    });

    accessTokenUser2 = await utils.getToken(appUrl, {
      username: "user2",
      password: TestData.Accounts["user2"]["password"],
    });

    accessTokenArchiveManager = await utils.getToken(appUrl, {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
    });
  });

  async function deleteDataset(item) {
    const response = await request(appUrl)
      .delete("/api/v4/datasets/" + encodeURIComponent(item.pid))
      .auth(accessTokenArchiveManager, { type: "bearer" })
      .expect(TestData.SuccessfulDeleteStatusCode);

    return response;
  }

  async function processArray(array) {
    for (const item of array) {
      await deleteDataset(item);
    }
  }

  describe("Datasets validation tests", () => {
    it("0100: should not be able to validate dataset if not logged in", async () => {
      return request(appUrl)
        .post("/api/v4/datasets/isValid")
        .send(TestData.DerivedCorrectMinV4)
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0101: check if minimal derived dataset is valid", async () => {
      return request(appUrl)
        .post("/api/v4/datasets/isValid")
        .send(TestData.DerivedCorrectMinV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryValidStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("valid").and.equal(true);
        });
    });

    it("0102: check if minimal raw dataset is valid", async () => {
      return request(appUrl)
        .post("/api/v4/datasets/isValid")
        .send(TestData.RawCorrectMinV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryValidStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("valid").and.equal(true);
        });
    });

    it("0103: check if custom dataset is valid", async () => {
      return request(appUrl)
        .post("/api/v4/datasets/isValid")
        .send(TestData.CustomDatasetCorrect)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryValidStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("valid").and.equal(true);
        });
    });

    it("0104: check if invalid derived dataset is valid", async () => {
      return request(appUrl)
        .post("/api/v4/datasets/isValid")
        .send(TestData.DerivedWrongV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryValidStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("valid").and.equal(false);
        });
    });
  });

  describe("Datasets creation tests", () => {
    it("0110: should not be able to create dataset if not logged in", async () => {
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(TestData.DerivedCorrectMinV4)
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0111: adds a new minimal derived dataset", async () => {
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(TestData.DerivedCorrectMinV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("owner").and.be.a("string");
          res.body.should.have.property("type").and.equal("derived");
          res.body.should.have.property("pid").and.be.a("string");
          derivedDatasetMinPid = res.body.pid;
        });
    });

    it("0112: adds a new minimal raw dataset", async () => {
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(TestData.RawCorrectMinV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have
            .property("owner")
            .and.be.string(TestData.RawCorrectMinV4.owner);
          res.body.should.have.property("type").and.equal("raw");
          res.body.should.have.property("pid").and.be.a("string");
        });
    });

    it("0113: adds a new minimal custom dataset", async () => {
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(TestData.CustomDatasetCorrectMin)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("owner").and.be.a("string");
          res.body.should.have.property("type").and.equal("custom");
          res.body.should.have.property("pid").and.be.a("string");
        });
    });

    it("0114: adds a new derived dataset", async () => {
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(TestData.DerivedCorrectV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("owner").and.be.a("string");
          res.body.should.have.property("type").and.equal("derived");
          res.body.should.have.property("pid").and.be.a("string");
        });
    });

    it("0115: adds a new raw dataset", async () => {
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(TestData.RawCorrectV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("owner").and.be.a("string");
          res.body.should.have.property("type").and.equal("raw");
          res.body.should.have.property("pid").and.be.a("string");
        });
    });

    it("0116: adds a new custom dataset", async () => {
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(TestData.CustomDatasetCorrect)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have
            .property("owner")
            .and.be.equal(TestData.CustomDatasetCorrect.owner);
          res.body.should.have.property("type").and.be.equal("custom");
          res.body.should.have.property("pid").and.be.a("string");
          res.body.should.have.property("proposalIds").and.be.a("array");
          res.body.should.have.property("sampleIds").and.be.a("array");
          res.body.should.have.property("instrumentIds").and.be.a("array");
        });
    });

    it("0120: should be able to add new derived dataset with explicit pid", async () => {
      const derivedDatasetWithExplicitPID = {
        ...TestData.DerivedCorrectV4,
        pid: TestData.PidPrefix + "/" + uuidv4(),
      };
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(derivedDatasetWithExplicitPID)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have
            .property("owner")
            .and.be.equal(derivedDatasetWithExplicitPID.owner);
          res.body.should.have.property("type").and.be.equal("derived");
          res.body.should.have
            .property("pid")
            .and.be.equal(derivedDatasetWithExplicitPID.pid);
        });
    });

    it("0121: should not be able to add new derived dataset with user that is not in create dataset list", async () => {
      const derivedDatasetWithExplicitPID = {
        ...TestData.DerivedCorrectV4,
        pid: TestData.PidPrefix + "/" + uuidv4(),
      };

      return request(appUrl)
        .post("/api/v4/datasets")
        .send(derivedDatasetWithExplicitPID)
        .auth(accessTokenUser1, { type: "bearer" })
        .expect(TestData.CreationForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0122: should not be able to add new derived dataset with group that is not part of allowed groups", async () => {
      const derivedDatasetWithExplicitPID = {
        ...TestData.DerivedCorrectV4,
        pid: TestData.PidPrefix + "/" + uuidv4(),
        ownerGroup: "group1",
      };
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(derivedDatasetWithExplicitPID)
        .auth(accessTokenUser2, { type: "bearer" })
        .expect(TestData.CreationForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0123: should not be able to add new derived dataset with correct group but explicit PID that does not pass validation", async () => {
      const derivedDatasetWithExplicitPID = {
        ...TestData.DerivedCorrectV4,
        ownerGroup: "group2",
        pid: "strange-pid",
      };
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(derivedDatasetWithExplicitPID)
        .auth(accessTokenUser2, { type: "bearer" })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0124: should be able to add new derived dataset with group that is part of allowed groups and correct explicit PID", async () => {
      const derivedDatasetWithExplicitPID = {
        ...TestData.DerivedCorrectV4,
        ownerGroup: "group2",
        pid: TestData.PidPrefix + "/" + uuidv4(),
      };
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(derivedDatasetWithExplicitPID)
        .auth(accessTokenUser2, { type: "bearer" })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("owner").and.be.a("string");
          res.body.should.have.property("type").and.equal("derived");
          res.body.should.have
            .property("pid")
            .and.equal(derivedDatasetWithExplicitPID.pid);
        });
    });

    it("0125: tries to add an incomplete derived dataset", async () => {
      return request(appUrl)
        .post("/api/v4/datasets")
        .send(TestData.DerivedWrongV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.statusCode.should.not.be.equal(200);
        });
    });
  });

  describe("Datasets v4 findAll tests", () => {
    it("0200: should not be able to fetch datasets if not logged in", async () => {
      const filter = {
        limits: {
          limit: 2,
          skip: 0,
          sort: {
            datasetName: "asc",
          },
        },
      };

      return request(appUrl)
        .get("/api/v4/datasets")
        .query({ filter: JSON.stringify(filter) })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0201: should fetch several datasets using limits sort filter", async () => {
      const filter = {
        limits: {
          limit: 2,
          skip: 0,
          sort: {
            datasetName: "asc",
          },
        },
      };

      await request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          res.body.should.have.length(2);
          const [firstDatast, secondDataset] = res.body;

          firstDatast.datasetName.should.satisfy(
            () => firstDatast.datasetName <= secondDataset.datasetName,
          );
        });

      filter.limits.limit = 3;
      filter.limits.sort.datasetName = "desc";

      return request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          res.body.should.have.length(3);
          const [firstDatast, secondDataset, thirdDataset] = res.body;

          firstDatast.datasetName.should.satisfy(
            () =>
              firstDatast.datasetName >= secondDataset.datasetName &&
              firstDatast.datasetName >= thirdDataset.datasetName &&
              secondDataset.datasetName >= thirdDataset.datasetName,
          );
        });
    });

    it("0202: should fetch different dataset if skip is used in limits filter", async () => {
      let responseBody;
      const filter = {
        limits: {
          limit: 1,
          skip: 0,
          sort: {
            datasetName: "asc",
          },
        },
      };

      await request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          res.body.should.have.length(1);

          responseBody = res.body;
        });

      filter.limits.skip = 1;

      return request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          res.body.should.have.length(1);

          JSON.stringify(responseBody).should.not.be.equal(
            JSON.stringify(res.body),
          );
        });
    });

    it("0203: should fetch specific dataset fields only if fields is provided in the filter", async () => {
      const filter = {
        fields: ["datasetName", "pid"],
      };

      return request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          const [firstDataset] = res.body;

          firstDataset.should.have.property("datasetName");
          firstDataset.should.have.property("pid");
          firstDataset.should.not.have.property("description");
        });
    });

    it("0204: should fetch dataset relation fields if provided in the filter", async () => {
      const filter = {
        include: ["instruments", "proposals"],
      };

      return request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          const [firstDataset] = res.body;

          firstDataset.should.have.property("pid");
          firstDataset.should.have.property("instruments");
          firstDataset.should.have.property("proposals");
          firstDataset.should.not.have.property("datablocks");
        });
    });

    it("0205: should fetch all datasets with related items when requested with all relations", async () => {
      const filter = {
        include: ["all"],
      };

      return request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          const [firstDataset] = res.body;

          firstDataset.should.have.property("pid");
          firstDataset.should.have.property("instruments");
          firstDataset.should.have.property("proposals");
          firstDataset.should.have.property("datablocks");
          firstDataset.should.have.property("attachments");
          firstDataset.should.have.property("origdatablocks");
          firstDataset.should.have.property("samples");
        });
    });

    it("0206: should be able to fetch the datasets providing where filter", async () => {
      const filter = {
        where: {
          datasetName: {
            $regex: "Dataset",
            $options: "i",
          },
        },
      };

      return request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");

          res.body.forEach((dataset) => {
            dataset.datasetName.should.match(/Dataset/i);
          });
        });
    });

    it("0207: should be able to fetch the datasets providing all allowed filters together", async () => {
      const filter = {
        where: {
          datasetName: {
            $regex: "Dataset",
            $options: "i",
          },
        },
        include: ["all"],
        fields: ["datasetName", "pid"],
        limits: {
          limit: 2,
          skip: 0,
          sort: {
            datasetName: "asc",
          },
        },
      };

      return request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          res.body.should.have.length(2);

          res.body.forEach((dataset) => {
            dataset.should.have.property("datasetName");
            dataset.should.have.property("pid");
            dataset.should.not.have.property("description");

            dataset.should.have.property("pid");
            dataset.should.have.property("instruments");
            dataset.should.have.property("proposals");
            dataset.should.have.property("datablocks");
            dataset.should.have.property("attachments");
            dataset.should.have.property("origdatablocks");
            dataset.should.have.property("samples");

            dataset.datasetName.should.match(/Dataset/i);
          });
        });
    });

    it("0208: should not be able to provide filters that are not allowed", async () => {
      const filter = {
        customField: { datasetName: "test" },
      };

      return request(appUrl)
        .get(`/api/v4/datasets`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/);
    });
  });

  describe("Datasets v4 findOne tests", () => {
    it("0300: should not be able to fetch dataset if not logged in", async () => {
      const filter = {
        limits: {
          skip: 0,
          sort: {
            datasetName: "asc",
          },
        },
      };

      return request(appUrl)
        .get("/api/v4/datasets/findOne")
        .query({ filter: JSON.stringify(filter) })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0301: should fetch different dataset if skip is used in limits filter", async () => {
      let responseBody;
      const filter = {
        limits: {
          skip: 0,
          sort: {
            datasetName: "asc",
          },
        },
      };

      await request(appUrl)
        .get(`/api/v4/datasets/findOne`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          responseBody = res.body;
        });

      filter.limits.skip = 1;

      return request(appUrl)
        .get(`/api/v4/datasets/findOne`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          JSON.stringify(responseBody).should.not.be.equal(
            JSON.stringify(res.body),
          );
        });
    });

    it("0302: should fetch specific dataset fields only if fields is provided in the filter", async () => {
      const filter = {
        fields: ["datasetName", "pid"],
      };

      return request(appUrl)
        .get(`/api/v4/datasets/findOne`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("datasetName");
          res.body.should.have.property("pid");
          res.body.should.not.have.property("description");
        });
    });

    it("0303: should fetch dataset relation fields if provided in the filter", async () => {
      const filter = {
        include: ["instruments", "proposals"],
      };

      return request(appUrl)
        .get(`/api/v4/datasets/findOne`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("pid");
          res.body.should.have.property("instruments");
          res.body.should.have.property("proposals");
          res.body.should.not.have.property("datablocks");
        });
    });

    it("0304: should fetch all dataset relation fields if provided in the filter", async () => {
      const filter = {
        include: ["all"],
      };

      return request(appUrl)
        .get(`/api/v4/datasets/findOne`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("pid");
          res.body.should.have.property("instruments");
          res.body.should.have.property("proposals");
          res.body.should.have.property("datablocks");
          res.body.should.have.property("attachments");
          res.body.should.have.property("origdatablocks");
          res.body.should.have.property("samples");
        });
    });

    it("0305: should be able to fetch the dataset providing where filter", async () => {
      const filter = {
        where: {
          datasetName: {
            $regex: "Dataset",
            $options: "i",
          },
        },
      };

      return request(appUrl)
        .get(`/api/v4/datasets/findOne`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.datasetName.should.match(/Dataset/i);
        });
    });

    it("0306: should be able to fetch a dataset providing all allowed filters together", async () => {
      const filter = {
        where: {
          datasetName: {
            $regex: "Dataset",
            $options: "i",
          },
        },
        include: ["all"],
        fields: ["datasetName", "pid"],
        limits: {
          skip: 0,
          sort: {
            datasetName: "asc",
          },
        },
      };

      return request(appUrl)
        .get(`/api/v4/datasets/findOne`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("datasetName");
          res.body.should.have.property("pid");
          res.body.should.not.have.property("description");

          res.body.should.have.property("pid");
          res.body.should.have.property("instruments");
          res.body.should.have.property("proposals");
          res.body.should.have.property("datablocks");
          res.body.should.have.property("attachments");
          res.body.should.have.property("origdatablocks");
          res.body.should.have.property("samples");

          res.body.datasetName.should.match(/Dataset/i);
        });
    });

    it("0307: should not be able to provide filters that are not allowed", async () => {
      const filter = {
        customField: { datasetName: "test" },
      };

      return request(appUrl)
        .get(`/api/v4/datasets/findOne`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/);
    });
  });

  describe("Datasets v4 count tests", () => {
    it("0400: should not be able to fetch datasets count if not logged in", async () => {
      const filter = {
        limits: {
          skip: 0,
          sort: {
            datasetName: "asc",
          },
        },
      };

      return request(appUrl)
        .get("/api/v4/datasets/count")
        .query({ filter: JSON.stringify(filter) })
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0401: should be able to fetch the datasets count providing where filter", async () => {
      const filter = {
        where: {
          datasetName: {
            $regex: "Dataset",
            $options: "i",
          },
        },
      };

      return request(appUrl)
        .get(`/api/v4/datasets/count`)
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body.should.have.property("count");
          res.body.count.should.be.a("number");
          res.body.count.should.be.greaterThan(0);
        });
    });
  });

  describe("Datasets v4 findById tests", () => {
    it("0500: should not be able to fetch dataset by id if not logged in", () => {
      return request(appUrl)
        .get(`/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}`)
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0501: should fetch dataset by id", () => {
      return request(appUrl)
        .get(`/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}`)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.pid.should.be.eq(derivedDatasetMinPid);
        });
    });

    it("0502: should fetch dataset relation fields if provided in the filter", () => {
      return request(appUrl)
        .get(
          `/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}?include=instruments&include=proposals`,
        )
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("pid");
          res.body.should.have.property("instruments");
          res.body.should.have.property("proposals");
          res.body.should.not.have.property("datablocks");
        });
    });

    it("0503: should fetch all dataset relation fields if provided in the filter", () => {
      return request(appUrl)
        .get(
          `/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}?include=all`,
        )
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("pid");
          res.body.should.have.property("instruments");
          res.body.should.have.property("proposals");
          res.body.should.have.property("datablocks");
          res.body.should.have.property("attachments");
          res.body.should.have.property("origdatablocks");
          res.body.should.have.property("samples");
        });
    });
  });

  describe("Datasets v4 update tests", () => {
    it("0600: should not be able to update dataset if not logged in", () => {
      const updatedDataset = {
        ...TestData.DerivedCorrectMinV4,
        datasetName: "Updated dataset name",
      };

      return request(appUrl)
        .put(`/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}`)
        .send(updatedDataset)
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0601: should be able to update dataset", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type, ...updatedDataset } = {
        ...TestData.DerivedCorrectMinV4,
        datasetName: "Updated dataset name",
      };

      return request(appUrl)
        .put(`/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}`)
        .send(updatedDataset)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("pid");
          res.body.should.have.property("datasetName");
          res.body.datasetName.should.be.eq(updatedDataset.datasetName);
        });
    });

    it("0600: should not be able to partially update dataset if not logged in", () => {
      const updatedDataset = {
        datasetName: "Updated dataset name",
      };

      return request(appUrl)
        .patch(`/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}`)
        .send(updatedDataset)
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0601: should be able to partially update dataset", () => {
      const updatedDataset = {
        datasetName: "Updated dataset name",
      };

      return request(appUrl)
        .patch(`/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}`)
        .send(updatedDataset)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulPatchStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("pid");
          res.body.should.have.property("datasetName");
          res.body.datasetName.should.be.eq(updatedDataset.datasetName);
        });
    });
  });

  describe("Datasets v4 delete tests", () => {
    it("0700: should not be able to delete dataset if not logged in", () => {
      return request(appUrl)
        .delete(`/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}`)
        .expect(TestData.AccessForbiddenStatusCode)
        .expect("Content-Type", /json/);
    });

    it("0701: should be able to delete dataset", () => {
      return request(appUrl)
        .delete(`/api/v4/datasets/${encodeURIComponent(derivedDatasetMinPid)}`)
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.SuccessfulDeleteStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("pid");
          res.body.should.have.property("datasetName");
        });
    });

    it("0702: delete all dataset as archivemanager", async () => {
      return await request(appUrl)
        .get("/api/v4/datasets")
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulDeleteStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          return processArray(res.body);
        });
    });
  });
});
