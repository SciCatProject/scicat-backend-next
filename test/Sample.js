"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const utils = require("./LoginUtils");

chai.use(chaiHttp);

let accessToken = null,
  defaultSampleId = null,
  sampleId = null,
  attachmentId = null;

const testSample = {
  owner: "string",
  description: "string",
  createdAt: new Date(),
  sampleCharacteristics: {},
  ownerGroup: "string",
  accessGroups: ["string"],
  createdBy: "string",
  updatedBy: "string",
  updatedAt: new Date(),
};

const app = "http://localhost:3000";

describe("Simple Sample tests", () => {
  beforeEach((done) => {
    utils.getToken(
      app,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessToken = tokenVal;
        done();
      },
    );
  });

  it("adds a new sample", async () => {
    return request(app)
      .post("/api/v3/Samples")
      .send(testSample)
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
      .expect("Content-Type", /json/);
  });

  it("should add a new attachment to this sample", async () => {
    const testAttachment = {
      thumbnail: "data/abc123",
      caption: "Some caption",
      sampleId: defaultSampleId,
      ownerGroup: "ess",
      accessGroups: ["loki", "odin"],
      createdBy: "Bertram Astor",
      updatedBy: "anonymous",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return request(app)
      .post("/api/v3/Samples/" + sampleId + "/attachments")
      .send(testAttachment)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(201)
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
        res.body.should.have.property("id").and.be.string;
        res.body.should.have
          .property("sampleId")
          .and.equal(testAttachment.sampleId);
        attachmentId = encodeURIComponent(res.body["id"]);
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

  it("should delete this sample", async () => {
    return request(app)
      .delete("/api/v3/Samples/" + sampleId)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
