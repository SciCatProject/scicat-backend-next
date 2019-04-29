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
    pid = null;

let app;

before(() => {
    app = require("../server/server");
});

describe("Simple Logbook test", () => {
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

    it("should fetch a Logbook", function(done) {
        let name = "ERIC";
        request(app)
            .get(`/api/v3/Logbooks/${name}?access_token=${accessToken}`)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }
                res.body.should.have.property("id").and.be.string;
                res.body.should.have.property("name").and.equal(name);
                res.body.should.have.property("messages").and.be.instanceof(Array);
                done();
            });
    });

    it("should fetch all Logbooks", function(done) {
        request(app)
            .get(`/api/v3/Logbooks?access_token=${accessToken}`)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }
                res.body.should.be.instanceof(Array);
                done();
            });
    });

    it("should fetch a filtered Logbook", function(done) {
        let name = "ERIC";
        let filter = {
            textSearch: "Hello",
            showBotMessages: true,
            showUserMessages: true,
            showImages: true
        };
        request(app)
            .get(`/api/v3/Logbooks/${name}/${filter}?access_token=${accessToken}`)
            .set("Accept", "application/json")
            .expect(200)
            .expect("Content-Type", /json/)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }
                res.body.should.have.property("id").and.be.string;
                res.body.should.have.property("name").and.equal(name);
                res.body.should.have.property("messages").and.be.instanceof(Array);
                done();
            });
    });
});
