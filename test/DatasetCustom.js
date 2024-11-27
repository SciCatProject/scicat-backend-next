/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

var utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const { v4: uuidv4 } = require("uuid");

var accessTokenAdminIngestor = null;
var accessTokenArchiveManager = null;
var accessTokenUser1 = null;
var accessTokenUser2 = null;
var pid = null;
var minPid = null;
var explicitPid = null;

describe("2400: CustomDataset: Custom Type Datasets", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
  });
  beforeEach(async() => {
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
      .delete("/api/v3/datasets/" + encodeURIComponent(item.pid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode);

    return response;
  }

  async function processArray(array) {
    for (const item of array) {
      await deleteDataset(item);
    }
  }

  // check if dataset is valid
  it("0100: check if valid custom dataset is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.CustomDatasetCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryValidStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(true);
      });
  });

  it("0110: adds a new minimal custom dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.CustomDatasetCorrectMin)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("custom");
        res.body.should.have.property("pid").and.be.string;
        minPid = res.body["pid"];
      });
  });

  it("0120: adds a new custom dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.CustomDatasetCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("owner")
          .and.be.equal(TestData.CustomDatasetCorrect.owner);
        res.body.should.have.property("type").and.be.equal("custom");
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        res.body.should.have.property("instrumentId").and.be.string;
        pid = res.body["pid"];
      });
  });

  it("0130: should be able to add new custom dataset with explicit pid", async () => {
    const customDatasetWithExplicitPID = {
      ...TestData.CustomDatasetCorrect,
      pid: TestData.PidPrefix + "/" + uuidv4(),
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(customDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("owner")
          .and.be.equal(customDatasetWithExplicitPID.owner);
        res.body.should.have.property("type").and.be.equal("custom");
        res.body.should.have
          .property("pid")
          .and.be.equal(customDatasetWithExplicitPID.pid);
        pid = res.body["pid"];
      });
  });

  it("0135: should not be able to add new custom dataset with user that is not in create dataset list", async () => {
    const customDatasetWithExplicitPID = {
      ...TestData.CustomDatasetCorrect,
      pid: TestData.PidPrefix + "/" + uuidv4(),
    };

    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(customDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser1}` })
      .expect(TestData.CreationForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0140: should not be able to add new custom dataset with group that is not part of allowed groups", async () => {
    const customDatasetWithExplicitPID = {
      ...TestData.CustomDatasetCorrect,
      pid: TestData.PidPrefix + "/" + uuidv4(),
      ownerGroup: "group1",
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(customDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(TestData.CreationForbiddenStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0145: should not be able to add new custom dataset with correct group but explicit PID that does not pass validation", async () => {
    const customDatasetWithExplicitPID = {
      ...TestData.CustomDatasetCorrect,
      ownerGroup: "group2",
      pid: "strange-pid",
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(customDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0150: should be able to add new custom dataset with group that is part of allowed groups and correct explicit PID", async () => {
    const customDatasetWithExplicitPID = {
      ...TestData.CustomDatasetCorrect,
      ownerGroup: "group2",
      pid: TestData.PidPrefix + "/" + uuidv4(),
    };
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(customDatasetWithExplicitPID)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenUser2}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("custom");
        res.body.should.have
          .property("pid")
          .and.equal(customDatasetWithExplicitPID.pid);
        explicitPid = res.body["pid"];
      });
  });

  // check if dataset is valid
  it("0160: check if invalid custom dataset is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.CustomDatasetWrongData)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryValidStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("0165: check if custom dataset with undefined type is valid", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets/isValid")
      .send(TestData.CustomDatasetWrongType)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryValidStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("valid").and.equal(false);
      });
  });

  it("0170: tries to add an incomplete custom dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.CustomDatasetIncompleteData)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.BadRequestStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.statusCode.should.not.be.equal(200);
      });
  });

  it("0180: should fetch several custom datasets", async () => {
    const filter = {
      where: {
        type: "custom",
      },
      limit: 2,
    };

    return request(appUrl)
      .get(
        `/api/v3/Datasets?filter=${encodeURIComponent(JSON.stringify(filter))}`,
      )
      .query(JSON.stringify(filter))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  it("0190: should fetch this custom dataset", async () => {
    const filter = {
      where: {
        pid: pid,
      },
    };

    return request(appUrl)
      .get(
        `/api/v3/datasets/findOne?filter=${encodeURIComponent(
          JSON.stringify(filter),
        )}`,
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .then((res) => {
        res.body.should.have.property("pid").and.equal(pid);
      });
  });

  it("0200: should fetch all custom datasets", async () => {
    const filter = {
      where: {
        type: "custom",
      },
    };

    return request(appUrl)
      .get(
        "/api/v3/Datasets?filter=" + encodeURIComponent(JSON.stringify(filter)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  it("0210: should contain an array of facets", async () => {
    const filter = {
      where: {
        type: "custom",
      },
    };

    return request(appUrl)
      .get(
        "/api/v3/Datasets?filter=" + encodeURIComponent(JSON.stringify(filter)),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array");
      });
  });

  it("0220: should delete a custom dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + encodeURIComponent(pid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0230: should delete a minimal custom dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + encodeURIComponent(minPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0240: should delete a custom dataset with explicit PID", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + encodeURIComponent(explicitPid))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0250: delete all dataset as archivemanager", async () => {
    return await request(appUrl)
      .get("/api/v3/datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        return processArray(res.body);
      });
  });
});
