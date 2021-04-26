"use strict";

var chai = require("chai");
var should = chai.should();
var utils = require("../common/models/utils.js");


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
    const res = utils.superagent(superagentTests["put"]);
    res.should.not.be.empty;
  });

  it("should return an instance of superagent with put method", () => {
    // TO-DO: better testing. Test structure of what's returned
    const res = utils.superagent(superagentTests["put"]);
    res.should.not.be.empty;
  });

  it("should return an instance of superagent with post method", () => {
    // TO-DO: better testing. Test structure of what's returned
    const res = utils.superagent(superagentTests["post"]);
    res.should.not.be.empty;
  });

});



