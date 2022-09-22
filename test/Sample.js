"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const utils = require("./LoginUtils");

const { TestData } = require("./TestData");

chai.use(chaiHttp);

let accessToken = null,
  accessTokenArchiveManager = null,
  defaultSampleId = null,
  sampleId = null,
  attachmentId = null,
  datasetId = null;

const app = "http://localhost:3000";

describe("Simple Sample", () => {
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

  it("adds a new sample", async () => {
    return request(app)
      .post("/api/v3/Samples")
      .send(TestData.SampleCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
        defaultSampleId = res.body["sampleId"];
        sampleId = encodeURIComponent(res.body["sampleId"]);
      });
  });

  it("should fetch this new sample", async () => {
    return request(app)
      .get("/api/v3/Samples/" + sampleId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("sampleId").and.be.string;
      });
  });

  it("should add a new attachment to this sample", async () => {
    return request(app)
      .post("/api/v3/Samples/" + sampleId + "/attachments")
      .send(TestData.AttachmentCorrect)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("thumbnail")
          .and.equal(TestData.AttachmentCorrect.thumbnail);
        res.body.should.have
          .property("caption")
          .and.equal(TestData.AttachmentCorrect.caption);
        res.body.should.have
          .property("ownerGroup")
          .and.equal(TestData.AttachmentCorrect.ownerGroup);
        res.body.should.have.property("accessGroups");
        res.body.should.have.property("createdBy");
        res.body.should.have.property("updatedBy").and.be.string;
        res.body.should.have.property("id").and.be.string;
        res.body.should.have.property("sampleId").and.equal(sampleId);
        attachmentId = encodeURIComponent(res.body["id"]);
      });
  });

  it("should fetch all attachments of this sample", async () => {
    return request(app)
      .get("/api/v3/Samples/" + sampleId + "/attachments/")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
      });
  });

  // NOTE: Not sure if this one is still needed because this endpoint is not present in the swagger documentation. We are not able to fetch specific attachment under samples.
  it("should fetch this sample attachment", async () => {
    return request(app)
      .get("/api/v3/Samples/" + sampleId + "/attachments/" + attachmentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });

  it("should delete this sample attachment", async () => {
    return request(app)
      .delete("/api/v3/Samples/" + sampleId + "/attachments/" + attachmentId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200);
  });

  it("should return no datasets", async () => {
    return request(app)
      .get("/api/v3/Samples/" + sampleId + "/datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
        res.body.length.should.be.equal(0);
      });
  });

  it("insert dataset using this sample", async () => {
    let dataset = TestData.RawCorrect;
    dataset.sampleId = sampleId;
    return request(app)
      .post("/api/v3/Datasets")
      .send(dataset)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        datasetId = encodeURIComponent(res.body["pid"]);
      });
  });

  it("should retrieve dataset for sample", async () => {
    return request(app)
      .get("/api/v3/Samples/" + sampleId + "/datasets")
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.be.instanceof(Array);
        res.body.length.should.be.equal(1);
        res.body[0].pid.should.be.equal(datasetId);
      });
  });

  it("should delete the dataset linked to sample", function (done) {
    request(app)
      .delete("/api/v3/Datasets/" + datasetId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should delete this sample", async () => {
    return request(app)
      .delete("/api/v3/Samples/" + sampleId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
