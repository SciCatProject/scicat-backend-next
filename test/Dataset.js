"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const utils = require("./LoginUtils");

chai.use(chaiHttp);

const app = "http://localhost:3000";

var accessTokenArchiveManager = null;
let accessToken = null,
  defaultPid = null,
  pid = null,
  attachmentId = null;

const testdataset = {
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
  ownerGroup: "p13388",
  accessGroups: [],
  datasetName: "Example Data86",
  history: ["this should be deleted"],
  createdBy: "this should be deleted as well",
};

describe("Simple Dataset tests", () => {
  beforeEach((done) => {
    utils.getToken(
      app,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessToken = tokenVal;
        utils.getToken(
          app,
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

  it("adds a new dataset", async () => {
    return request(app)
      .post("/api/v3/Datasets")
      .send(testdataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("version").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        res.body.should.have.property("datasetName").and.be.string;
        defaultPid = res.body["pid"];
        pid = encodeURIComponent(res.body["pid"]);
      });
  });

  it("should fetch this new dataset", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should fail fetching this new dataset", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .expect(403)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("error");
        res.body.error.should.have.property("statusCode").and.equal(403);
        res.body.error.should.have.property("name").and.equal("Error");
        res.body.error.should.have
          .property("message")
          .and.equal("Dataset is not public");
      });
  });

  it("should add a new attachment to this dataset", async () => {
    const testAttachment = {
      thumbnail: "data/abc123",
      caption: "Some caption",
      datasetId: defaultPid,
      ownerGroup: "ess",
      accessGroups: ["loki", "odin"],
      createdBy: "Bertram Astor",
      updatedBy: "anonymous",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return request(app)
      .post("/api/v3/Datasets/" + pid + "/attachments")
      .send(testAttachment)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
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
        attachmentId = encodeURIComponent(res.body["id"]);
      });
  });

  it("should fetch this dataset attachment", async () => {
    return request(app)
      .get("/api/v3/Datasets/" + pid + "/attachments/" + attachmentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete this dataset attachment", async () => {
    return request(app)
      .delete("/api/v3/Datasets/" + pid + "/attachments/" + attachmentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(204);
  });

  it("fetches Datasets filtered by datasetName", async () => {
    let filter = JSON.stringify({ where: { datasetName: "Example Data86" } });
    return request(app)
      .get("/api/v3/Datasets?filter=" + encodeURIComponent(filter))
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
        res.body[0].should.have
          .property("datasetName")
          .and.equal("Example Data86");
      });
  });

  it("should delete this dataset", async () => {
    return request(app)
      .delete("/api/v3/Datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("fetches array of Datasets", async () => {
    return request(app)
      .get("/api/v3/Datasets?filter=%7B%22limit%22%3A10%7D")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  it("should contain an array of facets", async () => {
    return request(app)
      .get("/api/v3/Datasets/fullfacet")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array");
      });
  });

  it("should fetch a filtered array of datasets", async () => {
    const query = JSON.stringify({ isPublished: false, text: "test" });
    const limits = JSON.stringify({
      skip: 0,
      limit: 3,
      order: "datasetName:desc",
    });
    return request(app)
      .get("/api/v3/Datasets/fullquery?fields=" + query + "&limits=" + limits)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.an("array");
      });
  });

  it("should fail creating a dataset with non unique techniques", async () => {
    const ds = Object.keys(testdataset).reduce(
      (o, k) => ((o[k] = testdataset[k]), o),
      {},
    );
    ds["techniques"] = [
      { pid: "1", name: "a" },
      { pid: "1", name: "a" },
    ];
    return request(app)
      .post("/api/v3/Datasets")
      .send(ds)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(422)
      .expect("Content-Type", /json/)
      .then((res) => {
        const errorDetails = JSON.parse(res.error.text).error.details;
        errorDetails.messages.techniques.should.be.eql([
          "contains duplicate `pid`",
        ]);
        errorDetails.codes.techniques.should.be.eql(["efficientUniqueness"]);
      });
  });
});
