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
    proposalId = null;

var testdataset = {
    "proposalId": "20170266",
    "email": "proposer%40uni.edu",
    "title": "A test proposal",
    "abstract": "Abstract of test proposal",
    "ownerGroup": "20170251-group"

}

describe('Simple Proposal tests', () => {
    before((done) => {
        utils.getToken(app, {
                'username': 'proposalIngestor',
                'password': 'aman'
            },
            (tokenVal) => {
                accessToken = tokenVal;
                done();
            });
    });

    it('adds a new proposal', function(done) {
        request(app)
            .post('/api/v2/Proposals?access_token=' + accessToken)
            .send(testdataset)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('ownerGroup').and.be.string;
                res.body.should.have.property('proposalId').and.be.string;
                proposalId = encodeURIComponent(res.body['proposalId']);
                done();
            });
    });

    it('should fetch this new proposal', function(done) {
        request(app)
            .get('/api/v2/Proposals/' + proposalId + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });

    it('should delete this proposal', function(done) {
        request(app)
            .delete('/api/v2/Proposals/' + proposalId + '?access_token=' + accessToken)
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
