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
var idOrigDatablock = null;
var idDatablock2 = null;

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
    "ownerGroup": "p10029",
    "accessGroups": [],
    "proposalId": "10.540.16635/20110123"
}

var testdataBlock = {
    "archiveId": "oneCopyBig/p10029/raw/2018/01/23/20.500.11935/07e8a14c-f496-42fe-b4b4-9ff41061695e_1_2018-01-23-03-11-34.tar",
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
    "ownerGroup": "p10029"
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


describe('Test Datablocks and OrigDatablocks and their relation to Datasets', () => {
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
                        console.log("============ Both accessToken received")
                        console.log("Tokens:", accessTokenIngestor, accessTokenArchiveManager)
                        done();
                    });

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
                // store link to this dataset in datablocks
                testdataBlock.datasetId = res.body['pid']
                testorigDataBlock.datasetId = res.body['pid']
                pid = encodeURIComponent(res.body['pid']);
                done();
            });
    });

    it('adds a new origDatablock', function(done) {
        request(app)
            .post('/api/v2/OrigDatablocks?access_token=' + accessTokenArchiveManager)
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
            .delete('/api/v2/Datablocks/' + item.id + '?access_token=' + accessTokenArchiveManager)
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
        let url = '/api/v2/Datablocks?filter=' + encodeURIComponent(filter) + '&access_token=' + accessTokenArchiveManager
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
            .post('/api/v2/Datablocks?access_token=' + accessTokenArchiveManager)
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
            .post('/api/v2/Datablocks?access_token=' + accessTokenArchiveManager)
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
            .post('/api/v2/Datablocks?access_token=' + accessTokenIngestor)
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
            .post('/api/v2/Datablocks?access_token=' + accessTokenArchiveManager)
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

    it('The size fields in the dataset should be correctly updated', function(done) {
        request(app)
            .get('/api/v2/Datasets/' + pid + '?access_token=' + accessTokenIngestor)
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
            .delete('/api/v2/Datablocks/' + idDatablock + '?access_token=' + accessTokenArchiveManager)
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
            .delete('/api/v2/Datablocks/' + idOrigDatablock + '?access_token=' + accessTokenArchiveManager)
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
            .delete('/api/v2/Datablocks/' + idDatablock2 + '?access_token=' + accessTokenArchiveManager)
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
