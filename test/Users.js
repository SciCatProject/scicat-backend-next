/* jshint node:true */
/* jshint esversion:6 */
'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require('supertest');
var app = require('../server/server');
var utils = require('./LoginUtils');
var should = chai.should();

var accessToken = null;

describe('Users', () => {
  beforeEach((done) => {
    console.log(utils.getToken)
    utils.getToken(app, {'username' : 'ingestor', 'password' : 'aman'},
                   (token) => {
                     accessToken = token;
                     done();
                   });
  });
  describe('POST /api/v2/Users/Login', function() {
    it('fails with incorrect credentials', function(done) {
      request(app)
          .post('/api/v2/Users/Login?include=user')
          .send({'username' : 'ingesting', 'password' : 'abc123'})
          .set('Accept', 'application/json')
          .expect(401)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            res.body.should.have.property('error');
            done();
          });
    });
  });
  describe('POST /api/v2/Users/Login', function() {
    it('succeeds with default credentials', function(done) {
      request(app)
          .post('/api/v2/Users/Login?include=user')
          .send({'username' : 'ingestor', 'password' : 'aman'})
          .set('Accept', 'application/json')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err)
              return done(err);
            res.body.should.have.property('user').and.be.instanceof (Object);
            done();
          });
    });
  });
});
