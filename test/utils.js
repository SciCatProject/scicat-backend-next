"use strict";

// process.env.NODE_ENV = 'test';

var chai = require("chai");
var chaiHttp = require("chai-http");
var request = require("supertest");
var should = chai.should();
var utils = require("../common/utils.js");


const superagent_tests = {
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
        res.should.be.instanceof('superagent');
        console.log(res);
    });

    it("should return an instance of superagent with put method", () => {
        const res = utils.superagent(superagent_tests["put"]);
        res.should.be.instanceof('superagent');
    });

    it("should return an instance of superagent with post method", () => {
        const res = utils.superagent(superagent_tests["post"]);
        res.should.be.instanceof('superagent');
    });

});



