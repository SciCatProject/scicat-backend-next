"use strict";

// process.env.NODE_ENV = 'test';

var chai = require("chai");
//var chaiHttp = require("chai-http");
//var request = require("supertest");
var should = chai.should();
var utils = require("../common/models/utils.js");
const superagent = require("superagent");


const superagentTests = {
  "put" : {
    method: "PUT",
    body: "<test>This is just a put test</test>",
    uri: "http://this.is.test/put",
    headers: {
      "content-type": "application/xml;charset=UTF-8",
    },
    auth: {
      "username" : "a_user",
      "password" : "the_password"
    },
  },
  "post" : {
    method: "POST",
    body: "<test>This is just a post test</test>",
    uri: "http://this.is.test/post",
    headers: {
      "content-type": "application/xml;charset=UTF-8",
    },
    auth: {
      "username" : "a_user",
      "password" : "the_password"
    },
  }
};


describe("utils.superagent", () => {
    
  it("should return an instance of superagent", () => {
    const res = utils.superagent(superagent_tests["put"]);
    res.should.not.be.empty;
  });

  it("should return an instance of superagent with put method", () => {
    // TO-DO: better testing. Test structure of what's returned
    const res = utils.superagent(superagent_tests["put"]);
    res.should.not.be.empty;
  });

  it("should return an instance of superagent with post method", () => {
    // TO-DO: better testing. Test structure of what's returned
    const res = utils.superagent(superagent_tests["post"]);
    res.should.not.be.empty;
  });

});



