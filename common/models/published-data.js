'use strict';
// var utils = require('./utils');

const rp = require('request-promise');
module.exports = function (PublishedData) {


    PublishedData.get_doi = function (msg, cb) {

        let url = "https://mds.test.datacite.org/metadata"
        let rawdata = {}
        let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "\n" +
            "<resource xmlns=\"http://datacite.org/schema/kernel-4\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4/metadata.xsd\">  \n" +
            "  <identifier identifierType=\"DOI\">10.17199/BRIGHTNESS/MG0001</identifier>  \n" +
            "  <creators> \n" +
            "    <creator> \n" +
            "      <creatorName>Richter, Tobias</creatorName>  \n" +
            "      <givenName>Tobias</givenName>  \n" +
            "      <familyName>Richter</familyName>  \n" +
            "      <affiliation>ESS</affiliation> \n" +
            "    </creator> \n" +
            "  </creators>  \n" +
            "  <titles> \n" +
            "    <title>Sample data from Multigrid testing</title> \n" +
            "  </titles>  \n" +
            "  <publisher>European Spallation Source ERIC</publisher>  \n" +
            "  <publicationYear>2018</publicationYear>  \n" +
            "  <descriptions> \n" +
            "    <description xml:lang=\"en-us\" descriptionType=\"TechnicalInfo\">Sample data from Multigrid testing</description>  \n" +
            "    <description xml:lang=\"en-us\" descriptionType=\"Abstract\">This data was collected as part of BrightnESS, funded by the European Union Framework Programme for Research and Innovation Horizon 2020, under grant agreement 676548. It consists of test data for the Multigrid detector</description> \n" +
            "  </descriptions>  \n" +
            "  <resourceType resourceTypeGeneral=\"Text\">Deliverable</resourceType> \n" +
            "</resource>"

        let doi_options = {
            url: url,
            method: 'POST',
            body: rawdata,
            rejectUnauthorized: false,
            requestCert: true
        };


        try {
            const response = rp(doi_options);
            return Promise.resolve(response);
        }
        catch (error) {
            return Promise.reject(error);
        }

        console.log(doi_options);
        cb(null, '10.111.79/TEST/DOI ' + msg);
    }

    PublishedData.remoteMethod('get_doi', {
        accepts: {arg: 'msg', type: 'string'},
        returns: {arg: 'doi', type: 'string'}
    });
    // TODO add logic that give authors privileges to modify data

    // // put
    // PublishedData.beforeRemote('replaceOrCreate', function(ctx, instance, next) {
    //     // convert base64 image
    //
    //     next();
    // });
    //
    // //patch
    // PublishedData.beforeRemote('patchOrCreate', function(ctx, instance, next) {
    //     next();
    // });

}
