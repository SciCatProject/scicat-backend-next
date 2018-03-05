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

var accessTokenIngestor = null;
var accessTokenArchiveManager = null;
var accessTokenUser = null;

var pid = null;
var idDatablock = null;
var idDatablock2 = null;
var idDatasetLifecycle = null;

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
    "doi": "not yet defined",
    "isPublished": false,
    "ownerGroup": "p10021",
    "accessGroups": [],
    "proposalId": "10.540.16635/20110123"
}

var testDataBlock = {
    "archiveId": "oneCopyBig/p10021/raw/2018/01/23/20.500.11935/07e8a14c-f496-42fe-b4b4-9ff41061695e_1_2018-01-23-03-11-34.tar",
    "size": 41780190,
    "packedSize": 41780190,
    "chkAlg": "sha1",
    "version": "0.6.0",
    "dataFileList": [{
            "path": "N1039__B410489.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:30.000Z",
            "chk": "652810fb470a0c90456912c0a3351e2f6d7325e4",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        },
        {
            "path": "N1039__B410613.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:35.000Z",
            "chk": "9fc6640a4cdb97c8389aa9613f4aeabe8ef681ef",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        },
        {
            "path": "N1039__B410729.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:41.000Z",
            "chk": "908fe1a942aabf63d5dfa3d0a5088eeaf02c79cf",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        },
        {
            "path": "N1039__B410200.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:18.000Z",
            "chk": "ee86aafec6258ff95961563435338e79a1ccb04d",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        },
        {
            "path": "N1039__B410377.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:25.000Z",
            "chk": "44cae8b9cb4bc732f04225371203af884af621d7",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        }
    ],
    "ownerGroup": "p10021"
}

var testDatasetLifecycle = {
    "id": "", // must be set to the id of the dataset,
    "isOnDisk": true,
    "isOnTape": false,
    "archiveStatusMessage": "datasetIsArchived",
    "retrieveStatusMessage": "",
    "isExported": false,
    "ownerGroup": "p10021"
}

describe('Create Dataset and its Datablocks DatasetLifecycle, then reset Datablocks and Datasetlifecycle status', () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'ingestor',
                'password': 'aman'
            },
            (tokenVal) => {
                accessTokenIngestor = tokenVal;
            });
        utils.getToken(app, {
                'username': 'archiveManager',
                'password': 'aman'
            },
            (tokenVal) => {
                accessTokenArchiveManager = tokenVal;
                done();
            });
    });

    it('adds a new raw dataset', function(done) {
        request(app)
            .post('/api/v2/RawDatasets?access_token=' + accessTokenIngestor)
            .send(testraw)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('owner').and.be.string;
                res.body.should.have.property('type').and.equal('raw');
                res.body.should.have.property('pid').and.be.string;
                // store link to this dataset in datablocks and datasetlifecycle
                testDataBlock.datasetId = res.body['pid']
                testDatasetLifecycle.id = res.body['pid']
                testDatasetLifecycle.datasetId = res.body['pid']
                pid = encodeURIComponent(res.body['pid']);
                done();
            });
    });

    it('adds a new datablock', function(done) {
        request(app)
            .post('/api/v2/Datablocks?access_token=' + accessTokenArchiveManager)
            .send(testDataBlock)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('size');
                res.body.should.have.property('id').and.be.string;
                idDatablock = encodeURIComponent(res.body['id']);
                done();
            });
    });

    it('adds a second datablock for same dataset', function(done) {
        testDataBlock.archiveId = "oneCopyBig/p10021/raw/2018/01/23/20.500.11935/07e8a14c-f496-42fe-b4b4-9ff410616xxx_1_2018-01-23-03-11-34.tar",
            request(app)
            .post('/api/v2/Datablocks?access_token=' + accessTokenArchiveManager)
            .send(testDataBlock)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('size');
                res.body.should.have.property('id').and.be.string;
                idDatablock2 = encodeURIComponent(res.body['id']);
                done();
            });

    });


    it('adds a new DatasetLifecycle', function(done) {
        request(app)
            .post('/api/v2/DatasetLifecycles?access_token=' + accessTokenIngestor)
            .send(testDatasetLifecycle)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                idDatasetLifecycle = encodeURIComponent(res.body['id']);
                done();
            });
    });


    it('Should fetch all datablocks belonging to the new dataset', function(done) {
        request(app)
            .get('/api/v2/Datasets/' + pid + '/datablocks?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.be.instanceof(Array).and.to.have.length(2);
                done();
            });
    });

    it('Should fetch the datasetLifefycle belonging to the new dataset', function(done) {
        request(app)
            .get('/api/v2/Datasets/' + pid + '/datasetlifecycle?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.be.instanceof(Object);
                done();
            });
    });


    it('should reset the archive information from the newly created dataset', function(done) {
        request(app)
            .post('/api/v2/Datasets/resetArchiveStatus?access_token=' + accessTokenArchiveManager)
            .send({datasetId:testDataBlock.datasetId})
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it('The archive Status Message should now be reset', function(done) {
        request(app)
            .get('/api/v2/Datasets/' + pid + '/datasetlifecycle?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.be.instanceof(Object);
                res.body.archiveStatusMessage.should.be.equal('datasetCreated')
                res.body.retrieveStatusMessage.should.be.equal('')
                done();
            });
    });

    it('There should be no datablocks any more for this dataset', function(done) {
        request(app)
            .get('/api/v2/Datasets/' + pid + '/datablocks/count?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.be.instanceof(Object);
                res.body.count.should.be.equal(0)
                done();
            });
    });

    it('should delete the DatasetLifecycle', function(done) {
        request(app)
            .delete('/api/v2/DatasetLifecycles/' + idDatasetLifecycle + '?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });


    it('should delete the newly created dataset', function(done) {
        request(app)
            .delete('/api/v2/Datasets/' + pid + '?access_token=' + accessTokenIngestor)
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
