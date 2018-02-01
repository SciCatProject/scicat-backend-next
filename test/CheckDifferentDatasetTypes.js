/* jshint node:true */
/* jshint esversion:6 */
'use strict';

// process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require('supertest');
var app = require('../server/server');
var should = chai.should();
var utils = require('./LoginUtils');

var accessToken = null;

// TODO
// add tests for normal users
// add tests for jobs and orig(datablocks)
// TODO check if sizes are correctly filled from origDatablock and datablock to dataset


var testdataset = {
    "owner": "Bertram Astor",
    "ownerEmail": "bertram.astor@grumble.com",
    "orcidOfOwner": "unknown",
    "contactEmail": "bertram.astor@grumble.com",
    "sourceFolder": "/iramjet/tif/",
    "creationTime": "2011-09-14T06:08:25.000Z",
    "keywords": [
        "Cryo", "Calibration"
    ],
    "description": "None",
    "license": "CC BY-SA 4.0",
    "doi": "not yet defined",
    "isPublished": false,
    "ownerGroup": "p13388",
    "accessGroups": []
}

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
    "classification": "AV=medium,CO=low",
    "license": "CC BY-SA 4.0",
    "version": "2.5.0",
    "doi": "not yet defined",
    "isPublished": false,
    "ownerGroup": "p13388",
    "accessGroups": [],
    "proposalId": "10.540.16635/20110123"
}

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
    "doi": "not yet defined",
    "isPublished": false,
    "ownerGroup": "p34123"
}

var countDataset=0;
var rawCountDataset=0;
var derivedCountDataset=0;
var pid = null;
var pidraw = null;
var pidderived = null;

describe('CombinedDatasetTypes', () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'ingestor',
                'password': 'aman'
            },
            (tokenVal) => {
                accessToken = tokenVal;
                done();
            });
    });

    // get counts

    describe('get dataset count', function() {
        it('should get count of datasets', function(done) {
            request(app)
                .get('/api/v2/Datasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    countDataset=res.body.count
                    done();
                });
        });
    });

    describe('get rawdataset count', function() {
        it('should get count of raw datasets', function(done) {
            request(app)
                .get('/api/v2/RawDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    rawCountDataset=res.body.count
                    done();
                });
        });
    });

    describe('get deriveddataset count', function() {
        it('should get count of derived datasets', function(done) {
            request(app)
                .get('/api/v2/DerivedDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    derivedCountDataset=res.body.count
                    done();
                });
        });
    });

    // add dataset and check what happened to counts

    describe('POST /api/v2/Datasets', function() {
        it('adds a new dataset', function(done) {
            request(app)
                .post('/api/v2/Datasets?access_token=' + accessToken)
                .send(testdataset)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err)
                        return done(err);
                    res.body.should.have.property('version').and.be.string;
                    res.body.should.have.property('type').and.equal('base');
                    res.body.should.have.property('pid').and.be.string;
                    pid = encodeURIComponent(res.body['pid']);
                    done();
                });
        });
    });

    // get counts again

    describe('get dataset count', function() {
        it('should get count of datasets', function(done) {
            request(app)
                .get('/api/v2/Datasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-countDataset).should.equal(1);
                    done();
                });
        });
    });

    describe('get raw dataset count', function() {
        it('should get count of raw datasets', function(done) {
            request(app)
                .get('/api/v2/RawDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-rawCountDataset).should.equal(0);
                    done();
                });
        });
    });

    describe('get derived dataset count', function() {
        it('should get count of derived datasets', function(done) {
            request(app)
                .get('/api/v2/DerivedDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-derivedCountDataset).should.equal(0);
                    done();
                });
        });
    });


    // add rawdataset and check what happened to counts

    describe('POST /api/v2/RawDatasets', function() {
        it('adds a new raw dataset', function(done) {
            request(app)
                .post('/api/v2/RawDatasets?access_token=' + accessToken)
                .send(testraw)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err)
                        return done(err);
                    res.body.should.have.property('version').and.be.string;
                    res.body.should.have.property('type').and.equal('raw');
                    res.body.should.have.property('pid').and.be.string;
                    pidraw = encodeURIComponent(res.body['pid']);
                    done();
                });
        });
    });

    // get counts again

    describe('get dataset count', function() {
        it('should get count of datasets', function(done) {
            request(app)
                .get('/api/v2/Datasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-countDataset).should.equal(2);
                    done();
                });
        });
    });

    describe('get raw dataset count', function() {
        it('should get count of raw datasets', function(done) {
            request(app)
                .get('/api/v2/RawDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-rawCountDataset).should.equal(1);
                    done();
                });
        });
    });

    describe('get derived dataset count', function() {
        it('should get count of derived datasets', function(done) {
            request(app)
                .get('/api/v2/DerivedDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-derivedCountDataset).should.equal(0);
                    done();
                });
        });
    });


    // add derived dataset and check what happened to counts

    describe('POST /api/v2/DerivedDatasets', function() {
        it('adds a new derived dataset', function(done) {
            request(app)
                .post('/api/v2/DerivedDatasets?access_token=' + accessToken)
                .send(testderived)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err)
                        return done(err);
                    res.body.should.have.property('version').and.be.string;
                    res.body.should.have.property('type').and.equal('derived');
                    res.body.should.have.property('pid').and.be.string;
                    pidderived = encodeURIComponent(res.body['pid']);
                    done();
                });
        });
    });

    // get counts again

    describe('get dataset count', function() {
        it('should get count of datasets', function(done) {
            request(app)
                .get('/api/v2/Datasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-countDataset).should.equal(3);
                    done();
                });
        });
    });

    describe('get raw dataset count', function() {
        it('should get count of raw datasets', function(done) {
            request(app)
                .get('/api/v2/RawDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-rawCountDataset).should.equal(1);
                    done();
                });
        });
    });

    describe('get derived dataset count', function() {
        it('should get count of derived datasets', function(done) {
            request(app)
                .get('/api/v2/DerivedDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-derivedCountDataset).should.equal(1);
                    done();
                });
        });
    });

    describe('delete a Dataset', function() {
        it('should delete a dataset', function(done) {
            request(app)
                .delete('/api/v2/Datasets/' + pid + '?access_token=' + accessToken)
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

    describe('delete a Dataset', function() {
        it('should delete a dataset', function(done) {
            request(app)
                .delete('/api/v2/Datasets/' + pidraw + '?access_token=' + accessToken)
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

    describe('delete a Dataset', function() {
        it('should delete a dataset', function(done) {
            request(app)
                .delete('/api/v2/Datasets/' + pidderived + '?access_token=' + accessToken)
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

    describe('get dataset count', function() {
        it('should get count of datasets', function(done) {
            request(app)
                .get('/api/v2/Datasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-countDataset).should.equal(0);
                    done();
                });
        });
    });

    describe('get raw dataset count', function() {
        it('should get count of raw datasets', function(done) {
            request(app)
                .get('/api/v2/RawDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-rawCountDataset).should.equal(0);
                    done();
                });
        });
    });

    describe('get derived dataset count', function() {
        it('should get count of derived datasets', function(done) {
            request(app)
                .get('/api/v2/DerivedDatasets/count' + '?access_token=' + accessToken)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err)
                        return done(err);
                    // console.log("Count:", res.body)
                    res.body.should.have.property('count').and.be.a('number');
                    (res.body.count-derivedCountDataset).should.equal(0);
                    done();
                });
        });
    });


});
