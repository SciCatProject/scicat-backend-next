/* jshint node:true */
/* jshint esversion:6 */
'use strict';

// process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require('supertest');
var should = chai.should();
var utils = require('./LoginUtils');

var accessToken = null,
    pid = null;

var testdataset = {
    "owner": "Bertram Astor",
    "ownerEmail": "bertram.astor@grumble.com",
    "orcidOfOwner": "unknown",
    "contactEmail": "bertram.astor@grumble.com",
    "sourceFolder": "/iramjet/tif/",
    "creationTime": "2011-09-14T06:08:25.000Z",
    "keywords": [
        "Cryo", "Calibration"
    ],
    "description": "None",
    "license": "CC BY-SA 4.0",
    "doi": "not yet defined",
    "isPublished": false,
    "ownerGroup": "p13388",
    "accessGroups": []
}

var app
before( function(){
    app = require('../server/server')
});

describe('Simple Dataset tests', () => {
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

    it('adds a new dataset', function(done) {
        request(app)
            .post('/api/v2/Datasets?access_token=' + accessToken)
            .send(testdataset)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                res.body.should.have.property('version').and.be.string;
                res.body.should.have.property('type').and.equal('base');
                res.body.should.have.property('pid').and.be.string;
                pid = encodeURIComponent(res.body['pid']);
                done();
            });
    });

    it('should fetch this new dataset', function(done) {
        request(app)
            .get('/api/v2/Datasets/' + pid + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });


    it('should delete this dataset', function(done) {
        request(app)
            .delete('/api/v2/Datasets/' + pid + '?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                done();
            });
    });


    it('fetches array of Datasets', function(done) {
        request(app)
            .get('/api/v2/Datasets?filter=%7B%22limit%22%3A10%7D&access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if (err)
                    return done(err);
                res.body.should.be.instanceof(Array);
                done();
            });
    });

    it('should contain an array of facets', function(done) {
        request(app)
            .get('/api/v2/Datasets/fullfacet?access_token=' + accessToken)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
                if(err)
                    return done(err);
                res.body.should.be.an('array');
                done();
            });
    });
});
