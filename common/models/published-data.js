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

module.exports = function(PublishedData) {
    const app = require("../../server/server");

    PublishedData.observe("before save", function(ctx, next) {
        if (ctx.instance) {
            if (ctx.isNewInstance) {
                ctx.instance.doi = config.doiPrefix + "/" + ctx.instance.doi;
                ctx.instance.status = "pending_registration";
                // console.log("      New pid:", ctx.instance.doi);

            }
            if (ctx.options.accessToken) {
                var User = app.models.User;
                User.findById(ctx.options.accessToken.userId, function(
                    err,
                    instance
                ) {
                    if (instance) {
                        if (ctx.instance.createdBy) {
                            ctx.instance.updatedBy = instance.username;
                        } else {
                            ctx.instance.createdBy = instance.username;
                        }
                    } else {
                        if (ctx.instance.createdBy) {
                            ctx.instance.updatedBy = "anonymous";
                        } else {
                            ctx.instance.createdBy = "anonymous";
                        }
                    }
                    next();
                });
            } else {
                if (ctx.instance.createdBy) {
                    ctx.instance.updatedBy = "anonymous";
                } else {
                    ctx.instance.createdBy = "anonymous";
                }
                next();
            }
        } else if (ctx.data) {
            if (ctx.options.accessToken) {
                var User = app.models.User;
                User.findById(ctx.options.accessToken.userId, function(
                    err,
                    instance
                ) {
                    if (instance) {
                        ctx.data.updatedBy = instance.username;
                    } else {
                        ctx.data.updatedBy = "anonymous";
                    }
                    next();
                });
            } else {
                ctx.data.updatedBy = "anonymous";
                next();
            }
        }
    });

    PublishedData.formPopulate = function(pid, next) {
        var Dataset = app.models.Dataset;
        var Proposal = app.models.Proposal;
        var self = this;
        self.formData = {};

        Dataset.findById(pid, function(err, ds) {
            if (err) {
                return next(err);
            }
            const proposalId = ds.proposalId;
            self.formData.resourceType = ds.type;
            self.formData.description = ds.description;
            //self.formData.sizeOfArchive = ds.size;

            Proposal.findById(proposalId, function(err, prop) {
                if (prop) {
                    self.formData.title = prop.title;
                    self.formData.abstract = prop.abstract;
                }
                Dataset.thumbnail(pid).then(thumb => {
                    self.formData.thumbnail = thumb;
                    return next(null, self.formData);
                });
            });
        });
    };

    PublishedData.remoteMethod("formPopulate", {
        accepts: [
            {
                arg: "pid",
                type: "string",
                required: true
            }
        ],
        http: {
            path: "/formPopulate",
            verb: "get"
        },
        returns: {
            type: "Object",
            root: true
        }
    });

    PublishedData.register = function(id, cb) { 
        const where = {
            _id: id
        };

        PublishedData.findById(id, function(err, pub) {
            const data = {
                status: "registered",
                registeredTime: new Date()
            };
            pub.registeredTime = data.registeredTime;
            pub.status = data.status;

            const xml = formRegistrationXML(pub);

            if (!config) {
                return cb("No config.local");
            }

            var Dataset = app.models.Dataset;
            pub.pidArray.forEach(function (pid) {
                const whereDS = {pid: pid}  
                Dataset.update(whereDS , {isPublished: true}, function(err) {
                    if (err) {
                        return cb(err);
                    }
                });
            });

        
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
                method: "POST",
                body: pub,
                json: true,
                uri: OAIServerUri,
                headers: {
                    "content-type": "application/json;charset=UTF-8"
                },
                auth: doiProviderCredentials
            };
            if (config.site !== "PSI") {
                console.log("posting to datacite");
                console.log(registerDataciteMetadataOptions);
                console.log(registerDataciteDoiOptions);
                requestPromise(registerDataciteMetadataOptions)
                    .then(() => requestPromise(registerDataciteDoiOptions))
                    .then(v => {
                        PublishedData.update(where, data, function(err) {
                            if (err) {
                                return cb(err);
                            }
                        });
                        return cb(null, v);
                    })
                    .catch(e => cb(e));
            } else if (!config.oaiProviderRoute) {
                return cb(
                    "oaiProviderRoute route not specified in config.local"
                );
            } else {
                requestPromise(syncOAIPublication)
                    .then(v => {
                        PublishedData.update(where, {"$set": data}, function(err) {
                            if (err) {
                                return cb(err);
                            }
                        });
                        return cb(null, v);
                    })
                    .catch(e => cb(e));
            }
        });
    };

    PublishedData.remoteMethod("register", {
        accepts: [
            {
                arg: "id",
                type: "string",
                required: true
            }
        ],
        http: {
            path: "/:id/register",
            verb: "post"
        },
        returns: {
            arg: "doi",
            type: "string"
        }
    });

    PublishedData.resync = function(doi, data, cb) { 
        if (!config) {
            return cb("No config.local");
        }
        delete data.doi;
        delete data._id;
        const OAIServerUri = config.oaiProviderRoute;
        let doiProviderCredentials = {
            username: "removed",
            password: "removed"
        };

        const resyncOAIPublication = {
            method: "PUT",
            body: data,
            json: true,
            uri: OAIServerUri + "/" + encodeURIComponent(encodeURIComponent(doi)),
            headers: {
                "content-type": "application/json;charset=UTF-8"
            },
            auth: doiProviderCredentials
        };

        const where = {
            doi: doi
        };
        requestPromise(resyncOAIPublication)
            .then(v => {
                PublishedData.update(where, {"$set": data}, function(err) {
                    if (err) {
                        return cb(err);
                    }
                });
                return cb(null, v);
            })
            .catch(e => cb(e));
    };


    PublishedData.remoteMethod("resync", {
        accepts: [
            {
                arg: "id",
                type: "string",
                required: true
            },
            {
                arg: "data",
                type: "object",
                required: true,
                http: { source: 'body' }
            },
        ],
        http: {
            path: "/:id/resync",
            verb: "post"
        },
        returns: {
            arg: "doi",
            type: "string"
        }
    });

    // PublishedData.observe("loaded", function(ctx,  next) {
    PublishedData.afterRemote("find", function(ctx, modelInstance, next) {
        const accessToken = ctx.args.options.accessToken; // && ctx["accessToken"];
        // console.log(ctx);
        if (!accessToken) {
            if (ctx.result) {
                let answer;
                if (Array.isArray(modelInstance)) {
                    answer = [];
                    ctx.result.forEach(function(result) {
                        if (result["status"] === "registered") {
                            answer.push(result);
                        }
                    });
                } else {
                    if (ctx.result["status"] === "registered") {
                        answer = ctx.result;
                    }
                }
                ctx.result = answer;
            }
        }
        next();
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
