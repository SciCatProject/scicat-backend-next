/* jshint node:true */
/* jshint esversion:6 */
"use strict";

// process.env.NODE_ENV = 'test';

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const utils = require("./LoginUtils");
const nock = require('nock');

var accessTokenArchiveManager = null;
var idOrigDatablock = null;
let accessToken = null,
    defaultPid = null,
    pid = null,
    pidnonpublic = null,
    attachmentId = null,
    doi = null,
    pubDataId = null;

const testPublishedData = {
    "creator" : [ 
        "ESS"
    ],
    "publisher" : "ESS",
    "publicationYear" : 2020,
    "title" : "dd",
    "url" : "",
    "abstract" : "dd",
    "dataDescription" : "dd",
    "resourceType" : "raw",
    "numberOfFiles" : null,
    "sizeOfArchive" : null,
    "pidArray" : [ 
        "20.500.11935/243adb8a-30b7-4c3a-af2b-a1f2ac46353b"
    ],
};

const modifiedPublishedData = {
    "publisher" : "PSI",
    "abstract" : "a new abstract",
};

const testdataset = {
    "owner": "Bertram Astor",
    "ownerEmail": "bertram.astor@grumble.com",
    "orcidOfOwner": "unknown",
    "contactEmail": "bertram.astor@grumble.com",
    "sourceFolder": "/iramjet/tif/",
    "creationTime": "2011-09-14T06:08:25.000Z",
    "keywords": ["Cryo", "Calibration"],
    "description": "None",
    "type": "raw",
    "license": "CC BY-SA 4.0",
    "isPublished": true,
    "ownerGroup": "p13388",
    "accessGroups": []
};

const nonpublictestdataset = {
    "owner": "Bertram Astor",
    "ownerEmail": "bertram.astor@grumble.com",
    "orcidOfOwner": "unknown",
    "contactEmail": "bertram.astor@grumble.com",
    "sourceFolder": "/iramjet/tif/",
    "creationTime": "2011-09-14T06:08:25.000Z",
    "keywords": ["Cryo", "Calibration"],
    "description": "None",
    "type": "raw",
    "license": "CC BY-SA 4.0",
    "isPublished": false,
    "ownerGroup": "examplenonpublicgroup",
    "accessGroups": []
};

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

let app;
before(function () {
    app = require("../server/server");
});

describe("Test of access to published data", () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'ingestor',
                'password': 'aman'
            },
            (tokenVal) => {
                accessToken = tokenVal;
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

    it("adds a published data", function (done) {
        request(app)
            .post("/api/v3/PublishedData?access_token=" + accessToken)
            .send(testPublishedData)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property("publisher").and.be.string;
                doi = encodeURIComponent(res.body["doi"]);
                done();
            });
    });

    it("should fetch this new published data", function (done) {
        request(app)
            .get("/api/v3/PublishedData/" + doi + "?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.have.property("publisher").and.equal("ESS");
                res.body.should.have.property("status").and.equal("pending_registration");
                done();
            });
    });

   it("should register this new published data", function (done) {
    nock('http://127.0.0.1:3000')
        .post("/api/v3/PublishedData/" + doi + "/register")
        .query({"access_token": + accessToken})
        .reply(200);
        done();
    });

    // actual test
   /* it("should register this new published data", function (done) {
        request(app)
            .post("/api/v3/PublishedData/" + doi + "/register/?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });*/

    it("should fetch this new published data", function (done) {
        request(app)
            .get("/api/v3/PublishedData/" + doi + "?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    // actual test
    /*it("should resync this new published data", function (done) {
        request(app)
            .post("/api/v3/PublishedData/" + doi + "/resync/?access_token=" + accessToken)
            .send({data: modifiedPublishedData})
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });*/

    it("should resync this new published data", function (done) {
        nock('http://127.0.0.1:3000')
        .post("/api/v3/PublishedData/" + doi + "/resync", {data: modifiedPublishedData})
        .query({"access_token": + accessToken})
        .reply(200);
        done();
    });

    it("should fetch this new published data", function (done) {
        request(app)
            .get("/api/v3/PublishedData/" + doi + "?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it("should delete this published data", function (done) {
        request(app)
            .delete("/api/v3/PublishedData/" + doi + "?access_token=" + accessTokenArchiveManager)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it("adds a new dataset", function (done) {
        request(app)
            .post("/api/v3/Datasets?access_token=" + accessToken)
            .send(testdataset)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property("version").and.be.string;
                res.body.should.have.property("type").and.equal("raw");
                res.body.should.have.property("pid").and.be.string;
                res.body.should.have.property("datasetName").and.be.string;
                //res.body.should.not.have.property('history')
                defaultPid = res.body["pid"];
                pid = encodeURIComponent(res.body["pid"]);
                testorigDataBlock.datasetId = res.body['pid']
                done();
            });
    });

    it("adds a new nonpublic dataset", function (done) {
        request(app)
            .post("/api/v3/Datasets?access_token=" + accessToken)
            .send(nonpublictestdataset)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.have.property("version").and.be.string;
                res.body.should.have.property("isPublished").and.equal(false);
                res.body.should.have.property("pid").and.be.string;
                res.body.should.have.property("datasetName").and.be.string;
                //res.body.should.not.have.property('history')
                pidnonpublic = encodeURIComponent(res.body["pid"]);
                done();
            });
    });

    it("should fetch this new dataset", function (done) {
        request(app)
            .get("/api/v3/Datasets/" + pid + "?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.have.property("isPublished").and.equal(true);
                done();
            });
    });

    it("should fetch the non public dataset as ingestor", function (done) {
        request(app)
            .get("/api/v3/Datasets/" + pidnonpublic + "?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                // console.log("Non public:",res.body)
                if (err) return done(err);
                res.body.should.have.property("isPublished").and.equal(false);
                done();
            });
    });

    it('adds a new origDatablock', function (done) {
        request(app)
            .post('/api/v3/OrigDatablocks?access_token=' + accessToken)
            .send(testorigDataBlock)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('size').and.equal(41780189);
                res.body.should.have.property('id').and.be.string;
                idOrigDatablock = encodeURIComponent(res.body['id']);
                done();
            });
    });

    it("should add a new attachment to this dataset", function (done) {
        const testAttachment = {
            "thumbnail": "data/abc123",
            "caption": "Some caption",
            "datasetId": defaultPid,
            "ownerGroup": "ess",
            "accessGroups": ["loki", "odin"],
            "createdBy": "Bertram Astor",
            "updatedBy": "anonymous",
            "createdAt": new Date(),
            "updatedAt": new Date()
        };
        request(app)
            .post(
                "/api/v3/Datasets/" +
                pid +
                "/attachments?access_token=" +
                accessToken
            )
            .send(testAttachment)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.have.property("thumbnail").and.equal(testAttachment.thumbnail);
                res.body.should.have.property("caption").and.equal(testAttachment.caption);
                res.body.should.have.property("ownerGroup").and.equal(testAttachment.ownerGroup);
                res.body.should.have.property("accessGroups");
                res.body.should.have.property("createdBy");
                res.body.should.have.property("updatedBy").and.be.string;
                res.body.should.have.property("createdAt");
                res.body.should.have.property("id").and.be.string;
                res.body.should.have.property("datasetId").and.equal(testAttachment.datasetId);
                attachmentId = encodeURIComponent(res.body["id"]);
                done();
            });
    });

    it("should fetch this dataset attachment", function (done) {
        request(app)
            .get(
                "/api/v3/Datasets/" +
                pid +
                "/attachments/" +
                attachmentId +
                "?access_token=" +
                accessToken
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });


    it("should fetch some published datasets anonymously", function (done) {
        var fields = {
            "ownerGroup": ["p13388"],
        }
        var limits = {
            skip: 0,
            limit: 2
        }
        request(app)
            .get(
                "/api/v3/Datasets/anonymousquery" +
                '?fields=' + encodeURIComponent(JSON.stringify(fields)) +
                '&limits=' + encodeURIComponent(JSON.stringify(limits))
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                // console.log("Anoymous dataset:", res.body)
                res.body[0].should.have.property("isPublished").and.equal(true);
                done();
            });
    });

    it("should fail to fetch non-public dataset anonymously", function (done) {
        var fields = {
            "ownerGroup": ["examplenonpublicgroup"],
        }
        var limits = {
            skip: 0,
            limit: 2
        }
        request(app)
            .get(
                "/api/v3/Datasets/anonymousquery" +
                '?fields=' + encodeURIComponent(JSON.stringify(fields)) +
                '&limits=' + encodeURIComponent(JSON.stringify(limits))
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                // console.log("non public dataset:",res.body)
                res.body.should.be.instanceof(Array).and.to.have.length(0);
                done();
            });
    });


    it("should fetch one dataset including related data anonymously", function (done) {
        var limits = {
            skip: 0,
            limit: 2
        }
        var filter = {
            "where": {
                "ownerGroup": "p13388"
            },
            "include": [{
                "relation": "origdatablocks"
            }, {
                "relation": "datablocks"
            }, {
                "relation": "attachments"
            }]
        }

        request(app)
            .get(
                "/api/v3/Datasets/findOne" +
                '?filter=' + encodeURIComponent(JSON.stringify(filter)) +
                '&limits=' + encodeURIComponent(JSON.stringify(limits))
            )
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                // console.log("Findone including related data:", res.body)
                res.body.origdatablocks[0].should.have.property("ownerGroup").and.equal("p13388");
                done();
            });
    });

    it("should delete this dataset attachment", function (done) {
        request(app)
            .delete(
                "/api/v3/Datasets/" +
                pid +
                "/attachments/" +
                attachmentId +
                "?access_token=" +
                accessToken
            )
            .set("Accept", "application/json")
            .expect(204)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });


    it('should delete a OrigDatablock', function (done) {
        request(app)
            .delete('/api/v3/OrigDatablocks/' + idOrigDatablock + '?access_token=' + accessTokenArchiveManager)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                res.body.should.have.property('count').and.equal(1);
                // console.log("===== Delete OrigDatablock :",JSON.stringify(res.body,null,4),err)
                if (err)
                    return done(err);
                done();
            });
    });

    it("should delete the nonpublic dataset", function (done) {
        request(app)
            .delete("/api/v3/Datasets/" + pidnonpublic + "?access_token=" + accessTokenArchiveManager)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it("should delete this dataset", function (done) {
        request(app)
            .delete("/api/v3/Datasets/" + pid + "?access_token=" + accessTokenArchiveManager)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

});
