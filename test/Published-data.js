/* jshint node:true */
/* jshint esversion:6 */
"use strict";

// process.env.NODE_ENV = 'test';

const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const utils = require("./LoginUtils");

var accessTokenArchiveManager = null;
let accessToken = null;

const testdataset = {

};

let app;
before(function() {
    app = require("../server/server");
});

describe("Simple Dataset tests", () => {
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

    it("register published data", function(done) {
        request(app)
            .post("/api/v3/PublishedData?access_token=" + accessToken)
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

    
});
