/* jshint node:true */
/* jshint esversion:6 */
'use strict';

// process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require('supertest');
var app = require('../server/server');
var should = chai.should();
var utils = require('./LoginUtils');

var accessToken = null;

describe('RawDatasets', () => {
  beforeEach((done) => {
    utils.getToken(app, {'username' : 'ingestor', 'password' : 'aman'},
                   (tokenVal) => {
                     accessToken = tokenVal;
                     done();
                   });
  });
  describe('Get All RawDatasets', function() {
    it('fails with incorrect credentials', function(done) {
      request(app)
          .get('/api/v2/RawDatasets?access_token=' + accessToken)
          .set('Accept', 'application/json')
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            res.body.should.be.instanceof(Array);
            done();
          });
    });
  });
});
