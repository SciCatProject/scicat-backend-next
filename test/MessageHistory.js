/* jshint node:true */
/* jshint esversion:6 */
"use strict";

// process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require('supertest');
var should = chai.should();
var utils = require("./LoginUtils");

var accessTokenIngestor = null;
var accessTokenArchiveManager = null;
var accessTokenUser = null;

var pid = null;
var pid2 = null;
var idDatasetLifecycle = null;
var idDatasetLifecycle2 = null;
var idJob = null;

var testraw = {
    principalInvestigator: "bertram.astor@grumble.com",
    endTime: "2011-09-14T06:31:25.000Z",
    creationLocation: "/SU/XQX/RAMJET",
    dataFormat: "Upchuck pre 2017",
    scientificMetadata: {
        beamlineParameters: {
            Monostripe: "Ru/C",
            "Ring current": {
                v: 0.402246,
                u: "A"
            },
            "Beam energy": {
                v: 22595,
                u: "eV"
            }
        },
        detectorParameters: {
            Objective: 20,
            Scintillator: "LAG 20um",
            "Exposure time": {
                v: 0.4,
                u: "s"
            }
        },
        scanParameters: {
            "Number of projections": 1801,
            "Rot Y min position": {
                v: 0,
                u: "deg"
            },
            "Inner scan flag": 0,
            "File Prefix": "817b_B2_",
            "Sample In": {
                v: 0,
                u: "m"
            },
            "Sample folder": "/ramjet/817b_B2_",
            "Number of darks": 10,
            "Rot Y max position": {
                v: 180,
                u: "deg"
            },
            "Angular step": {
                v: 0.1,
                u: "deg"
            },
            "Number of flats": 120,
            "Sample Out": {
                v: -0.005,
                u: "m"
            },
            "Flat frequency": 0,
            "Number of inter-flats": 0
        }
    },
    owner: "Bertram Astor",
    ownerEmail: "bertram.astor@grumble.com",
    orcidOfOwner: "unknown",
    contactEmail: "bertram.astor@grumble.com",
    sourceFolder: "/iramjet/tif/",
    size: 0,
    creationTime: "2011-09-14T06:08:25.000Z",
    description: "The ultimate test",
    doi: "not yet defined",
    isPublished: false,
    ownerGroup: "p10029",
    accessGroups: [],
    proposalId: "10.540.16635/20110123",
    keywords: ["sls", "protein"]
};

var testDatasetLifecycle = {
    id: "", // must be set to the id of the dataset,
    // the following 4 fields become obsolete in future
    "isOnDisk": true,
    "isOnTape": false,
    "archiveStatusMessage": "datasetCreated",
    "retrieveStatusMessage": "",
    "isExported": false,
    "archivable": true,
    "retrievable": true,
    "MessageHistory": [{
        "shortMessage": "datasetCreated",
        "sender": "scicatarchivemanager@psi.ch",
        "payload": {
            "text": "Nothing special to report"
        }
    }]
};

//TODO test to retrieve datasets where you are NOT the owner

var testArchiveJob = {
    "emailJobInitiator": "scicatarchivemanger@psi.ch",
    "type": "archive",
    "jobStatusMessage": "jobForwarded",
    "datasetList": [{
        "pid": "dummy",
        "files": []
    }],
    "archiveReturnMessage": "will move to messageList",
    "MessageHistory": []
}


var testRetrieveJob = {
    "emailJobInitiator": "scicatarchivemanger@psi.ch",
    "type": "retrieve",
    "jobStatusMessage": "jobForwarded",
    "datasetList": [{
        "pid": "dummy",
        "files": []
    }],
    "archiveReturnMessage": "will move to messageList",
    "MessageHistory": []
}

var newMessage = {
    "shortMessage": "JustAnExample",
    "sender": "ingestor",
    "payload": {
        "text": "whatever"
    }
};

var app
before(function() {
    app = require('../server/server')
});

describe('Test MessageHistory in jobs', () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'ingestor',
                'password': 'aman'
            },
            tokenVal => {
                accessTokenIngestor = tokenVal;
                utils.getToken(app, {
                        'username': 'archiveManager',
                        'password': 'aman'
                    },
                    (tokenVal) => {
                        accessTokenArchiveManager = tokenVal;
                        done();
                    });
            });
    });

    it("adds a new raw dataset", function(done) {
        request(app)
            .post("/api/v2/RawDatasets?access_token=" + accessTokenIngestor)
            .send(testraw)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.have.property("owner").and.be.string;
                res.body.should.have.property("type").and.equal("raw");
                res.body.should.have.property("pid").and.be.string;
                // store link to this dataset in datablocks
                var pidtest = res.body['pid']
                testDatasetLifecycle.id = pidtest
                testDatasetLifecycle.datasetId = pidtest
                testArchiveJob.datasetList[0].pid = pidtest
                testRetrieveJob.datasetList[0].pid = pidtest
                pid = encodeURIComponent(res.body['pid']);
                done();
            });
    });

    it("adds a new DatasetLifecycle including messageHistory", function(done) {
        request(app)
            .post(
                "/api/v2/DatasetLifecycles?access_token=" + accessTokenIngestor
            )
            .send(testDatasetLifecycle)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) return done(err);
                idDatasetLifecycle = encodeURIComponent(res.body["id"]);
                done();
            });
    });

    it("Adds a new message to Datasetlifecycle MessageHistory", function(done) {
        request(app)
            .post(
                "/api/v2/DatasetLifecycles/" +
                    idDatasetLifecycle +
                    "/messageHistory?access_token=" +
                    accessTokenIngestor
            )
            .send(newMessage)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

    it("Check if message was added", function(done) {
        request(app)
            .get(
                "/api/v2/DatasetLifecycles/" +
                    idDatasetLifecycle +
                    "?access_token=" +
                    accessTokenIngestor
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) return done(err);
                // console.log("Lifecycle with new message:", res.body)
                done();
            });
    });


    it('Adds a new archive job request', function(done) {
        request(app)
            .post('/api/v2/Jobs?access_token=' + accessTokenIngestor)
            .send(testArchiveJob)
            .set('Accept', 'application/json')
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('type').and.be.string;
                idJob = res.body['id']
                //console.log("Jobid:", idJob)
                done();
            });
    });

    it('Adds a new archive job request for same data which should fail', function(done) {
        request(app)
            .post('/api/v2/Jobs?access_token=' + accessTokenIngestor)
            .send(testArchiveJob)
            .set('Accept', 'application/json')
            .expect(409)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                res.body.should.have.property('error');
                done();
            });
    });

    it('Adds a new retrieve job request on same dataset, which should fail as well because not yet retrievable', function(done) {
        request(app)
            .post('/api/v2/Jobs?access_token=' + accessTokenIngestor)
            .send(testRetrieveJob)
            .set('Accept', 'application/json')
            .expect(409)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                res.body.should.have.property('error');
                done();
            });
    });

    it("Adds a new message to Jobs MessageHistory", function(done) {
        request(app)
            .post(
                "/api/v2/DatasetLifecycles/" +
                    idDatasetLifecycle +
                    "/messageHistory?access_token=" +
                    accessTokenIngestor
            )
            .send(newMessage)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                //console.log(res.body)
                done();
            });
    });


    it('should delete the Job', function(done) {
        request(app)
            .delete('/api/v2/Jobs/' + idJob + '?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it('should delete the DatasetLifecycle', function(done) {
        request(app)
            .delete(
                "/api/v2/Jobs/" + idJob + "?access_token=" + accessTokenIngestor
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it("should delete the DatasetLifecycle", function(done) {
        request(app)
            .delete(
                "/api/v2/DatasetLifecycles/" +
                    idDatasetLifecycle +
                    "?access_token=" +
                    accessTokenIngestor
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it("should delete the newly created dataset", function(done) {
        request(app)
            .delete(
                "/api/v2/Datasets/" +
                    pid +
                    "?access_token=" +
                    accessTokenIngestor
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
});
