/* jshint node:true */
/* jshint esversion:6 */
'use strict';

// process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require('supertest');
var should = chai.should();
var utils = require('./LoginUtils');

var accessTokenIngestor = null;
var accessTokenArchiveManager = null;
var accessTokenUser = null;

var pid = null;
var pidraw = null;
var pid2 = null;
var pidraw2 = null;

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
}

var app
before(function () {
    app = require('../server/server')
});

describe('Test facet and filter queries', () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'ingestor',
                'password': 'aman'
            },
            (tokenVal) => {
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


    it('adds a new raw dataset', function (done) {
        request(app)
            .post('/api/v3/RawDatasets?access_token=' + accessTokenIngestor)
            .send(testraw)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('owner').and.be.string;
                res.body.should.have.property('type').and.equal('raw');
                res.body.should.have.property('pid').and.be.string;
                // store link to this dataset in datablocks
                pidraw = res.body['pid']
                pid = encodeURIComponent(res.body['pid']);
                done();
            });
    });

    it('adds another new raw dataset', function (done) {
        // modify owner
        testraw.ownerGroup = "p12345"
        request(app)
            .post('/api/v3/RawDatasets?access_token=' + accessTokenIngestor)
            .send(testraw)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('owner').and.be.string;
                res.body.should.have.property('type').and.equal('raw');
                res.body.should.have.property('pid').and.be.string;
                // store link to this dataset in datablocks
                pidraw2 = res.body['pid']
                pid2 = encodeURIComponent(res.body['pid']);
                done();
            });
    });



    // TODO add test for derived dataset queries as well

    it('Should return datasets with complex join query fulfilled', function (done) {
        var fields = {
            "ownerGroup": ["p12345", "p10029"],
            "text": "\"ultimate test\"",
            "creationTime": {
                "begin": "2011-09-13",
                "end": "2011-09-15"
            },
            "datasetlifecycle.archiveStatusMessage": "datasetCreated",
            "keywords": ["energy", "protein"]
        }

        request(app)
            .get('/api/v3/RawDatasets/fullquery?fields=' + encodeURIComponent(JSON.stringify(fields)) + '&access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.be.an('array').that.is.not.empty;
                res.body[0]['datasetlifecycle'].should.have.property('archiveStatusMessage').and.equal("datasetCreated");
                done();
            });
    });

    it('Should return datasets with ordered results', function (done) {
        var fields = {
            "ownerGroup": ["p12345", "p10029"]
        }
        var limits = {
            order: "creationTime:desc",
            skip: 0
        }

        request(app)
            .get('/api/v3/RawDatasets/fullquery?fields=' + encodeURIComponent(JSON.stringify(fields)) + '&limits=' + encodeURIComponent(JSON.stringify(limits)) + '&access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.be.instanceof(Array);
                done();
            });
    });


    it('Should return no datasets, because number of hits exhausted', function (done) {
        var fields = {
            "ownerGroup": ["p12345"],
            "datasetlifecycle.archiveStatusMessage": "datasetCreated"
        }
        var limits = {
            skip: 1000
        }

        request(app)
            .get('/api/v3/RawDatasets/fullquery?fields=' + encodeURIComponent(JSON.stringify(fields)) + '&limits=' + encodeURIComponent(JSON.stringify(limits)) + '&access_token=' + accessTokenIngestor)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.be.an('array').that.is.empty;
                done();
            });
    });

    it('Should return facets with complex join query fulfilled', function (done) {
        var fields = {
            "ownerGroup": ["p12345", "p10029"],
            "text": "\"ultimate test\"",
            "creationTime": {
                "begin": "2011-09-13",
                "end": "2011-09-15"
            },
            "keywords": ["energy", "protein"]
        }
        var facets = ["type", "creationTime", "creationLocation", "ownerGroup", "keywords"]
        request(app)
            .get('/api/v3/RawDatasets/fullfacet?fields=' + encodeURIComponent(JSON.stringify(fields)) + '&facets=' + encodeURIComponent(JSON.stringify(facets)) + '&access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    // Note: make the tests with PUT instead of patch as long as replaceOnPut false
    it('Should update archive status message from archiveManager account', function (done) {
        request(app)
            .put('/api/v3/RawDatasets/' + pid + '?access_token=' + accessTokenArchiveManager)
            .send({
                "datasetlifecycle": {
                    "archiveStatusMessage": "dataArchivedOnTape"
                }
            })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                res.body.should.have.nested.property('datasetlifecycle.archiveStatusMessage').and.equal("dataArchivedOnTape");
                done();
            });

    });

    it('Should update the datasetLifecycle information for multiple datasets', function (done) {
        var filter = {
            pid: {
                inq: [pidraw, pidraw2]
            }
        }
        request(app)
            .post('/api/v3/RawDatasets/update?where=' + JSON.stringify(filter) + '&access_token=' + accessTokenArchiveManager)
            .send({
                "datasetlifecycle": {
                    "archiveStatusMessage": "justAnotherTestMessage"
                }
            })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('count').and.equal(2);
                return done();
            });
    });

    it('The history status should now include the last change for the first raw dataset', function (done) {
        request(app)
            .get('/api/v3/RawDatasets/' + pid + '?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                // console.log("Resulting history in first raw:", JSON.stringify(res.body, null, 4))
                res.body.should.have.nested
                    .property(
                        "history[1].datasetlifecycle.previousValue.archiveStatusMessage"
                    )
                    .and.equal("dataArchivedOnTape");
                res.body.should.have.nested
                    .property(
                        "history[1].datasetlifecycle.currentValue.archiveStatusMessage"
                    )
                    .and.equal("justAnotherTestMessage");

                done();
            });

    });

    it('The history status should now include the last change for second raw dataset', function (done) {
        request(app)
            .get('/api/v3/RawDatasets/' + pid2 + '?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                // console.log("Resulting history in second raw:", JSON.stringify(res.body, null, 4))
                res.body.should.have.nested
                    .property(
                        "history[0].datasetlifecycle.previousValue.archiveStatusMessage"
                    )
                    .and.equal("datasetCreated");
                res.body.should.have.nested
                    .property(
                        "history[0].datasetlifecycle.currentValue.archiveStatusMessage"
                    )
                    .and.equal("justAnotherTestMessage");
                done();
            });

    });

    it('Should update the datasetLifecycle information directly via embedded model API', function (done) {
        request(app)
            .put('/api/v3/RawDatasets/' + pid + '/datasetLifecycle?access_token=' + accessTokenIngestor)
            .send({
                "archiveStatusMessage": "Testing embedded case"
            })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('archiveStatusMessage').and.equal("Testing embedded case");
                return done();
            });
    });

    it('Should reset the embedded DatasetLifecycle status and delete Datablocks', function (done) {
        request(app)
            .put('/api/v3/Datasets/resetArchiveStatus?access_token=' + accessTokenArchiveManager)
            .send({
                datasetId: pidraw
            })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it('should delete the newly created dataset', function (done) {
        // console.log("Deleting first dataset:",pid)
        request(app)
            .delete('/api/v3/Datasets/' + pid + '?access_token=' + accessTokenArchiveManager)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it('should delete the newly created dataset', function (done) {
        // console.log("Deleting second dataset:",pid2)
        request(app)
            .delete('/api/v3/Datasets/' + pid2 + '?access_token=' + accessTokenArchiveManager)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });


});
