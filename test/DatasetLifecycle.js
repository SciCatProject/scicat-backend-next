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
    "id": "", // must be set to the id of the dataset,
    "isOnDisk": true,
    "isOnTape": false,
    "archiveStatusMessage": "datasetCreated",
    "retrieveStatusMessage": "",
    "isExported": false,
    "archivable":true,
    "retrievable":true,
    "publishable":false
}

var app
before( function(){
    app = require('../server/server')
});

describe('Test DatasetLifecycle and the relation to Datasets', () => {
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


    it('adds a new raw dataset', function(done) {
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
                testDatasetLifecycle.id = res.body["pid"];
                testDatasetLifecycle.datasetId = res.body["pid"];
                pid = encodeURIComponent(res.body["pid"]);
                done();
            });
    });

    it("adds a new DatasetLifecycle", function(done) {
        request(app)
            .post(
                "/api/v2/DatasetLifecycles?access_token=" + accessTokenIngestor
            )
            .send(testDatasetLifecycle)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                idDatasetLifecycle = encodeURIComponent(res.body['id']);
                request(app)
                    .get('/api/v2/Datasets/'+pid + '?access_token=' + accessTokenIngestor)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        if (err)
                            return done(err);
                        res.body.should.have.property('archivable').and.equal(true);
                        res.body.should.have.property('retrievable').and.equal(true);
                        res.body.should.have.property('publishable').and.equal(false);
                        done();
                    });
            });
    });

    it("adds another new raw dataset", function(done) {
        // modify owner
        testraw.ownerGroup = "p12345";
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
                testDatasetLifecycle.id = res.body["pid"];
                testDatasetLifecycle.datasetId = res.body["pid"];
                pid2 = encodeURIComponent(res.body["pid"]);
                done();
            });
    });

    it("adds a corresponding new DatasetLifecycle", function(done) {
        testDatasetLifecycle.archiveStatusMessage = "some other message";
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
                idDatasetLifecycle2 = encodeURIComponent(res.body["id"]);
                done();
            });
    });

    // TODO add test for raw and derived dataset queries as well

    it("Should return datasets with complex join query fulfilled", function(done) {
        var fields = {
            ownerGroup: ["p12345", "p10029"],
            text: '"ultimate test"',
            creationTime: {
                begin: "2011-09-13",
                end: "2011-09-15"
            },
            archiveStatusMessage: "datasetCreated",
            keywords: ["energy", "protein"]
        };

        request(app)
            .get(
                "/api/v2/Datasets/fullquery?fields=" +
                    encodeURIComponent(JSON.stringify(fields)) +
                    "&access_token=" +
                    accessTokenIngestor
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.be.an("array").that.is.not.empty;
                res.body[0]["datasetlifecycle"].should.have
                    .property("archiveStatusMessage")
                    .and.equal("datasetCreated");
                done();
            });
    });

    it("Should return datasets with ordered results", function(done) {
        var fields = {
            ownerGroup: ["p12345", "p10029"]
        };
        var limits = {
            order: "creationTime:desc",
            skip: 0
        };

        request(app)
            .get(
                "/api/v2/Datasets/fullquery?fields=" +
                    encodeURIComponent(JSON.stringify(fields)) +
                    "&limits=" +
                    encodeURIComponent(JSON.stringify(limits)) +
                    "&access_token=" +
                    accessTokenIngestor
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.be.instanceof(Array);
                done();
            });
    });

    it("Should return no datasets, because number of hits exhausted", function(done) {
        var fields = {
            ownerGroup: ["p12345"],
            archiveStatusMessage: "datasetCreated"
        };
        var limits = {
            skip: 10
        };

        request(app)
            .get(
                "/api/v2/Datasets/fullquery?fields=" +
                    encodeURIComponent(JSON.stringify(fields)) +
                    "&limits=" +
                    encodeURIComponent(JSON.stringify(limits)) +
                    "&access_token=" +
                    accessTokenIngestor
            )
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.be.an("array").that.is.empty;
                done();
            });
    });

    it("Should return facets with complex join query fulfilled", function(done) {
        var fields = {
            ownerGroup: ["p12345", "p10029"],
            text: '"ultimate test"',
            creationTime: {
                begin: "2011-09-13",
                end: "2011-09-15"
            },
            keywords: ["energy", "protein"]
        };
        var facets = [
            "type",
            "creationTime",
            "creationLocation",
            "ownerGroup",
            "keywords"
        ];
        request(app)
            .get(
                "/api/v2/Datasets/fullfacet?fields=" +
                    encodeURIComponent(JSON.stringify(fields)) +
                    "&facets=" +
                    encodeURIComponent(JSON.stringify(facets)) +
                    "&access_token=" +
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

    it("Should update archive status message from archiveManager account", function(done) {
        request(app)
            .patch(
                "/api/v2/DatasetLifecycles/" +
                    pid +
                    "?access_token=" +
                    accessTokenArchiveManager
            )
            .send({
                archiveStatusMessage: "dataArchivedOnTape"
            })
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                res.body.should.have
                    .property("archiveStatusMessage")
                    .and.equal("dataArchivedOnTape");
                done();
            });
    });

    it("Should fetch the datasetLifecycle belonging to the new dataset", function(done) {
        request(app)
            .get(
                "/api/v2/Datasets/" +
                    pid +
                    "/datasetlifecycle?access_token=" +
                    accessTokenIngestor
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.be.instanceof(Object);
                done();
            });
    });

    it("Should update a single field in DatasetLifecycle via PUT command", function(done) {
        request(app)
            .put(
                "/api/v2/DatasetLifecycles/" +
                    pid +
                    "?access_token=" +
                    accessTokenArchiveManager
            )
            .send({
                archiveStatusMessage: "someDummyMessage"
            })
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.archiveStatusMessage.should.be.equal(
                    "someDummyMessage"
                );
                done();
            });
    });

    it("Should reset the DatasetLifecycle status and delete Datablocks", function(done) {
        request(app)
            .put(
                "/api/v2/DatasetLifecycles/resetArchiveStatus?access_token=" +
                    accessTokenArchiveManager
            )
            .send({
                datasetId: testDatasetLifecycle.id
            })
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

    it("should delete the other DatasetLifecycle", function(done) {
        request(app)
            .delete(
                "/api/v2/DatasetLifecycles/" +
                    idDatasetLifecycle2 +
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

    it("should delete the newly created dataset", function(done) {
        request(app)
            .delete(
                "/api/v2/Datasets/" +
                    pid2 +
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
