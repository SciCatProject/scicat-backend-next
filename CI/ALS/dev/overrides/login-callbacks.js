"use strict";

/*
  This module communicates with ALSHub at two different points in the login process.
  
  The first is an observer on the UserIdentity model that adds group information to the user's
  profile from ALSHub. This gets used by Catamel to enforce access controls.  
  
  The second is a loginCallback for passport that checks that the user is a user in ALSHub. 
  If not, it sends blank credentials to the return of the loginCallback, prompting 
  loopback-passport to not log the user in.


*/





/* 
    A loginCallback is function used by passport that gives one a chance
    to intercept the login message flow. This is useful in cases where the 
    an OAuth2/OIDC provider is a third part (like ORCID), but an internal system
    must be queried to add information to the user's profile. 

    With a generic passport implementation, one could simple attach the callback
    funtion as a member of the passport configuration. However, Catamel uses the 
    loopback-passport-confgigurator, which is configed via a .json file (providers.json) 
    and not through a .js file. This means that the entry in the is at best a string, not a 
    function.

    server.js will 
        - import this file
        - read the loginCallback configuration
        - if the string matches a function defined in this file, it will attach that function
          to the provider.


    Below is an example of a callback function. This is example mimics the default that passport
    configures if none has been configured. Note a few important things:
        - the function is exported through module.exports
        - the function calls done(err, user, authInfo)
        - if a custom call back decides that a user should not be logged in, call done(none, none, none)


module.exports.sampleLoginCallback = function(req, done) {
  return function(err, user, identity, token) {
    var authInfo = {
      identity: identity,
    };
    if (token) {
      authInfo.accessToken = token;
    }
    done(err, user, authInfo);
  };
};
*/

const logger = require("../../common/logger");
var request = require("request");

const authenticators = {
  ORCID: "orcid",
  GOOGLE: "google"
};

const reqIDFields = {
  ORCID: "orcid",
  EMAIL: "email"
};

function getUserURL(userIdentity){
  let idField = "";
  let subjectId = "";
  if (userIdentity.provider == authenticators.ORCID){
    idField = reqIDFields.ORCID;
    subjectId = userIdentity.profile._json.sub;
  }
  else if (userIdentity.provider == authenticators.GOOGLE){
    idField = reqIDFields.EMAIL;
    subjectId = userIdentity.profile._json.email;
  }
  else{
    return null;
  }
  return `${process.env.USER_SVC_API_URL}${subjectId}/${idField}?api_key=${process.env.USER_SVC_API_KEY}`;
}

// Observe saving UserItentity. This gives us the ability to update the user profile with facitly-specific groups
module.exports = function (app) {
  app.models.UserIdentity.observe("before save", function(ctx, next) {
    if (!ctx.data){
      logger.logInfo("No context data from UserItentity");
      next();
      return;
    }
    const userURL = getUserURL(ctx.currentInstance);
    if (!userURL){
      logger.logError(`unexpected authenticator type: ${ctx.currentInstance.provider}`);
      next();
      return;
    }
    request(userURL, function (error, response, _body) {
      // ask ALSHub for user information so we can get group info
      if (error){
        logger.logError(`error talking to splash_userservice ${error.message}`);
        next();
        return;
      }
      if (response.statusCode == 200){
        // add groups to profile, saving in the UserItentity model
        ctx.data.profile.accessGroups = JSON.parse(response.body).groups;
      }
      next();
    });
  });
};


// ALS Login callback, registered with Passport. This gives us the opportunity
// to deny login if the user is not found in the facility directory.
module.exports.alsLoginCallback = function(req, done) {
  return function(err, user, identity, token) {

    var authInfo = {
      identity: identity,
    };
    if (token) {
      authInfo.accessToken = token;
    }

    const requestURL = getUserURL(identity);
    if (!requestURL){
      logger.logError(`unexpected authenticator type: ${identity.provider}`);
      done();
      return;
    }
    request(requestURL, function (error, response, body) {
      // ask ALSHub for the user's information
      if (error){
        logger.logError(`error talking to splash_userservice ${error.message}`);
        done(err, null, null);
        return;
      }
      if (response.statusCode == 200) {
        const bodyObj = JSON.parse(body);
        logger.logInfo("user service returned", bodyObj);
      }
      else{
        logger.logError(`error returned from splash_userservice ${response.statusCode} - ${body}.`);
        // user couldn't be found, prevent login by sending nulls
        done(err, null, null);
        return;
      }
      done(err, user, authInfo);
    });
  };
};
