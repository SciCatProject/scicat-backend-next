/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const nock = require("nock");
const { TestData } = require("./TestData");
const sandbox = require("sinon").createSandbox();

var accessTokenArchiveManager = null;
var idOrigDatablock = null;
let accessToken = null,
  defaultPid = null,
  pid = null,
  pidnonpublic = null,
  attachmentId = null,
  doi = null;

const testPublishedData = {
  creator: ["ESS"],
  publisher: "ESS",
  publicationYear: 2020,
  title: "dd",
  url: "",
  abstract: "dd",
  dataDescription: "dd",
  resourceType: "raw",
  numberOfFiles: 1,
  sizeOfArchive: 1,
  pidArray: [],
  status: "pending_registration",
};

const modifiedPublishedData = {
  publisher: "PSI",
  abstract: "a new abstract",
};

// const testdataset = {
//   owner: "Bertram Astor",
//   ownerEmail: "bertram.astor@grumble.com",
//   orcidOfOwner: "unknown",
//   contactEmail: "bertram.astor@grumble.com",
//   sourceFolder: "/iramjet/tif/",
//   creationTime: "2011-09-14T06:08:25.000Z",
//   keywords: ["Cryo", "Calibration"],
//   description: "None",
//   type: "raw",
//   license: "CC BY-SA 4.0",
//   isPublished: true,
//   size: 10,
//   ownerGroup: "p13388",
//   accessGroups: [],
// };

const nonpublictestdataset = {
  owner: "Bertram Astor",
  ownerEmail: "bertram.astor@grumble.com",
  orcidOfOwner: "unknown",
  contactEmail: "bertram.astor@grumble.com",
  sourceFolder: "/iramjet/tif/",
  creationTime: "2011-09-14T06:08:25.000Z",
  keywords: ["Cryo", "Calibration"],
  description: "None",
  type: "raw",
  license: "CC BY-SA 4.0",
  isPublished: false,
  ownerGroup: "examplenonpublicgroup",
  accessGroups: [],
};

var testorigDataBlock = {
  size: 41780189,
  dataFileList: [
    {
      path: "N1039__B410489.tif",
      size: 8356037,
      time: "2017-07-24T13:56:30.000Z",
      uid: "egon.meiera@psi.ch",
      gid: "p16738",
      perm: "-rw-rw-r--",
    },
    {
      path: "N1039__B410613.tif",
      size: 8356038,
      time: "2017-07-24T13:56:35.000Z",
      uid: "egon.meiera@psi.ch",
      gid: "p16738",
      perm: "-rw-rw-r--",
    },
    {
      path: "N1039__B410729.tif",
      size: 8356038,
      time: "2017-07-24T13:56:41.000Z",
      uid: "egon.meiera@psi.ch",
      gid: "p16738",
      perm: "-rw-rw-r--",
    },
    {
      path: "N1039__B410200.tif",
      size: 8356038,
      time: "2017-07-24T13:56:18.000Z",
      uid: "egon.meiera@psi.ch",
      gid: "p16738",
      perm: "-rw-rw-r--",
    },
    {
      path: "N1039__B410377.tif",
      size: 8356038,
      time: "2017-07-24T13:56:25.000Z",
      uid: "egon.meiera@psi.ch",
      gid: "p16738",
      perm: "-rw-rw-r--",
    },
  ],
};

describe("PublishedData: Test of access to published data", () => {
  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessToken = tokenVal;
        utils.getToken(
          appUrl,
          {
            username: "archiveManager",
            password: "aman",
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

  it("adds a published data", async () => {
    return request(appUrl)
      .post("/api/v3/PublishedData")
      .send(testPublishedData)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("publisher").and.be.string;
        doi = res.body["doi"];
      });
  });

  it("should fetch this new published data", async () => {
    return request(appUrl)
      .get("/api/v3/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("publisher").and.equal("ESS");
        res.body.should.have
          .property("status")
          .and.equal("pending_registration");
      });
  });

  // NOTE: This is added because we need dataset for registering published data
  it("adds a new raw dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send({ ...TestData.RawCorrect, isPublished: true })
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        // store link to this dataset in datablocks
        pid = res.body["pid"];
        testPublishedData.pidArray.push(pid);
      });
  });

  // it("should register this new published data", async () => {
  //   nock(appUrl, {
  //     reqheaders: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   })
  //     .post("/api/v3/PublishedData/" + doi + "/register")
  //     .reply(200);
  // });

  it("should register this new published data", async () => {
    return request(appUrl)
      .post("/api/v3/PublishedData/" + doi + "/register")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should fetch this new published data", async () => {
    return request(appUrl)
      .get("/api/v3/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("status").and.equal("registered");
      });
  });

  // TODO: Double-check this one
  // it("should resync this new published data", async (done) => {
  //   return request(appUrl)
  //     .post("/api/v3/PublishedData/" + doi + "/resync")
  //     .send(modifiedPublishedData)
  //     .set({ Authorization: `Bearer ${accessToken}` })
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

  // it("should resync this new published data", async () => {
  //   nock("http://127.0.0.1:3000", {
  //     reqheaders: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   })
  //     .post("/api/v3/PublishedData/" + doi + "/resync", {
  //       data: modifiedPublishedData,
  //     })
  //     .reply(200);
  // });

  // it("should fetch this new published data", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/PublishedData/" + doi)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessToken}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/);
  // });

  // it("adds a new dataset", async () => {
  //   return (
  //     request(appUrl)
  //       .post("/api/v3/Datasets")
  //       .send(testdataset)
  //       .set("Accept", "application/json")
  //       .set({ Authorization: `Bearer ${accessToken}` })
  //       // .expect(200)
  //       .expect("Content-Type", /json/)
  //       .then((res) => {
  //         console.log(res.body);
  //         res.body.should.have.property("version").and.be.string;
  //         res.body.should.have.property("type").and.equal("raw");
  //         res.body.should.have.property("pid").and.be.string;
  //         res.body.should.have.property("datasetName").and.be.string;
  //         //res.body.should.not.have.property('history')
  //         defaultPid = res.body["pid"];
  //         pid = encodeURIComponent(res.body["pid"]);
  //         testorigDataBlock.datasetId = res.body["pid"];
  //       })
  //   );
  // });

  it("adds a new nonpublic dataset", async () => {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.RawCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("isPublished").and.equal(false);
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("datasetName").and.be.string;
        pidnonpublic = res.body["pid"];
      });
  });

  // NOTE: Missing endpoint
  // it("should create one publisheddata to dataset relation", async () => {
  //   return request(appUrl)
  //     .put("/api/v3/PublishedData/" + doi + "/datasets/rel/" + pid)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessToken}` })
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

  it("should delete this published data", async () => {
    return request(appUrl)
      .delete("/api/v3/PublishedData/" + doi)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should fetch this new dataset", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("isPublished").and.equal(true);
      });
  });

  it("should fetch the non public dataset as ingestor", async () => {
    return request(appUrl)
      .get("/api/v3/Datasets/" + pidnonpublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("isPublished").and.equal(false);
      });
  });

  // it("adds a new origDatablock", async () => {
  //   return request(appUrl)
  //     .post("/api/v3/OrigDatablocks")
  //     .send(testorigDataBlock)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessToken}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("size").and.equal(41780189);
  //       res.body.should.have.property("id").and.be.string;
  //       idOrigDatablock = encodeURIComponent(res.body["id"]);
  //     });
  // });

  // it("should add a new attachment to this dataset", async () => {
  //   const testAttachment = {
  //     thumbnail: "data/abc123",
  //     caption: "Some caption",
  //     datasetId: defaultPid,
  //     ownerGroup: "ess",
  //     accessGroups: ["loki", "odin"],
  //     createdBy: "Bertram Astor",
  //     updatedBy: "anonymous",
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };
  //   return request(appUrl)
  //     .post("/api/v3/Datasets/" + pid + "/attachments")
  //     .send(testAttachment)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessToken}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have
  //         .property("thumbnail")
  //         .and.equal(testAttachment.thumbnail);
  //       res.body.should.have
  //         .property("caption")
  //         .and.equal(testAttachment.caption);
  //       res.body.should.have
  //         .property("ownerGroup")
  //         .and.equal(testAttachment.ownerGroup);
  //       res.body.should.have.property("accessGroups");
  //       res.body.should.have.property("createdBy");
  //       res.body.should.have.property("updatedBy").and.be.string;
  //       res.body.should.have.property("createdAt");
  //       res.body.should.have.property("id").and.be.string;
  //       res.body.should.have
  //         .property("datasetId")
  //         .and.equal(testAttachment.datasetId);
  //       attachmentId = encodeURIComponent(res.body["id"]);
  //     });
  // });

  // it("should fetch this dataset attachment", async () => {
  //   return request(appUrl)
  //     .get("/api/v3/Datasets/" + pid + "/attachments/" + attachmentId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessToken}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/);
  // });

  // it("should fetch some published datasets anonymously", async () => {
  //   var fields = {
  //     ownerGroup: ["p13388"],
  //   };
  //   var limits = {
  //     skip: 0,
  //     limit: 2,
  //   };
  //   return request(appUrl)
  //     .get("/api/v3/Datasets/fullquery" + "?fields=" + encodeURIComponent(JSON.stringify(fields)) + "&limits=" + encodeURIComponent(JSON.stringify(limits)))
  //     .set("Accept", "application/json")
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body[0].should.have.property("isPublished").and.equal(true);
  //     });
  // });

  // it("should fail to fetch non-public dataset anonymously", async () => {
  //   var fields = {
  //     ownerGroup: ["examplenonpublicgroup"],
  //   };
  //   var limits = {
  //     skip: 0,
  //     limit: 2,
  //   };
  //   return request(appUrl)
  //     .get("/api/v3/Datasets/fullquery" + "?fields=" + encodeURIComponent(JSON.stringify(fields)) + "&limits=" + encodeURIComponent(JSON.stringify(limits)))
  //     .set("Accept", "application/json")
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.be.instanceof(Array).and.to.have.length(0);
  //     });
  // });

  // it("should fetch one dataset including related data anonymously", async () => {
  //   var limits = {
  //     skip: 0,
  //     limit: 2,
  //   };
  //   var filter = {
  //     where: {
  //       ownerGroup: "p13388",
  //     },
  //     include: [
  //       {
  //         relation: "origdatablocks",
  //       },
  //       {
  //         relation: "datablocks",
  //       },
  //       {
  //         relation: "attachments",
  //       },
  //     ],
  //   };

  //   return request(appUrl)
  //     .get("/api/v3/Datasets/findOne" + "?filter=" + encodeURIComponent(JSON.stringify(filter)) + "&limits=" + encodeURIComponent(JSON.stringify(limits)))
  //     .set("Accept", "application/json")
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.origdatablocks[0].should.have
  //         .property("ownerGroup")
  //         .and.equal("p13388");
  //     });
  // });

  // it("should delete this dataset attachment", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/Datasets/" + pid + "/attachments/" + attachmentId)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessToken}` })
  //     .expect(204);
  // });

  // it("should delete a OrigDatablock", async () => {
  //   return request(appUrl)
  //     .delete("/api/v3/OrigDatablocks/" + idOrigDatablock)
  //     .set("Accept", "application/json")
  //     .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
  //     .expect(200)
  //     .expect("Content-Type", /json/)
  //     .then((res) => {
  //       res.body.should.have.property("count").and.equal(1);
  //     });
  // });

  it("should delete the nonpublic dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pidnonpublic)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete this dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
