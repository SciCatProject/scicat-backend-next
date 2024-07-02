/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
const sandbox = require("sinon").createSandbox();

var accessTokenArchiveManager = null;
var idOrigDatablock = null;
let accessTokenAdminIngestor = null,
  defaultPid = null,
  pid = null,
  pidnonpublic = null,
  attachmentId = null,
  doi = null;

const publishedData = { ...TestData.PublishedData };

const origDataBlock = { ...TestData.OrigDataBlockCorrect1 };

const modifiedPublishedData = {
  publisher: "PSI",
  abstract: "a new abstract",
};

const testdataset = {
  ...TestData.RawCorrect,
  isPublished: true,
};

const nonpublictestdataset = {
  ...TestData.RawCorrect,
  ownerGroup: "examplenonpublicgroup",
};

describe("1600: PublishedData: Test of access to published data", () => {
  before(() => {
    db.collection("Dataset").deleteMany({});
    db.collection("PublishedData").deleteMany({});
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
            username: "archiveManager",
            password: TestData.Accounts["archiveManager"]["password"],
          },
          (tokenVal) => {
            accessTokenArchiveManager = tokenVal;
            done();
          },
        );
      },
    );
  });

  afterEach((done) => {
    sandbox.restore();
    done();
  });

  it("0010: adds a published data", async () => {
    return request(appUrl)
      .post("/api/v3/PublishedData")
      .send(publishedData)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("publisher").and.be.string;
        doi = encodeURIComponent(res.body["doi"]);
      });
  });

  it("0020: should fetch this new published data without authorization", async () => {
    return request(appUrl)
      .get("/api/v3/PublishedData/" + doi)
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("publisher").and.equal("ESS");
        res.body.should.have
          .property("status")
          .and.equal("pending_registration");
      });
  });

  it("0030: should fetch this new published data", async () => {
    return request(appUrl)
      .get("/api/v3/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("publisher").and.equal("ESS");
        res.body.should.have
          .property("status")
          .and.equal("pending_registration");
      });
  });

  // NOTE: This is added because we need dataset for registering published data
  it("0040: adds a new raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(testdataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        // store link to this dataset in datablocks
        pid = encodeURIComponent(res.body["pid"]);
        publishedData.pidArray.push(res.body["pid"]);
        origDataBlock.datasetId = res.body["pid"];
        origDataBlock.ownerGroup = res.body.ownerGroup;
      });
  });

  it("0050: should register this new published data", async () => {
    return request(appUrl)
      .post("/api/v3/PublishedData/" + doi + "/register")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulPostStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0060: should fetch this new published data", async () => {
    return request(appUrl)
      .get("/api/v3/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("status").and.equal("registered");
      });
  });

  // NOTE: This one was commented in the old backend as well
  // it("should resync this new published data", async (done) => {
  //   return request(appUrl)
  //     .post("/api/v3/PublishedData/" + doi + "/resync")
  //     .send(modifiedPublishedData)
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .set("Accept", "application/json")
  //     .expect(201)
  //     .expect("Content-Type", /json/)
  //     .then((res, err) => {
  //       if (err) {
  //         return done(err);
  //       }

  //       done();
  //     });
  // });

  it("0070: should fetch this new published data", async () => {
    return request(appUrl)
      .get("/api/v3/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0080: adds a new nonpublic dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(nonpublictestdataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("datasetName").and.be.string;
        pidnonpublic = encodeURIComponent(res.body["pid"]);
      });
  });

  // NOTE: Missing endpoint
  // it("should create one publisheddata to dataset relation", async () => {
  //   return request(appUrl)
  //     .put("/api/v3/PublishedData/" + doi + "/datasets/rel/" + pid)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have
  //         .property("datasetId")
  //         .and.equal(decodeURIComponent(pid));
  //       res.body.should.have
  //         .property("publishedDataId")
  //         .and.equal(decodeURIComponent(doi));
  //     });
  // });

  // it("should fetch publisheddata with non empty dataset relation", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/PublishedData/" + doi + "?filter=%7B%22include%22%3A%7B%22relation%22%3A%22datasets%22%7D%7D")
  //     .set("Accept", "application/json")
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("datasets").and.not.equal([]);
  //       res.body.datasets[0].should.have
  //         .property("pid")
  //         .and.equal(decodeURIComponent(pid));
  //     });
  // });

  it("0090: should delete this published data", async () => {
    return request(appUrl)
      .delete("/api/v3/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0100: should fetch this new dataset", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("isPublished").and.equal(true);
      });
  });

  it("0110: should fetch the non public dataset as ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pidnonpublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("isPublished").and.equal(false);
      });
  });

  it("0120: adds a new origDatablock", async () => {
    return request(appUrl)
      .post("/api/v3/OrigDatablocks")
      .send(origDataBlock)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("size").and.equal(41780189);
        res.body.should.have.property("id").and.be.string;
        idOrigDatablock = res.body["id"];
      });
  });

  it("0130: should add a new attachment to this dataset", async () => {
    const testAttachment = {
      thumbnail: "data/abc123",
      caption: "Some caption",
      datasetId: decodeURIComponent(pid),
      ownerGroup: testdataset.ownerGroup,
      accessGroups: ["loki", "odin"],
    };
    return request(appUrl)
      .post("/api/v3/Datasets/" + pid + "/attachments")
      .send(testAttachment)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.EntryCreatedStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("thumbnail")
          .and.equal(testAttachment.thumbnail);
        res.body.should.have
          .property("caption")
          .and.equal(testAttachment.caption);
        res.body.should.have
          .property("ownerGroup")
          .and.equal(testAttachment.ownerGroup);
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("createdAt");
        res.body.should.have.property("id").and.be.string;
        res.body.should.have
          .property("datasetId")
          .and.equal(testAttachment.datasetId);
        attachmentId = res.body["id"];
      });
  });

  // NOTE: Getting dataset attachment by id is missing but we modify the test little bit and check if created attachment is part of the array of attachments returned by /datasets/{id}/attachments
  it("0140: should fetch this dataset attachment", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pid + "/attachments")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.length(1);
        res.body[0].should.have.property("id").and.equal(attachmentId);
      });
  });

  it("0150: should fetch some published datasets anonymously", async () => {
    var fields = {
      ownerGroup: ["p13388"],
    };
    var limits = {
      skip: 0,
      limit: 2,
    };
    return request(appUrl)
      .get(
        "/api/v3/Datasets/fullquery" +
          "?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body[0].should.have.property("isPublished").and.equal(true);
      });
  });

  it("0160: should fail to fetch non-public dataset anonymously", async () => {
    var fields = {
      ownerGroup: [nonpublictestdataset.ownerGroup],
    };
    var limits = {
      skip: 0,
      limit: 2,
    };
    return request(appUrl)
      .get(
        "/api/v3/Datasets/fullquery" +
          "?fields=" +
          encodeURIComponent(JSON.stringify(fields)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array).and.to.have.length(0);
      });
  });

  it("0170: should fetch one dataset including related data anonymously", async () => {
    var limits = {
      skip: 0,
      limit: 2,
    };
    var filter = {
      where: {
        ownerGroup: "p13388",
      },
      include: [
        {
          relation: "origdatablocks",
        },
        {
          relation: "datablocks",
        },
        {
          relation: "attachments",
        },
      ],
    };

    return request(appUrl)
      .get(
        "/api/v3/Datasets/findOne" +
          "?filter=" +
          encodeURIComponent(JSON.stringify(filter)) +
          "&limits=" +
          encodeURIComponent(JSON.stringify(limits)),
      )
      .set("Accept", "application/json")
      .expect(TestData.SuccessfulGetStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.origdatablocks[0].should.have
          .property("ownerGroup")
          .and.equal("p13388");
      });
  });

  it("0180: should delete this dataset attachment", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pid + "/attachments/" + attachmentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
      .expect(TestData.SuccessfulDeleteStatusCode);
  });

  it("0190: should delete a OrigDatablock", async () => {
    return request(appUrl)
      .delete("/api/v3/OrigDatablocks/" + idOrigDatablock)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("id").and.equal(idOrigDatablock);
      });
  });

  it("0200: should delete the nonpublic dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pidnonpublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });

  it("0210: should delete this dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(TestData.SuccessfulDeleteStatusCode)
      .expect("Content-Type", /json/);
  });
});
