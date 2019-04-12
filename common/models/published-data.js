"use strict";

const config = require('../../server/config.local');
const requestPromise = require("request-promise");
var Dataset = require('./dataset.json');

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
    const app = require("../../server/server");

/*
    PublishedData.observe('after save', function(ctx, next) {
        console.log('After save:');
        console.log(ctx.instance);

        PublishedData.register(ctx.instance.id, function(err, doi) {
            ctx.instance.doi = doi; /// ?????
            ctx.instance.doiRegisteredSuccessfullyTime = new Date();
            next(null);
        });
    });
	*/

    PublishedData.observe("before save", function(ctx, next) {
        const token = ctx.options.accessToken;
        if (token == null) {
            return next(new Error());
        }

        app.models.User.findById(token.userId).then(user => {
            console.log(user);
            next();
        }).catch(err => next(err));
    });

    PublishedData.formPopulate = function (pid, next){
        var Dataset = app.models.Dataset;
        var Proposal = app.models.Proposal;
        var RawDataset = app.models.RawDataset;
        var self = this;
        self.formData = {};
        Dataset.thumbnail(pid, function(err, thumb){
            if(err) {
                return next(err);
            }
            self.formData.thumbnail = thumb.thumbnail;
            return next(null, self.formData);
        });    
        Dataset.findById(pid, function(err, ds) {
            if(err) {
                return next(err);
            }
            const proposalId = ds.proposalId;
            if (!proposalId)
                return next("No proposalId found");
            self.formData.resourceType = ds.dataFormat;
            self.formData.description = ds.description;
            self.formData.thumbnail = ds.thumbnail;
            //publicationYear;
            //url;
            Proposal.findById(proposalId, function(err, prop){
                if(err)
                    return next(err); 
                if(!prop)
                    return next("No proposal found");
                self.formData.title = prop.title;
                self.formData.abstract = prop.abstract;
                return next(null, self.formData);
            });
        });
    };


    PublishedData.remoteMethod("formPopulate", {
        accepts: [{
            arg: "pid",
            type: "string",
            required: true
        }],
        http: {
            path: "/formPopulate",
            verb: "get"
        },
        returns: {
            type: "Object",
            root: true
        }
    });
 
    //Proposal.findById(ds.pid, function(err, prop) 
    PublishedData.register = function(id, cb) {
        PublishedData.findById(id, function(err, pub) {
            const xml = formRegistrationXML(pub);
            console.log(xml);

            return;

            // TODO understand what the following lines after the return mean 
            
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
