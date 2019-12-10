"use strict";

const config = require("../../server/config.local");
const requestPromise = require("request-promise");
const fs = require("fs");

const path = "./server/doiconfig.local.json";

function formRegistrationXML(publishedData) {
    const {
        affiliation,
        publisher,
        publicationYear,
        title,
        abstract,
        resourceType,
        creator
    } = publishedData;
    const doi =
        config.doiPrefix +
        "/" +
        publishedData["doi"].replace(config.pidPrefix, "");
    const uniqueCreator = creator.filter(
        (author, i) => creator.indexOf(author) === i
    );

    const creatorElements = uniqueCreator.map(author => {
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
            <identifier identifierType="doi">${doi}</identifier>
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

module.exports = function (PublishedData) {
    const app = require("../../server/server");

    PublishedData.observe("before save", function (ctx, next) {
        const token = ctx.options.accessToken;
        if (token == null) {
            return next(new Error());
        }

        if (ctx.instance) {
            if (ctx.isNewInstance) {
                ctx.instance.doi = config.doiPrefix + "/" + ctx.instance.doi;
                console.log("      New pid:", ctx.instance.doi);

            }
        }

        app.models.User.findById(token.userId)
            .then(user => {
                next();
            })
            .catch(err => next(err));
    });

    PublishedData.formPopulate = function (pid, next) {
        var Dataset = app.models.Dataset;
        var Proposal = app.models.Proposal;
        var self = this;
        self.formData = {};

        Dataset.findById(pid, function (err, ds) {
            if (err) {
                return next(err);
            }
            const proposalId = ds.proposalId;
            self.formData.resourceType = ds.type;
            self.formData.description = ds.description;

            Proposal.findById(proposalId, function (err, prop) {
                if (prop) {
                    self.formData.title = prop.title;
                    self.formData.abstract = prop.abstract;
                }
                Dataset.thumbnail(pid)
                    .then((thumb) => {
                        self.formData.thumbnail = thumb;
                        return next(null, self.formData);
                    });
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
    PublishedData.register = function (id, cb) {
        PublishedData.findById(id, function (err, pub) {
            pub.doiRegisteredSuccessfullyTime = new Date();
            const xml = formRegistrationXML(pub);

            if (!config) {
                return cb("No config.local");
            }

            const fullDoi = pub.doi;
            const registerMetadataUri = `https://mds.datacite.org/metadata/${fullDoi}`;
            const registerDoiUri = `https://mds.datacite.org/doi/${fullDoi}`;
            const OAIServerUri = config.oaiProviderRoute;

            let doiProviderCredentials = {
                username: "removed",
                password: "removed"
            };
            if (fs.existsSync(path)) {
                doiProviderCredentials = JSON.parse(fs.readFileSync(path));
            } else {
                doiProviderCredentials = {
                    username: "removed",
                    password: "removed"
                };
            }
            const registerDataciteMetadataOptions = {
                method: "PUT",
                body: xml,
                uri: registerMetadataUri,
                headers: {
                    "content-type": "application/xml;charset=UTF-8"
                },
                auth: doiProviderCredentials
            };
            const encodeDoi = encodeURIComponent(fullDoi);
            const registerDataciteDoiOptions = {
                method: "PUT",
                body: [
                    "#Content-Type:text/plain;charset=UTF-8",
                    `doi= ${fullDoi}`,
                    `url= ${config.publicURLprefix}${encodeDoi}` // Same as registerDoiUri?
                ].join("\n"),
                uri: registerDoiUri,
                headers: {
                    "content-type": "text/plain;charset=UTF-8"
                },
                auth: doiProviderCredentials
            };

            const syncOAIPublication = {
                method: "PUT",
                body: pub,
                json: true,
                uri: OAIServerUri,
                headers: {
                    "content-type": "application/json;charset=UTF-8"
                },
                auth: doiProviderCredentials
            };
            console.log("before posting to datacite");
            if (config.site !== "PSI") {
                console.log("posting to datacite");
                console.log(registerDataciteMetadataOptions);
                console.log(registerDataciteDoiOptions);
                requestPromise(registerDataciteMetadataOptions)
                    .then(() => requestPromise(registerDataciteDoiOptions))
                    .then(() => cb(null, "asdasd"))
                    .catch(() => cb());
            } else if (!config.oaiProviderRoute) {
                return cb("oaiProviderRoute route not specified in config.local");
            } else {
                requestPromise(syncOAIPublication)
                    .then(() => cb(null, "asdasd"))
                    .catch(() => cb());
            }
        });
    };

    PublishedData.remoteMethod("register", {
        accepts: [{
            arg: "id",
            type: "string",
            required: true
        }],
        http: {
            path: "/:id/register",
            verb: "post"
        },
        returns: {
            arg: "doi",
            type: "string"
        }
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
