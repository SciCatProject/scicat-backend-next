/* jshint node:true */
/* jshint esversion:6 */
"use strict";

// process.env.NODE_ENV = 'test';

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var utils = require("./LoginUtils");
var should = chai.should();

var accessToken = null;

var app;
before( function(){
  app = require("../server/server");
});

describe("Login with functional accounts", () => {

  it("Ingestor login fails with incorrect credentials", function(done) {
    request(app)
      .post("/api/v3/Users/Login?include=user")
      .send({
        "username": "ingestor",
        "password": "abc123"
      })
      .set("Accept", "application/json")
      .expect(401)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        res.body.should.have.property("error");
        done();
      });

  });

  it("Login should succeed with correct credentials", function(done) {
    request(app)
      .post("/api/v3/Users/Login?include=user")
      .send({
        "username": "ingestor",
        "password": "aman"
      })
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res) {
        if (err)
          return done(err);
        res.body.should.have.property("user").and.be.instanceof(Object);
        done();
      });

  });
});
