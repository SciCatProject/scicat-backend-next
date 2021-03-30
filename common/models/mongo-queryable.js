"use strict";
const utils = require("./utils");

module.exports = function (MongoQueryableModel) {

  // to get access to other models
  var app = require("../../server/server");

  function loopbackTypeOf(modelName, key, value = null) {
    // console.log("type extraction:", modelName, key)
    // extract type. For arrays this returns undefined. See
    // https://stackoverflow.com/questions/52916635/how-do-you-access-loopback-model-property-types-model-definition-properties-ty
    let property = app.models[modelName].definition.properties[key];
    // Also check derived Datasets
    // TODO Make code generic by deriving the test from the identical collection value in the model
    if (!property) {
      property = app.models["RawDataset"].definition.properties[key];
    }
    if (!property) {
      property = app.models["DerivedDataset"].definition.properties[key];
    }
    if (!property) {
      // console.log("Property undefined for :", modelName, key, " derive type from value ", value)
      // if (value.match(/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/)) {
      if ("begin" in value) {
        return "Date";
      } else {
        return "string";
      }
    } else {
      const type = typeof property.type === "string" ?
        property.type :
        property.type.modelName || property.type.name;
      return type;
    }
  }

  function searchExpression(modelName, fieldName, value) {
    // console.log("searchExpression modelName, fieldName, value", modelName, fieldName, value)
    if (fieldName === "text") {
      return {
        $search: value
      };
    }
    const typ = loopbackTypeOf(modelName, fieldName, value);
    // console.debug("Loopback type:", typ)
    if (typ === "String") {
      if (value.constructor === Array) {
        if (value.length == 1) {
          return value[0];
        } else {
          return {
            $in: value
          };
        }
      } else {
        return value;
      }
    } else if (typ === "Date") {
      return {
        $gte: new Date(value.begin),
        $lte: new Date(value.end)
      };
    } else if (typ === "Boolean") {
      return {
        $eq: value
      };
    } else if (Array.isArray(value)) {
      return {
        $in: value
      };
    } else {
      // console.log("Unknown Type: type, modelName,fieldName,value:", typ, modelName, fieldName, value)
      return value;
    }
  }

  function setFields(fields, options) {
    if (fields === undefined) {
      return {};
    }
    if (fields.metadataKey) {
      const {
        metadataKey,
        ...theRest
      } = fields;
      fields = {
        ...theRest
      };
    }
    if (!("isPublished" in fields) || !fields.isPublished) {
      const {
        isPublished,
        ...theRest
      } = fields;
      return {
        ...theRest,
        userGroups: options.currentGroups
      };
    }
    return fields;
  }

  MongoQueryableModel.fullfacet = function (fields, facets = [], options, cb) {
    // keep the full aggregation pipeline definition
    let pipeline = [];
    let facetMatch = {};
    fields = setFields(fields, options);
    let modelName = options.modelName;
    // console.log("++++++++++++ after filling fileds with usergroup:",fields)
    // construct match conditions from fields value, excluding facet material
    // i.e. fields is essentially split into match and facetMatch conditions
    // Since a match condition on usergroups is always prepended at the start
    // this effectively yields the intersection handling of the two sets (ownerGroup condition and userGroups)

    // first construct match conditions being applied before facet calculations

    // the fields array contains all the conditions which must be fulfilled

    // however all such conditions, which are treated as facets will be applied
    // only later within the different facet pipelines,
    // and therefore will be removed from the initial match conditions

    // the following fields must be part of the match clause
    // usergroup: limit to what the logged in user is allowed to see
    // text: fulltext search
    // mode: additional query expression

    let allMatch = [];
    Object.keys(fields).map(function (key) {
      // split in facet and non-facet conditions
      if (facets.indexOf(key) < 0) {
        if (key === "text") {
          // unshift because text must be at start of array
          if (typeof fields[key] === "string") {
            const m = {
              $match: {
                $or: [{
                  $text: searchExpression(
                    modelName,
                    key,
                    String(fields[key])
                  )
                }]
              }
            };
            pipeline.unshift(m);
          }
        }
        // map all id type fields to _id for mongo query
        else if (key == app.models[modelName].getIdName()) {
          let match = {};
          match["_id"] = searchExpression(modelName, key, fields[key]);
          const m = {
            $match: match
          };
          allMatch.push(m);
          pipeline.push(m);
        }
        // mode is not a field , just an object for containing a match clause
        // TODO translate begin/end syntax to $gte, new Date() Syntax, also for mode expression, see searchExpression
        else if (key === "mode") {
          // console.log("Mode key")
          // substitute potential id field in fields
          let idField = app.models[modelName].getIdName();
          let currentExpression = JSON.parse(JSON.stringify(fields[key]));
          if (idField in currentExpression) {
            currentExpression["_id"] = currentExpression[idField];
            delete currentExpression[idField];
          }
          const m = {
            $match: currentExpression
          };
          allMatch.push(m);
          pipeline.push(m);
        } else if (key === "userGroups") {
          if (fields["userGroups"].indexOf("globalaccess") < 0 && "ownerGroup" in app.models[modelName].definition.properties) {
            const m = {
              $match: {
                $or: [{
                  ownerGroup: searchExpression(
                    modelName,
                    "ownerGroup",
                    fields["userGroups"]
                  )
                },
                {
                  accessGroups: searchExpression(
                    modelName,
                    "accessGroups",
                    fields["userGroups"]
                  )
                }
                ]
              }
            };
            allMatch.push(m);
            pipeline.push(m);
          }
        } else if (key === "scientific" || key === "characteristics") {
          fields[key].forEach(condition => {
            const match = generateScientificExpression(modelName, condition);
            const m = {
              $match: match
            };
            allMatch.push(m);
            pipeline.push(m);
          });
        } else if (key.startsWith("datasetlifecycle.")) {
          let lifecycleKey = key.split(".")[1];
          let match = {};
          match[key] = searchExpression("DatasetLifecycle", lifecycleKey, fields[key]);
          // ("Datasetlifecycle Match expression:", match)
          const m = {
            $match: match
          };
          allMatch.push(m);
          pipeline.push(m);
        } else {
          if (typeof fields[key].constructor !== Object) {
            let match = {};
            //console.log("Key, properties:", key, app.models[options.modelName].definition.properties)
            match[key] = searchExpression(modelName, key, fields[key]);
            const m = {
              $match: match
            };
            allMatch.push(m);
            pipeline.push(m);
          }
        }
      } else {
        facetMatch[key] = searchExpression(modelName, key, fields[key]);
      }
    });

    // append all facet pipelines
    let facetObject = {};
    facets.forEach(function (facet) {
      // console.log("Facet.modelName,properties:", facet, modelName, app.models[modelName].definition.properties)
      // for inheritance Dataset test parent models as well
      // TODO make this generic by checking for same collection setting in the models
      if (modelName == "Dataset") {
        if (facet in app.models["RawDataset"].definition.properties) {
          facetObject[facet] = utils.createNewFacetPipeline(
            facet,
            loopbackTypeOf("RawDataset", facet),
            facetMatch
          );
          return;
        } else if (facet in app.models["DerivedDataset"].definition.properties) {
          facetObject[facet] = utils.createNewFacetPipeline(
            facet,
            loopbackTypeOf("DerivedDataset", facet),
            facetMatch
          );
          return;
        }
      } else if (facet in app.models[modelName].definition.properties) {
        facetObject[facet] = utils.createNewFacetPipeline(
          facet,
          loopbackTypeOf(modelName, facet),
          facetMatch
        );
        return;
      }
      if (facet.startsWith("datasetlifecycle.")) {
        let lifcycleFacet = facet.split(".")[1];
        facetObject[lifcycleFacet] = utils.createNewFacetPipeline(
          lifcycleFacet,
          loopbackTypeOf("DatasetLifecycle", lifcycleFacet),
          facetMatch
        );
        return;
      } else {
        console.log(
          "Warning: Facet not part of any model:",
          facet
        );
        return;
      }
    });

    // add pipeline to count all documents, take into account unwinding case for (Orig)Datablock
    // TODO correct facet handling with actual facets (not just "all") when (Orig)Datablock is used

    if (options.modelName === "OrigDatablock" || options.modelName === "Datablock") {
      // console.log("Adding additional pipeline steps for unwinding file names:")
      if (allMatch.length > 0) {
        facetObject["all"] = [{
          $match: facetMatch
        },
        {
          "$unwind": "$dataFileList"
        },
        ...allMatch,
        {
          $count: "totalSets"
        }
        ];
      } else {
        facetObject["all"] = [{
          $match: facetMatch
        },
        {
          "$unwind": "$dataFileList"
        }, {
          $count: "totalSets"
        }
        ];

      }

    } else {
      facetObject["all"] = [{
        $match: facetMatch
      },
      {
        $count: "totalSets"
      }
      ];
    }

    pipeline.push({
      $facet: facetObject
    });
    // console.log("Resulting aggregate query in fullfacet method:", JSON.stringify(pipeline, null, 3));

    app.models[options.modelName].getDataSource().connector.connect(function (err, db) {
      let mongoModel = modelName;
      if (app.models[modelName].definition.settings.mongodb &&
                app.models[modelName].definition.settings.mongodb.collection) {
        mongoModel = app.models[modelName].definition.settings.mongodb.collection;
      }
      var collection = db.collection(mongoModel);
      try {
        collection.aggregate(pipeline, {
          allowDiskUse: true
        }, function (err, cursor) {
          cursor.toArray(function (err, res) {
            if (err) {
              console.log("Fullfacet err handling:", err);
            }
            cb(err, res);
          });
        });
      } catch (err) {
        cb(err, null);
      }

    });
  };



  /* returns filtered set of someCollections. Options:
       filter condition consists of
       - ownerGroup (automatically applied on server side)
       - text search
       - mode search: arbitrary additional condition (e.g. for and/or combinations, adding scientific metadata)
       - list of fields which are treated as filter condition (name,type,value triple)
     - paging of results
    */
  MongoQueryableModel.fullquery = function (fields, limits, options, cb) {
    // keep the full aggregation pipeline definition
    let pipeline = [];
    fields = setFields(fields, options);
    // TODO this should be derived from model definition field options.mongodb.collection in future
    let modelName = options.modelName;
    // console.log("Inside fullquery:fields,limits,options",fields,limits,options)
    // console.log("++++++++++++ fullquery: after filling fields with usergroup:",fields)
    // let matchJoin = {}
    // construct match conditions from fields value

    // TOOD avoid code duplication of large parts with fullfacet
    let allMatch = [];

    Object.keys(fields).map(function (key) {
      if (fields[key] && fields[key] !== "null") {
        if (key === "text") {
          // unshift because text must be at start of array
          if (typeof fields[key] === "string") {
            const m = {
              $match: {
                $or: [{
                  $text: searchExpression(
                    modelName,
                    key,
                    String(fields[key])
                  )
                }]
              }
            };
            pipeline.unshift(m);
          }
        }
        // map all id type fields to _id for mongo query
        else if (key == app.models[modelName].getIdName()) {
          let match = {};
          match["_id"] = searchExpression(modelName, key, fields[key]);
          const m = {
            $match: match
          };
          allMatch.push(m);
          pipeline.push(m);
        }
        // mode is not a field , just an object for containing a match clause
        // TODO translate begin/end syntax to $gte, new Date() Syntax, also for mode expression, see searchExpression
        else if (key === "mode") {
          // console.log("Mode key")
          // substitute potential id field in fields
          let idField = app.models[modelName].getIdName();
          let currentExpression = JSON.parse(JSON.stringify(fields[key]));
          if (idField in currentExpression) {
            currentExpression["_id"] = currentExpression[idField];
            delete currentExpression[idField];
          }
          const m = {
            $match: currentExpression
          };
          allMatch.push(m);
          pipeline.push(m);
        } else if (key === "userGroups") {
          if (fields["userGroups"].indexOf("globalaccess") < 0 && "ownerGroup" in app.models[modelName].definition.properties) {
            const m = {
              $match: {
                $or: [{
                  ownerGroup: searchExpression(
                    modelName,
                    "ownerGroup",
                    fields["userGroups"]
                  )
                },
                {
                  accessGroups: searchExpression(
                    modelName,
                    "accessGroups",
                    fields["userGroups"]
                  )
                }
                ]
              }
            };
            allMatch.push(m);
            pipeline.push(m);
          }
        } else if (key === "scientific" || key === "characteristics") {
          fields[key].forEach(condition => {
            const match = generateScientificExpression(modelName, condition);
            const m = {
              $match: match
            };
            allMatch.push(m);
            pipeline.push(m);
          });
        } else if (key.startsWith("datasetlifecycle.")) {
          let lifecycleKey = key.split(".")[1];
          let match = {};
          match[key] = searchExpression("DatasetLifecycle", lifecycleKey, fields[key]);
          // ("Datasetlifecycle Match expression:", match)
          const m = {
            $match: match
          };
          allMatch.push(m);
          pipeline.push(m);
        } else {
          if (typeof fields[key].constructor !== Object) {
            let match = {};
            //console.log("Key, properties:", key, app.models[options.modelName].definition.properties)
            match[key] = searchExpression(modelName, key, fields[key]);
            const m = {
              $match: match
            };
            allMatch.push(m);
            pipeline.push(m);
          }
        }
      }
    });

    if (options.modelName === "OrigDatablock" || options.modelName === "Datablock") {
      // console.log("Adding additional pipeline steps for unwinding file names:")
      pipeline.push({
        "$project": {
          "dataFileList": 1,
          "datasetId": 1,
          "ownerGroup": 1
        }
      }, {
        "$unwind": "$dataFileList"
      });
      if (allMatch.length > 0) {
        pipeline.push(...allMatch);
      }
    }

    // }
    // final paging section ===========================================================
    if (limits) {
      if ("order" in limits) {
        // input format: "creationTime:desc,creationLocation:asc"
        const sortExpr = {};
        const sortFields = limits.order.split(",");
        sortFields.map(function (sortField) {
          const parts = sortField.split(":");
          const dir = parts[1] == "desc" ? -1 : 1;
          // map id field
          let fieldName = parts[0];
          let idField = app.models[modelName].getIdName();
          // console.log("Derived idField:", idField)
          if (fieldName == idField) {
            fieldName = "_id";
          }
          sortExpr[fieldName] = dir;
        });
        pipeline.push({
          $sort: sortExpr
          // e.g. { $sort : { creationLocation : -1, creationLoation: 1 } }
        });
      }

      if ("skip" in limits) {
        pipeline.push({
          $skip: Number(limits.skip) < 1 ? 0 : Number(limits.skip)
        });
      }
      if ("limit" in limits) {
        pipeline.push({
          $limit: Number(limits.limit) < 1 ? 1 : Number(limits.limit)
        });
      }
    }
    // console.log("Resulting aggregate query in fullquery method:", JSON.stringify(pipeline, null, 3));
    app.models[options.modelName].getDataSource().connector.connect(function (err, db) {
      // fetch calling parent collection
      let mongoModel = modelName;
      if (app.models[modelName].definition.settings.mongodb &&
                app.models[modelName].definition.settings.mongodb.collection) {
        mongoModel = app.models[modelName].definition.settings.mongodb.collection;
      }
      var collection = db.collection(mongoModel);
      try {
        collection.aggregate(pipeline, {
          allowDiskUse: true
        }, function (err, cursor) {
          cursor.toArray(function (err, res) {
            if (err) {
              console.log("Fullquery err handling:", err);
            } else {
              // rename _id to id Field name
              let idField = app.models[modelName].getIdName();
              // console.log("Derived idField 2:", idField)
              res.map(ds => {
                Object.defineProperty(
                  ds,
                  idField,
                  Object.getOwnPropertyDescriptor(ds, "_id")
                );
                delete ds["_id"];
              });
            }
            cb(err, res);
          });
        });
      } catch (err) {
        cb(err, null);
      }
    });
  };

  // TODO check if this works in generic fashion:
  MongoQueryableModel.isValid = function (instance, next) {
    var ds = new MongoQueryableModel(instance);
    ds.isValid(function (valid) {
      if (!valid) {
        next(null, {
          errors: ds.errors,
          valid: false
        });
      } else {
        next(null, {
          valid: true
        });
      }
    });
  };

  MongoQueryableModel.observe("before save", function (ctx, next) {
    const User = app.models.User;
    // make sure that only ownerGroup members have modify rights
    if (ctx.data && ctx.options && !ctx.options.validate) {
      let groups = [];
      if (ctx.options && ctx.options.currentGroups) {
        // ("Your groups are:", ctx.options.currentGroups)
        groups = ctx.options.currentGroups;
      }
      // however allow history updates
      if (!ctx.data["history"] && ctx.currentInstance) {
        // modify operations are forbidden unless you are member of ownerGroup or have globalaccess role
        if ((groups.indexOf("globalaccess") < 0) && !ctx.isNewInstance && groups.indexOf(ctx.currentInstance.ownerGroup) < 0) {
          var e = new Error();
          e.statusCode = 403;
          e.message = "You must be in ownerGroup " + ctx.currentInstance.ownerGroup + " or have global role to modify document, your groups are:" + groups;
          return next(e);
        }
      }
    }
    // add some admin infos automatically
    if (ctx.instance) {
      if (ctx.options.accessToken) {
        User.findById(ctx.options.accessToken.userId, function (
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
          return next();
        });
      } else {
        if (ctx.instance.createdBy) {
          ctx.instance.updatedBy = "anonymous";
        } else {
          ctx.instance.createdBy = "anonymous";
        }
        return next();
      }
    } else if (ctx.data) {
      if (ctx.options.accessToken) {
        User.findById(ctx.options.accessToken.userId, function (
          err,
          instance
        ) {
          if (instance) {
            ctx.data.updatedBy = instance.username;
          } else {
            ctx.data.updatedBy = "anonymous";
          }
          return next();
        });
      } else {
        ctx.data.updatedBy = "anonymous";
        return next();
      }
    }
  });

  MongoQueryableModel.beforeRemote("prototype.patchAttributes", function (
    ctx,
    unused,
    next
  ) {
    if ("scientificMetadata" in ctx.args.data) {
      const {
        scientificMetadata
      } = ctx.args.data;
      Object.keys(scientificMetadata).forEach(key => {
        if (scientificMetadata[key] && scientificMetadata[key].unit && scientificMetadata[key].unit.length > 0) {
          const {
            value,
            unit
          } = scientificMetadata[key];
          const {
            valueSI,
            unitSI
          } = utils.convertToSI(value, unit);
          scientificMetadata[key] = {
            ...scientificMetadata[key],
            valueSI,
            unitSI
          };
        }
      });
    }
    next();
  });


  MongoQueryableModel.afterRemote("fullquery", function (ctx, someCollections, next) {
    if (ctx.args.fields.scientific) {
      const {
        scientific
      } = ctx.args.fields;
      someCollections.forEach(({
        scientificMetadata
      }) => {
        scientific.forEach(({
          lhs,
          unit
        }) => {
          if (
            lhs in scientificMetadata &&
                        scientificMetadata[lhs].unit.length > 0 &&
                        scientificMetadata[lhs].unit !== unit
          ) {
            const {
              valueRequested,
              unitRequested,
            } = utils.convertToRequestedUnit(
              scientificMetadata[lhs].value,
              scientificMetadata[lhs].unit,
              unit
            );
            scientificMetadata[lhs].value = valueRequested;
            scientificMetadata[lhs].unit = unitRequested;
          }
        });
      });
    }
    next();
  });

  function generateScientificExpression(
    modelName, {
      lhs,
      relation,
      rhs,
      unit
    }
  ) {
    let match = {
      $and: [],
    };
    const parameterFieldName =
            modelName === "Dataset" ?
              "scientificMetadata" :
              "sampleCharacteristics";
    const matchKeyGeneric = `${parameterFieldName}.${lhs}.value`;
    const matchKeyMeasurement = `${parameterFieldName}.${lhs}.valueSI`;
    const matchUnit = `${parameterFieldName}.${lhs}.unitSI`;
    switch (relation) {
    case "EQUAL_TO_STRING": {
      match.$and.push({
        [matchKeyGeneric]: {
          $eq: rhs,
        },
      });
      break;
    }
    case "EQUAL_TO_NUMERIC": {
      if (unit.length > 0) {
        const {
          valueSI,
          unitSI
        } = utils.convertToSI(rhs, unit);
        match.$and.push({
          [matchKeyMeasurement]: {
            $eq: valueSI,
          },
        });
        match.$and.push({
          [matchUnit]: {
            $eq: unitSI,
          },
        });
      } else {
        match.$and.push({
          [matchKeyGeneric]: {
            $eq: rhs,
          },
        });
      }
      break;
    }
    case "GREATER_THAN": {
      if (unit.length > 0) {
        const {
          valueSI,
          unitSI
        } = utils.convertToSI(rhs, unit);
        match.$and.push({
          [matchKeyMeasurement]: {
            $gt: valueSI,
          },
        });
        match.$and.push({
          [matchUnit]: {
            $eq: unitSI,
          },
        });
      } else {
        match.$and.push({
          [matchKeyGeneric]: {
            $gt: rhs,
          },
        });
      }
      break;
    }
    case "LESS_THAN": {
      if (unit.length > 0) {
        const {
          valueSI,
          unitSI
        } = utils.convertToSI(rhs, unit);
        match.$and.push({
          [matchKeyMeasurement]: {
            $lt: valueSI,
          },
        });
        match.$and.push({
          [matchUnit]: {
            $eq: unitSI,
          },
        });
      } else {
        match.$and.push({
          [matchKeyGeneric]: {
            $lt: rhs,
          },
        });
      }
      break;
    }
    }
    return match;
  }
};
