/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessTokenArchiveManager = null;
let accessTokenAdminIngestor = null;
let datasetPid = null;
let origDatablockMinPid = null;
let origDatablockPid = null;

describe("2900: OrigDatablock v4 public endpoint tests", () => {
  before(async () => {
    db.collection("Dataset").deleteMany({});
    db.collection("OrigDatablock").deleteMany({});

    accessTokenAdminIngestor = await utils.getToken(appUrl, {
      username: "adminIngestor",
      password: TestData.Accounts["adminIngestor"]["password"],
    });

    accessTokenArchiveManager = await utils.getToken(appUrl, {
      username: "archiveManager",
      password: TestData.Accounts["archiveManager"]["password"],
    });

    await request(appUrl)
      .post("/api/v4/datasets")
      .send({...TestData.RawCorrectMinV4, isPublished: true})
      .auth(accessTokenAdminIngestor, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .then((res) => {
        datasetPid = res.body.pid;
      });
    
    await request(appUrl)
      .post("/api/v4/origdatablocks")
      .send({...TestData.OrigDatablockV4MinCorrect, datasetId: datasetPid, isPublished: true})
      .auth(accessTokenAdminIngestor, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .then((res) => {
        origDatablockMinPid = res.body._id;
      });
    
    await request(appUrl)
      .post("/api/v4/origdatablocks")
      .send({...TestData.OrigDatablockV4Correct, datasetId: datasetPid, isPublished: true})
      .auth(accessTokenAdminIngestor, { type: "bearer" })
      .expect(TestData.EntryCreatedStatusCode)
      .then((res) => {
        origDatablockPid = res.body._id;
      });
  });

  async function deleteOrigDatablock(item) {
    const response = await request(appUrl)
      .delete(`/api/v4/origdatablocks/${encodeURIComponent(item._id)}`)
      .auth(accessTokenArchiveManager, { type: "bearer" })
      .expect(TestData.SuccessfulDeleteStatusCode);

    return response;
  }

  async function processArray(array) {
    for (const item of array) {
      await deleteOrigDatablock(item);
    }
  }

  describe("OrigDatablocks v4 public findAll tests", () => {
    it("0100: should fetch several origdatablocks using limits sort filter", async () => {
      const filter = {
        limits: {
          limit: 2,
          skip: 0,
          sort: {
            _id: "asc",
          },
        },
      };

      await request(appUrl)
        .get("/api/v4/origdatablocks/public")
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          res.body.should.have.length(2);
          const [firstOrigDatablock, secondOrigDatablock] = res.body;

          firstDatast.datasetName.should.satisfy(
            () => firstOrigDatablock._id <= secondOrigDatablock._id,
          );
        });

      filter.limits.sort._id = "desc";

      return request(appUrl)
        .get("/api/v4/origdatablocks/public")
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          res.body.should.have.length(2);
          const [firstOrigDatablock, secondOrigDatablock] = res.body;

          firstDatast.datasetName.should.satisfy(
            () => firstOrigDatablock._id >= secondOrigDatablock._id,
          );
        });
    });

    it("0101: should fetch different origdatablock if skip is used in limits filter", async () => {
      let responseBody;
      const filter = {
        limits: {
          limit: 1,
          skip: 0,
          sort: {
            _id: "asc",
          },
        },
      };

      await request(appUrl)
        .get("/api/v4/origdatablocks/public")
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
        .get("/api/v4/origdatablocks/public")
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

    it("0102: should fetch specific origdatablock fields only if fields is provided in the filter", async () => {
      const filter = {
        fields: ["datasetId", "_id"],
      };

      return request(appUrl)
        .get("/api/v4/origdatablocks/public")
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          const [firstOrigDatablock] = res.body;

          firstOrigDatablock.should.have.property("datasetId");
          firstOrigDatablock.should.have.property("_id");
          firstOrigDatablock.should.not.have.property("size");
        });
    });

    it("0103: should fetch origdatablock relation fields if provided in the filter", async () => {
      const filter = {
        include: ["dataset"],
      };

      return request(appUrl)
        .get("/api/v4/origdatablocks/public")
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          const [firstOrigDatablock] = res.body;

          firstOrigDatablock.should.have.property("_id");
          firstOrigDatablock.should.have.property("datasetId");
          firstOrigDatablock.should.have.property("size");
          firstOrigDatablock.should.have.property("datasetName");
        });
    });

    it("0104: should fetch origdatablocks with related items when requested with all relations", async () => {
      const filter = {
        include: ["all"],
      };

      return request(appUrl)
        .get("/api/v4/origdatablocks/public")
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          const [firstOrigDatablock] = res.body;

          firstOrigDatablock.should.have.property("datasetId");
          firstOrigDatablock.should.have.property("size");
          firstOrigDatablock.should.have.property("datasetName");
        });
    });

    it("0105: should be able to fetch the origdatablocks providing where filter", async () => {
      const filter = {
        where: {
          datasetId: datasetPid,
        },
      };

      return request(appUrl)
        .get("/api/v4/origdatablocks/public")
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");

          res.body.forEach((odb) => {
            odb.datasetId.should.match(datasetPid);
          });
        });
    });

    it("0106: should be able to fetch the origdatablocks providing all allowed filters together", async () => {
      const filter = {
        where: {
          datasetId: datasetPid,
        },
        include: ["all"],
        fields: ["datasetId", "_id"],
        limits: {
          limit: 2,
          skip: 0,
          sort: {
            _id: "asc",
          },
        },
      };

      return request(appUrl)
        .get("/api/v4/origdatablocks/public")
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("array");
          res.body.should.have.length(2);

          res.body.forEach((odb) => {
            odb.should.have.property("datasetId");
            odb.should.have.property("_id");
            odb.should.not.have.property("description");
            odb.should.not.have.property("instruments");
            odb.should.not.have.property("proposals");
            odb.should.not.have.property("datablocks");
            odb.should.not.have.property("attachments");
            odb.should.not.have.property("origdatablocks");
            odb.should.not.have.property("samples");

            odb.datasetId.should.match(datasetPid);
          });
        });
    });

    it("0107: should not be able to provide filters that are not allowed", async () => {
      const filter = {
        customField: { datasetId: "test" },
      };

      return request(appUrl)
        .get("/api/v4/origdatablocks/public")
        .query({ filter: JSON.stringify(filter) })
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.BadRequestStatusCode)
        .expect("Content-Type", /json/);
    });
  });

  describe("OrigDatablocks v4 public findById tests", () => {
    it("0200: should fetch origdatablock by id", () => {
      return request(appUrl)
        .get(`/api/v4/origdatablocks/public/${encodeURIComponent(origDatablockMinPid)}`)
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");
          res.body._id.should.be.eq(origDatablockMinPid);
        });
    });

    it("0201: should fetch origdatablock relation fields if provided in the filter", () => {
      return request(appUrl)
        .get(
          `/api/v4/origdatablocks/public/${encodeURIComponent(origDatablockPid)}?include=dataset`,
        )
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("datasetId");
          res.body.should.have.property("size");
          res.body.should.have.property("datasetName");
        });
    });

    it("0202: should fetch all origdatablock relation fields if provided in the filter", () => {
      return request(appUrl)
        .get(
          `/api/v4/origdatablocks/public/${encodeURIComponent(origDatablockPid)}?include=all`,
        )
        .auth(accessTokenAdminIngestor, { type: "bearer" })
        .expect(TestData.SuccessfulGetStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.should.be.a("object");

          res.body.should.have.property("datasetId");
          res.body.should.have.property("size");
          res.body.should.have.property("datasetName");
        });
    });
  });

  describe("Cleanup after the tests", () => {
    it("0300: delete all datasets as archivemanager", async () => {
      return await request(appUrl)
        .get("/api/v4/datasets")
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.SuccessfulDeleteStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          return processArray(res.body);
        });
    });

    it("0301: delete all origdatablocks as archivemanager", async () => {
      return await request(appUrl)
        .get("/api/v4/origdatablocks")
        .auth(accessTokenArchiveManager, { type: "bearer" })
        .expect(TestData.SuccessfulDeleteStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          return processArray(res.body);
        });
    });
  });
});
