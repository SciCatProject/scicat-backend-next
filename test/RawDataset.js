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
    "pid": "10.540.16635/0606568c-68666666c-a181-6af42972af57",
    "owner": "Bertram Astor",
    "ownerEmail": "bertram.astor@grumble.com",
    "orcidOfOwner": "unknown",
    "contactEmail": "bertram.astor@grumble.com",
    "sourceFolder": "/iramjet/tif/",
    "size": 0,
    "creationTime": "2011-09-14T06:08:25.000Z",
    "type": "raw",
    "description": "None",
    "classification": "AV=medium,CO=low",
    "license": "CC BY-SA 4.0",
    "version": "2.5.0",
    "doi": "not yet defined",
    "isPublished": false,
    "ownerGroup": "p13388",
    "accessGroups": [],
    "createdAt": "2017-11-01T18:02:49.825Z",
    "updatedAt": "2017-11-01T18:03:04.673Z",
    "user": "ingestor",
    "proposalId": "10.540.16635/20110123"
}

var object_id = testraw.pid.replace(/\//g, '%2F');
object_id = '%3CPID%3E%2F'+testraw.pid.replace(/\//g, '%2F');

describe('RawDatasets', () => {
    beforeEach((done) => {
        utils.getToken(app, {'username': 'ingestor', 'password': 'aman'},
            (tokenVal) => {
                accessToken = tokenVal;
                done();
            });
    });
    describe('POST /api/v2/RawDatasets', function () {
        it('adds a new dataset', function (done) {
            request(app)
                .post('/api/v2/RawDatasets?access_token=' + accessToken)
                .send(testraw)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                    if (err)
                        return done(err);
                    done();
                });
        });
    });

    describe('get one rawdataset', function () {
        it('should fetch one dataset', function (done) {
            request(app)
                .get('/api/v2/RawDatasets/' + object_id + '?access_token=' + accessToken)
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

    describe('delete  a RawDataset', function () {
        it('should delete a rawdataset', function (done) {
            request(app)
                .delete('/api/v2/RawDatasets/'  + object_id  + '?access_token=' + accessToken)
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


    describe('Get All RawDatasets', function () {
        it('should fetch all raw datasets', function (done) {
            request(app)
                .get('/api/v2/RawDatasets?filter=%7B%22limit%22%3A10%7D&access_token=' + accessToken)
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
    });
});
