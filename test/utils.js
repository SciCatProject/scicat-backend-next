"use strict";

var chai = require("chai");
var should = chai.should();
var utils = require("../common/models/utils.js");
let utilsTestData = require("./utilsTestData");

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
      "username": "a_user",
      "password": "the_password"
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


describe("utils.appendSIUnitToPhysicalQuantity", () => {

  it("should append SI Unit to physical quantity", () => {
    const testData = { ...utilsTestData.testData.scientificMetadata }
    utils.appendSIUnitToPhysicalQuantity(testData);
    chai.expect(testData).to.deep.equal(utilsTestData.appendSIUnitToPhysicalQuantityExpectedData);
  });
});

describe("utils.extractMetadataKeys", () => {
  it("should return a array of unique keys", () => {
    const res = utils.extractMetadataKeys([utilsTestData.testData]);
    chai.expect(res).to.deep.equal(utilsTestData.extractMetadataKeysExpectedData);
  });
});
