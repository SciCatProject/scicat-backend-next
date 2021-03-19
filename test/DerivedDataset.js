/* jshint node:true */
/* jshint esversion:6 */
"use strict";

// process.env.NODE_ENV = 'test';

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

var accessToken = null;
var accessTokenArchiveManager = null;
var pid = null;

var testderived = {
  "investigator": "egon.meier@web.de",
  "inputDatasets": [
    "/data/input/file1.dat"
  ],
  "usedSoftware": [
    "https://gitlab.psi.ch/ANALYSIS/csaxs/commit/7d5888bfffc440bb613bc7fa50adc0097853446c"
  ],
  "jobParameters": {
    "nscans": 10
  },
  "jobLogData": "Output of log file...",

  "owner": "Egon Meier",
  "ownerEmail": "egon.meier@web.de",
  "contactEmail": "egon.meier@web.de",
  "sourceFolder": "/data/example/2017",
  "creationTime": "2017-01-31T09:20:19.562Z",
  "keywords": [
    "Test", "Derived", "Science", "Math"
  ],
  "description": "Some fancy description",
  "isPublished": false,
  "ownerGroup": "p34123"
};

var app;
before( function(){
  app = require("../server/server");
});

describe("DerivedDatasets", () => {
  before((done) => {
    utils.getToken(app, {
      "username": "ingestor",
      "password": "aman"
    },
    (tokenVal) => {
      accessToken = tokenVal;
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
  it("adds a new derived dataset", function(done) {
    request(app)
      .post("/api/v3/DerivedDatasets?access_token=" + accessToken)
      .send(testderived)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("type").and.equal("derived");
        res.body.should.have.property("pid").and.be.string;
        pid = encodeURIComponent(res.body["pid"]);
        done();
      });
  });

  it("should fetch one derived dataset", function(done) {
    request(app)
      .get("/api/v3/DerivedDatasets/" + pid + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });

  });

  it("should delete a derived dataset", function(done) {
    request(app)
      .delete("/api/v3/DerivedDatasets/" + pid + "?access_token=" + accessTokenArchiveManager)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });


  it("should fetch all derived datasets", function(done) {
    request(app)
      .get("/api/v3/DerivedDatasets?filter=%7B%22limit%22%3A2%7D&access_token=" + accessToken)
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

  it("should contain an array of facets", function(done) {
    request(app)
      .get("/api/v3/DerivedDatasets/fullfacet?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if(err)
          done(err);
        res.body.should.be.an("array");
        done();
      });
  });
});
