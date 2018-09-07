'use strict';
// var utils = require('./utils');

module.exports = function (PublishedData) {



    PublishedData.get_doi = function (msg, cb) {

        const first_name = "Gareth";
        const last_name = "Murphy";
        const affiliation = "ESS";
        const publisher = "ESS";
        const publication_year = "2018";
        const title = "Sample Data";
        const technical_info = "Sample Data";
        const abstract = "Sample Data";
        const doi = "10.117199/BRIGHTNESS.5.1";
        const resource_type = "NeXus HDF5 Files";


        const xml = `<?xml version="1.0" encoding="UTF-8"?> \
<resource xmlns="http://datacite.org/schema/kernel-4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4/metadata.xsd">  \
  <identifier identifierType=\"DOI\">${doi}</identifier>  \
  <creators> \
    <creator> \
      <creatorName>${last_name}, ${first_name}</creatorName>  \
      <givenName>${first_name}</givenName>  \
      <familyName>${last_name}</familyName>\  
      <affiliation>${affiliation}</affiliation> \
    </creator> \
  </creators>  \
  <titles> \
    <title>${title} </title> \
  </titles>  \
  <publisher>${publisher}</publisher>  \
  <publicationYear>${publication_year}</publicationYear>  \
  <descriptions>  \
    <description xml:lang="en-us" descriptionType="TechnicalInfo">${technical_info}</description>  \
    <description xml:lang="en-us" descriptionType="Abstract">${abstract}</description> \
  </descriptions>  \
  <resourceType resourceTypeGeneral="Text">${resource_type}</resourceType> \
</resource>`;

        //console.log(xml);


        const datacite_doi_uri = "https://mds.datacite.org/doi/10.17199/BRIGHTNESS/NMX0001";
        const datacite_metadata_uri = "https://mds.datacite.org/metadata/10.17199/BRIGHTNESS/NMX0001";
        const datacite_test_uri = "https://mds.datacite.org/metadata/";
        const gmauthentication = {"x":"y"};

        const options = {
            method: "GET",
            uri: datacite_metadata_uri,
            auth: gmauthentication
        };
        console.log (options);

        cb(null, '10.111.79/TEST/DOI ' + first_name);
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
