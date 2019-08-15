/* jshint node:true */
/* jshint esversion:6 */
"use strict";

// process.env.NODE_ENV = 'test';

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const utils = require("./LoginUtils");

let accessToken = null,
    defaultPid = null,
    pid = null,
    attachmentId = null;

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
    "isPublished": false,
    "ownerGroup": "p13388",
    "accessGroups": [],
    "history": ["this should be deleted"],
    "createdBy": "this should be deleted as well"
};

let app;
before(function() {
    app = require("../server/server");
});

describe("Simple Dataset tests", () => {
    before(done => {
        utils.getToken(
            app,
            {
                username: "ingestor",
                password: "aman"
            },
            tokenVal => {
                accessToken = tokenVal;
                done();
            }
        );
    });

    it("adds a new dataset", function(done) {
        request(app)
            .post("/api/v3/Datasets?access_token=" + accessToken)
            .send(testdataset)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.have.property("version").and.be.string;
                res.body.should.have.property("type").and.equal("raw");
                res.body.should.have.property("pid").and.be.string;
                res.body.should.have.property("datasetName").and.be.string;
                //res.body.should.not.have.property('history')
                defaultPid = res.body["pid"];
                pid = encodeURIComponent(res.body["pid"]);
                done();
            });
    });

    it("should fetch this new dataset", function(done) {
        request(app)
            .get("/api/v3/Datasets/" + pid + "?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it("should add a new attachment to this dataset", function(done) {
        const testAttachment = {
            "thumbnail": "data/abc123",
            "caption": "Some caption",
            "creationTime": new Date(),
            "datasetId": defaultPid
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
                res.body.should.have.property("creationTime").and.equal(testAttachment.creationTime);
                res.body.should.have.property("id").and.be.string;
                res.body.should.have.property("datasetId").and.equal(testAttachment.datasetId);
                attachmentId = encodeURIComponent(res.body["id"]);
                done();
            });
    });

    it("should fetch this dataset attachment", function(done) {
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

    it("should delete this dataset attachment", function(done) {
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

    it("should delete this dataset", function(done) {
        request(app)
            .delete("/api/v3/Datasets/" + pid + "?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it("fetches array of Datasets", function(done) {
        request(app)
            .get(
                "/api/v3/Datasets?filter=%7B%22limit%22%3A10%7D&access_token=" +
                    accessToken
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

    it("should contain an array of facets", function(done) {
        request(app)
            .get("/api/v3/Datasets/fullfacet?access_token=" + accessToken)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.be.an("array");
                done();
            });
    });
});
