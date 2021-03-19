"use strict";

// process.env.NODE_ENV = 'test';

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("./LoginUtils");

chai.use(chaiHttp);

var accessTokenIngestor = null;
var accessTokenArchiveManager = null;

var pid = null;
var idJob = null;

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
  "description": "The ultimate test",
  "isPublished": false,
  "ownerGroup": "p10029",
  "accessGroups": [],
  "proposalId": "10.540.16635/20110123",
  "keywords": ["sls", "protein"]
};


var testArchiveJob = {
  "emailJobInitiator": "scicatarchivemanger@psi.ch",
  "type": "archive",
  "jobStatusMessage": "jobForwarded",
  "datasetList": [{
    "pid": "dummy",
    "files": []
  }],
  "jobResultObject": {
    "status": "okay",
    "message": "All systems okay"
  }
};


var testRetrieveJob = {
  "emailJobInitiator": "scicatarchivemanger@psi.ch",
  "type": "retrieve",
  "jobStatusMessage": "jobForwarded",
  "datasetList": [{
    "pid": "dummy",
    "files": []
  }],
  "jobResultObject": {
    "status": "okay",
    "message": "All systems okay"
  }
};

var app;
before(function () {
  app = require("../server/server");
});

describe("Test New Job Model", () => {
  before((done) => {
    utils.getToken(app, {
      "username": "ingestor",
      "password": "aman"
    },
    (tokenVal) => {
      accessTokenIngestor = tokenVal;
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

  it("adds a new raw dataset", function (done) {
    request(app)
      .post("/api/v3/RawDatasets?access_token=" + accessTokenIngestor)
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
        // store link to this dataset in datablocks
        var pidtest = res.body["pid"];
        testArchiveJob.datasetList[0].pid = pidtest;
        testRetrieveJob.datasetList[0].pid = pidtest;
        pid = encodeURIComponent(res.body["pid"]);
        done();
      });
  });

  it("Adds a new archive job request", function (done) {
    request(app)
      .post("/api/v3/Jobs?access_token=" + accessTokenIngestor)
      .send(testArchiveJob)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("type").and.be.string;
        idJob = res.body["id"];
        done();
      });
  });

  it("Check if dataset was updated by job request", function (done) {
    request(app)
      .get("/api/v3/Datasets/" + pid + "?access_token=" + accessTokenIngestor)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err)
          return done(err);
        res.body.should.have.nested.property("datasetlifecycle.archiveStatusMessage").and.equal("scheduledForArchiving");
        res.body.should.have.nested.property("datasetlifecycle.publishable").and.equal(false);
        done();
      });
  });


  it("Create retrieve job request on same dataset, which should fail as well because not yet retrievable", function (done) {
    request(app)
      .post("/api/v3/Jobs?access_token=" + accessTokenIngestor)
      .send(testRetrieveJob)
      .set("Accept", "application/json")
      .expect(409)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        res.body.should.have.property("error");
        done();
      });
  });

  it("Send an update status to the dataset, simulating the archive system response", function (done) {
    request(app)
      .put("/api/v3/Datasets/" + pid + "?access_token=" + accessTokenArchiveManager)
      .send({
        "datasetlifecycle": {
          "retrievable": true,
          "archiveStatusMessage": "datasetOnArchiveDisk"
        },
      })
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err)
          return done(err);
        res.body.should.have.nested.property("datasetlifecycle.retrievable").and.equal(true);
        res.body.should.have.nested.property("datasetlifecycle.publishable").and.equal(false);
        done();
      });
  });
  // change policy to suppress emails

  it("Disable notification bt email", function (done) {
    request(app)
      .post("/api/v3/Policies/updatewhere?access_token=" + accessTokenIngestor)
      .send({
        ownerGroupList: "p10029",
        data: {
          archiveEmailNotification: false
        }
      })
      .set("Accept", "application/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .expect(200)
      .end(function (err, res) {
        if (err)
          return done(err);
        console.log("Result policy update:",res.body);
        done();
      });
  });




  it("Send an update status to the archive job request, signal successful archiving", function (done) {
    request(app)
      .put("/api/v3/Jobs/" + idJob + "?access_token=" + accessTokenArchiveManager)
      .send({
        "jobStatusMessage": "finishedSuccessful",
        "jobResultObject": {
          "status": "okay",
          "message": "Archive job was finished successfully"
        }
      })
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, _res) {
        if (err)
          return done(err);
        done();
      });
  });


  it("Adds a new archive job request for same data which should fail", function (done) {
    request(app)
      .post("/api/v3/Jobs?access_token=" + accessTokenIngestor)
      .send(testArchiveJob)
      .set("Accept", "application/json")
      .expect(409)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        res.body.should.have.property("error");
        done();
      });
  });

  it("Adds a new retrieve job request on same dataset, which should  succeed now", function (done) {
    request(app)
      .post("/api/v3/Jobs?access_token=" + accessTokenIngestor)
      .send(testRetrieveJob)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        res.body.should.have.property("id");
        done();
      });
  });

  it("Send an update status to the dataset", function (done) {
    request(app)
      .put("/api/v3/Datasets/" + pid + "?access_token=" + accessTokenArchiveManager)
      .send({
        "datasetlifecycle": {
          "archiveReturnMessage": {
            "text": "This is the result of the archiving process test message"
          },
          "retrieveReturnMessage": {
            "text": "Some dummy retrieve message"
          },
        },
      })
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err)
          return done(err);
        res.body.should.have.nested.property("datasetlifecycle.archiveReturnMessage");
        done();
      });
  });


  it("Send an update status message to the Job", function (done) {
    request(app)
      .put("/api/v3/Jobs/" + idJob + "?access_token=" + accessTokenIngestor)
      .send({
        "jobStatusMessage": "finishedUnsuccessful",
        "jobResultObject": {
          "status": "bad",
          "message": "System A failed"
        }

      })
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("jobResultObject");
        done();
      });
  });



  it("Send an update status message to the Job", function (done) {
    request(app)
      .put("/api/v3/Jobs/" + idJob + "?access_token=" + accessTokenIngestor)
      .send({
        "jobStatusMessage": "finishedSuccessful",
        "jobResultObject": {
          "status": "okay",
          "message": "Job archiving worked"
        }
      })
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("jobStatusMessage").and.be.string;
        done();
      });
  });

  it("should delete the Job", function (done) {
    request(app)
      .delete("/api/v3/Jobs/" + idJob + "?access_token=" + accessTokenArchiveManager)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, _res) => {
        if (err)
          return done(err);
        done();
      });
  });

  it("should delete the newly created dataset", function (done) {
    request(app)
      .delete("/api/v3/Datasets/" + pid + "?access_token=" + accessTokenArchiveManager)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, _res) => {
        if (err)
          return done(err);
        done();
      });
  });

});
