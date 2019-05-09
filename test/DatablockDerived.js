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
var idDatablock = null;
var idOrigDatablock = null;
var idDatablock2 = null;

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
}


var testdataBlock = {
    "archiveId": "oneCopyBig/p10029/derived/2018/01/23/20.500.11935/07e8a14c-f496-42fe-b4b4-9ff41061695e_1_2018-01-23-03-11-34.tar",
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
    ]
}

var testorigDataBlock = {
    "size": 41780189,
    "dataFileList": [{
            "path": "N1039__B410489.tif",
            "size": 8356037,
            "time": "2017-07-24T13:56:30.000Z",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        },
        {
            "path": "N1039__B410613.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:35.000Z",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        },
        {
            "path": "N1039__B410729.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:41.000Z",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        },
        {
            "path": "N1039__B410200.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:18.000Z",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        },
        {
            "path": "N1039__B410377.tif",
            "size": 8356038,
            "time": "2017-07-24T13:56:25.000Z",
            "uid": "egon.meiera@psi.ch",
            "gid": "p16738",
            "perm": "-rw-rw-r--"
        }
    ]
}

var app

before( function(){
    app = require('../server/server')
});

describe('Test Datablocks and OrigDatablocks and their relation to Derived Datasets', () => {
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

    it('adds a new derived dataset', function(done) {
        request(app)
            .post('/api/v3/DerivedDatasets?access_token=' + accessTokenIngestor)
            .send(testderived)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('owner').and.be.string;
                res.body.should.have.property('type').and.equal('derived');
                res.body.should.have.property('pid').and.be.string;
                // store link to this dataset in datablocks
                testdataBlock.datasetId = res.body['pid']
                testorigDataBlock.datasetId = res.body['pid']
                pid = encodeURIComponent(res.body['pid']);
                done();
            });
    });

    it('adds a new origDatablock', function(done) {
        request(app)
            .post('/api/v3/OrigDatablocks?access_token=' + accessTokenIngestor)
            .send(testorigDataBlock)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('size').and.equal(41780189);
                res.body.should.have.property('id').and.be.string;
                idOrigDatablock = encodeURIComponent(res.body['id']);
                done();
            });
    });

    // the following two function definition prepare for
    // multi-delete actions to finish
    async function deleteDatablock(item) {
        await request(app)
            .delete('/api/v3/Datablocks/' + item.id + '?access_token=' + accessTokenArchiveManager)
            .set('Accept', 'application/json')
            .expect(200)
    }

    async function processArray(array) {
        for (const item of array) {
            await deleteDatablock(item)
        }
        // console.log("==== Finishing all deletes")
    }

    it('remove potentially existing datablocks to guarantee uniqueness', function(done) {
        let filter = '{"where": {"archiveId": {"inq": ["someOtherId", "' + testdataBlock.archiveId + '"]}}}'
        // console.log("Filter expression before encoding:",filter)
        let url = '/api/v3/Datablocks?filter=' + encodeURIComponent(filter) + '&access_token=' + accessTokenArchiveManager
        // console.log("============= url of query: ", url)
        request(app)
            .get(url)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                // console.log(" ==================== Found existing datablocks:", res.body)
                // now remove all these entries
                processArray(res.body)
                done()
            });
    });

    it('adds a new datablock', function(done) {
        request(app)
            .post('/api/v3/Datablocks?access_token=' + accessTokenArchiveManager)
            .send(testdataBlock)
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

    it('adds a new datablock again which should fail because it is already stored', function(done) {
        request(app)
            .post('/api/v3/Datablocks?access_token=' + accessTokenArchiveManager)
            .send(testdataBlock)
            .set('Accept', 'application/json')
            .expect(401)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                res.body.should.have.property('error');
                done();
            });

    });

    it('adds a new datablock which should fail because wrong functional account', function(done) {
        request(app)
            .post('/api/v3/Datablocks?access_token=' + accessTokenIngestor)
            .send(testdataBlock)
            .set('Accept', 'application/json')
            .expect(401)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                res.body.should.have.property('error');
                done();
            });

    });

    it('adds a second datablock for same dataset', function(done) {
        testdataBlock.archiveId = "someOtherId",
            request(app)
            .post('/api/v3/Datablocks?access_token=' + accessTokenArchiveManager)
            .send(testdataBlock)
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

    it('Should fetch all datablocks belonging to the new dataset', function(done) {
        request(app)
            .get('/api/v3/Datasets/' + pid + '/datablocks?access_token=' + accessTokenIngestor)
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

    it('The size fields in the dataset should be correctly updated', function(done) {
        request(app)
            .get('/api/v3/Datasets/' + pid + '?access_token=' + accessTokenIngestor)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.have.property('size').and.equal(41780189);
                res.body.should.have.property('packedSize').and.equal(83560380)
                done();
            });
    });

    it('should delete a datablock', function(done) {
        request(app)
            .delete('/api/v3/Datablocks/' + idDatablock + '?access_token=' + accessTokenArchiveManager)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it('should delete a OrigDatablock', function(done) {
        request(app)
            .delete('/api/v3/Datablocks/' + idOrigDatablock + '?access_token=' + accessTokenArchiveManager)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it('should delete the 2nd datablock', function(done) {
        request(app)
            .delete('/api/v3/Datablocks/' + idDatablock2 + '?access_token=' + accessTokenArchiveManager)
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
            .delete('/api/v3/Datasets/' + pid + '?access_token=' + accessTokenIngestor)
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
