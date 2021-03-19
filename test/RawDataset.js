/* eslint-disable no-unused-vars */
"use strict";

// process.env.NODE_ENV = 'test';

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

var accessToken = null;
var pid = null;
var accessProposalToken = null;
var accessTokenArchiveManager = null;

var testproposal = {
  "proposalId": "someprefix/20170266",
  "email": "proposer%40uni.edu",
  "title": "A test proposal",
  "abstract": "Abstract of test proposal",
  "ownerGroup": "p10029"
};

var testraw = {
  "principalInvestigator": "bertram.astor@grumble.com",
  "endTime": "2011-09-14T06:31:25.000Z",
  "creationLocation": "/SU/XQX/RAMJET",
  "dataFormat": "Upchuck pre 2017",
  "scientificMetadata": {
    "beamlineParameters": {
      "Monostripe": "Ru/C",
      "Ring current": {
        "v": 0.402246,
        "u": "A"
      },
      "Beam energy": {
        "v": 22595,
        "u": "eV"
      }
    },
    "detectorParameters": {
      "Objective": 20,
      "Scintillator": "LAG 20um",
      "Exposure time": {
        "v": 0.4,
        "u": "s"
      }
    },
    "scanParameters": {
      "Number of projections": 1801,
      "Rot Y min position": {
        "v": 0,
        "u": "deg"
      },
      "Inner scan flag": 0,
      "File Prefix": "817b_B2_",
      "Sample In": {
        "v": 0,
        "u": "m"
      },
      "Sample folder": "/ramjet/817b_B2_",
      "Number of darks": 10,
      "Rot Y max position": {
        "v": 180,
        "u": "deg"
      },
      "Angular step": {
        "v": 0.1,
        "u": "deg"
      },
      "Number of flats": 120,
      "Sample Out": {
        "v": -0.005,
        "u": "m"
      },
      "Flat frequency": 0,
      "Number of inter-flats": 0
    }
  },
  "owner": "Bertram Astor",
  "ownerEmail": "bertram.astor@grumble.com",
  "orcidOfOwner": "unknown",
  "contactEmail": "bertram.astor@grumble.com",
  "sourceFolder": "/iramjet/tif/",
  "size": 0,
  "creationTime": "2011-09-14T06:08:25.000Z",
  "description": "None",
  "isPublished": false,
  "ownerGroup": "p10029",
  "accessGroups": []
};

var app;
var proposalId = null;

before(function () {
  app = require("../server/server");
});

describe("RawDatasets", () => {
  before((done) => {
    utils.getToken(app, {
      "username": "ingestor",
      "password": "aman"
    },
    (tokenVal) => {
      accessToken = tokenVal;
      utils.getToken(app, {
        "username": "proposalIngestor",
        "password": "aman"
      },
      (tokenVal) => {
        accessProposalToken = tokenVal;
        utils.getToken(app, {
          "username": "archiveManager",
          "password": "aman"
        },
        (tokenVal) => {
          accessTokenArchiveManager = tokenVal;
          done();
        });
      });
    });
  });

  it("adds a new proposal", function (done) {
    request(app)
      .post("/api/v3/Proposals?access_token=" + accessProposalToken)
      .send(testproposal)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("ownerGroup").and.be.string;
        res.body.should.have.property("proposalId").and.be.string;
        proposalId = encodeURIComponent(res.body["proposalId"]);
        done();
      });
  });

  it("adds a new raw dataset", function (done) {
    request(app)
      .post("/api/v3/RawDatasets?access_token=" + accessToken)
      .send(testraw)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("owner").and.be.string;
        res.body.should.have.property("type").and.equal("raw");
        res.body.should.have.property("pid").and.be.string;
        pid = encodeURIComponent(res.body["pid"]);
        done();
      });
  });


  it("should fetch several raw datasets", function (done) {
    request(app)
      .get("/api/v3/RawDatasets?filter=%7B%22limit%22%3A2%7D&access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it("should fetch this raw dataset", function (done) {
    request(app)
      .get("/api/v3/RawDatasets/" + pid + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

  it("should delete this raw dataset", function (done) {
    request(app)
      .delete("/api/v3/RawDatasets/" + pid + "?access_token=" + accessTokenArchiveManager)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });


  it("should contain an array of facets", function (done) {
    request(app)
      .get("/api/v3/RawDatasets/fullfacet?access_token=" + accessToken)
      .set("Accept", "application/json")
      .send({
        "ownerGroup": ["p11114"]
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        res.body.should.be.an("array");
        if (err)
          done(err);
        done();
      });
  });

  it("should delete this proposal", function (done) {
    request(app)
      .delete("/api/v3/Proposals/" + proposalId + "?access_token=" + accessProposalToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

});
