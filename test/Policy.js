/* jshint node:true */
/* jshint esversion:6 */
"use strict";

// process.env.NODE_ENV = 'test';

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

var accessTokenArchiveManager = null;
var accessToken = null,
  id = null;

var testdataset = {
  "manager": [
    "ingestor"
  ],
  "tapeRedundancy": "low",
  //"tapeRetentionTime": 3,
  "autoArchiveDelay": 7,
  "archiveEmailNotification": false,
  "archiveEmailsToBeNotified": [],
  "retrieveEmailNotification": false,
  "retrieveEmailsToBeNotified": [],
  "ownerGroup": "p10021",
  "accessGroups": []
};

var app;
before( function(){
  app = require("../server/server");
});

describe("Simple Policy tests", () => {
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

  it("adds a new policy", function(done) {
    request(app)
      .post("/api/v3/Policies?access_token=" + accessToken)
      .send(testdataset)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("manager").and.be.string;
        res.body.should.have.property("ownerGroup").and.be.string;
        id = encodeURIComponent(res.body["id"]);
        done();
      });
  });

  it("should fetch this new policy", function(done) {
    request(app)
      .get("/api/v3/Policies/" + id + "?access_token=" + accessToken)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        done();
      });
  });

  it("updates this existing policy", function(done) {
    request(app)
      .post("/api/v3/Policies/updateWhere?access_token=" + accessToken)
      .send("ownerGroupList=\"p10021\"&data={\"autoArchive\":true}")
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        if (err)
          return done(err);
        done();
      });
  });

  it("should delete this policy", function(done) {
    request(app)
      .delete("/api/v3/Policies/" + id + "?access_token=" + accessTokenArchiveManager)
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
