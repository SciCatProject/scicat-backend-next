/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const { v4: uuidv4 } = require("uuid");

var accessTokenAdminIngestor = null;
var accessTokenArchiveManager = null;
var accessTokenUser1 = null;
var accessTokenUser2 = null;

describe("2500: Datasets v4 tests", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
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

    accessTokenUser2 = await utils.getToken(appUrl, {
      username: "user2",
      password: TestData.Accounts["user2"]["password"],
    });

    accessTokenArchiveManager = await utils.getToken(appUrl, {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
    });
  });

  describe("Datasets validation tests", () => {
    it("0100: check if minimal derived dataset is valid", async () => {
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

    it("0101: check if minimal raw dataset is valid", async () => {
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

    it("0102: check if custom dataset is valid", async () => {
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

    it("0103: check if invalid derived dataset is valid", async () => {
      return request(appUrl)
        .post("/api/v3/Datasets/isValid")
        .send(TestData.DerivedWrong)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.EntryValidStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.have.property("valid").and.equal(false);
        });
    });
  });

  describe("Datasets creation tests", () => {
    it("0110: adds a new minimal derived dataset", async () => {
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
        });
    });

    it("0111: adds a new minimal raw dataset", async () => {
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

    it("0112: adds a new minimal custom dataset", async () => {
      return request(appUrl)
        .post("/api/v3/Datasets")
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

    it("0113: adds a new derived dataset", async () => {
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

    it("0114: adds a new raw dataset", async () => {
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

    it("0115: adds a new custom dataset", async () => {
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
        .post("/api/v3/Datasets")
        .send(TestData.DerivedWrongV4)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.statusCode.should.not.be.equal(200);
        });
    });
  });

  describe("Datasets v4 fetching tests", () => {
    it("0200: should fetch several datasets using limits sort filter", async () => {
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

    it("0201: should fetch different dataset if skip is used in limits filter", async () => {
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
          res.body.should.have.length(0);

          JSON.stringify(responseBody).should.not.be.equal(
            JSON.stringify(res.body),
          );
        });
    });

    it("0202: should fetch specific dataset fields only if fields is provided in the filter", async () => {
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

    it("0203: should fetch dataset relation fields if provided in the filter", async () => {
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

    it("0204: should fetch all dataset relation fields if provided in the filter", async () => {
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

    it("0205: should be able to fetch the datasets providing where filter", async () => {
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

    it("0206: should be able to fetch the datasets providing all allowed filters together", async () => {
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

    it("0206: should not be able to provide filters that are not allowed", async () => {
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

    // it("0190: should fetch this derived dataset", async () => {
    //   const filter = {
    //     where: {
    //       pid: pid,
    //     },
    //   };

    //   return request(appUrl)
    //     .get(
    //       `/api/v3/datasets/findOne?filter=${encodeURIComponent(
    //         JSON.stringify(filter),
    //       )}`,
    //     )
    //     .set("Accept", "application/json")
    //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
    //     .expect(TestData.SuccessfulGetStatusCode)
    //     .then((res) => {
    //       res.body.should.have.property("pid").and.equal(pid);
    //     });
    // });

    // it("0200: should fetch all derived datasets", async () => {
    //   const filter = {
    //     where: {
    //       type: "derived",
    //     },
    //   };

    //   return request(appUrl)
    //     .get(
    //       "/api/v3/Datasets?filter=" +
    //         encodeURIComponent(JSON.stringify(filter)),
    //     )
    //     .set("Accept", "application/json")
    //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
    //     .expect(TestData.SuccessfulGetStatusCode)
    //     .expect("Content-Type", /json/)
    //     .then((res) => {
    //       res.body.should.be.instanceof(Array);
    //     });
    // });
  });

  // it("0220: should delete a derived dataset", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Datasets/" + encodeURIComponent(pid))
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode)
  //     .expect("Content-Type", /json/);
  // });

  // it("0230: should delete a minimal derived dataset", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Datasets/" + encodeURIComponent(minPid))
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode)
  //     .expect("Content-Type", /json/);
  // });

  // it("0240: should delete a derived dataset with explicit PID", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Datasets/" + encodeURIComponent(explicitPid))
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode)
  //     .expect("Content-Type", /json/);
  // });

  // it("0250: delete all dataset as archivemanager", async () => {
  //   return await request(appUrl)
  //     .get("/api/v3/datasets")
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(TestData.SuccessfulDeleteStatusCode)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       return processArray(res.body);
  //     });
  // });
});
