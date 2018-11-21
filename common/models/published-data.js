"use strict";

const config = require('../../server/config.local');
const requestPromise = require("request-promise");

const { doiProviderCredentials } = config;

function formRegistrationXML(publishedData) {
    const {
        affiliation,
        publisher,
        publicationYear,
        title,
        abstract,
        resourceType,
        authors
    } = publishedData;
    
    const doi = config.doiPrefix + "/" + publishedData["doi"].replace(config.pidPrefix, "");
    const uniqueAuthors = authors.filter((author, i) => authors.indexOf(author) === i);

    const creatorElements = uniqueAuthors.map(author => {
        const names = author.split(" ");
        const firstName = names[0];
        const lastName = names.slice(1).join(" ");

        return `
            <creator>
                <creatorName>${lastName}, ${firstName}</creatorName>
                <givenName>${firstName}</givenName>
                <familyName>${lastName}</familyName>
                <affiliation>${affiliation}</affiliation>
            </creator>
        `;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
        <resource xmlns="http://datacite.org/schema/kernel-4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://datacite.org/schema/kernel-4 http://schema.datacite.org/meta/kernel-4/metadata.xsd">
            <identifier identifierType="DOI">${doi}</identifier>
            <creators>
                ${creatorElements.join("\n")}
            </creators>
            <titles>
                <title>${title}</title>
            </titles>
            <publisher>${publisher}</publisher>
            <publicationYear>${publicationYear}</publicationYear>
            <descriptions>
                <description xml:lang="en-us" descriptionType="Abstract">${abstract}</description>
            </descriptions>
            <resourceType resourceTypeGeneral="Dataset">${resourceType}</resourceType>
        </resource>
    `;
}

module.exports = function(PublishedData) {
    PublishedData.observe('after save', function(ctx, next) {
        console.log('After save:');
        console.log(ctx.instance);

        PublishedData.register(ctx.instance.id, function(err, doi) {
            ctx.instance.doi = doi; /// ?????
            ctx.instance.doiRegisteredSuccessfullyTime = new Date();
            next(null);
        });
    });

    PublishedData.register = function(id, cb) {
        PublishedData.findById(id, function(err, pub) {
            const xml = formRegistrationXML(pub);
            console.log(xml);

            return;

            const registerMetadataUri = `https://mds.datacite.org/metadata/${doi}`;
            const registerDoiUri = `https://mds.datacite.org/doi/${doi}`;

            const registerMetadataOptions = {
                method: "PUT",
                body: xml,
                uri: registerMetadataUri,
                headers: {
                    "content-type": "application/xml;charset=UTF-8"
                },
                auth: doiProviderCredentials
            };

            const registerDoiOptions = {
                method: "PUT",
                body: [
                    "#Content-Type:text/plain;charset=UTF-8",
                    `doi= ${doi}`,
                    `url= ${url}` // Same as registerDoiUri?
                ].join('\n'),
                uri: registerDoiUri,
                headers: {
                    "content-type": "text/plain;charset=UTF-8"
                },
                auth: doiProviderCredentials
            };

            requestPromise(registerMetadataOptions)
                .then(() => requestPromise(registerDoiOptions))
                .then(() => cb(null, "asdasd"))
                .catch(() => cb());
        })
    };

    PublishedData.remoteMethod("register", {
        accepts: [
            {
                arg: "id",
                type: "string",
                required: true
            }
        ],
        http: {path: "/:id/register", verb: "post"},
        returns: {arg: "doi", type: "string"}
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
};
