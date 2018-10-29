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

var accessToken = null,
    id = null;

var testdataset = {
  "manager": [
    "stephan.egli@psi.ch"
  ],
  "tapeRedundancy": "low",
  //"tapeRetentionTime": 3,
  "autoArchiveDelay": 7,
  "archiveEmailNotification": false,
  "archiveEmailsToBeNotified": [
    "none"
  ],
  "retrieveEmailNotification": false,
  "retrieveEmailsToBeNotified": [
    "none"
  ],
  "ownerGroup": "p10021",
  "accessGroups": [
    "none"
  ]
}



describe('Simple Policy tests', () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'ingestor',
                'password': 'aman'
            },
            (tokenVal) => {
                accessToken = tokenVal;
                done();
            });
    });

    it('adds a new policy', function(done) {
        request(app)
            .post('/api/v2/Policies?access_token=' + accessToken)
            .send(testdataset)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('manager').and.be.string;
                res.body.should.have.property('ownerGroup').and.be.string;
                id = encodeURIComponent(res.body['id']);
                done();
            });
    });

    it('should fetch this new policy', function(done) {
        request(app)
            .get('/api/v2/Policies/' + id + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it('should delete this policy', function(done) {
        request(app)
            .delete('/api/v2/Policies/' + id + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });


});
