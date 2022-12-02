/* eslint-disable @typescript-eslint/no-var-requires */
//NOTE: Here we load and initialize some global variables that are used throughout the tests
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);

global.appUrl = "http://localhost:3000";
global.request = require("supertest");
