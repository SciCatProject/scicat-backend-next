"use strict";

/* 
    A logingCallback is function used by passport that gives one a chance
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


module.exports.alsORCIDLoginCallback = function(req, done) {
  return function(err, user, identity, token) {
    var authInfo = {
      identity: identity,
    };
    if (token) {
      authInfo.accessToken = token;
    }
    // err = Error("can't login");
    // Intercept the saving of UserIdentity. This gives us the opportunity to query the user service
    // REST API for the user's group information. Once we get that, we append it to the user's
    // profile as 'accessGroups'.  


    // if (!ctx.data){
    //   logger.logInfo("No context data from UserIdentity");
    //   next();
    //   return;
    // }
    var request = require('request');
    const requestURL = `${process.env.USER_SVC_API_URL}${identity.profile._json.sub}/orcid?api_key=${process.env.USER_SVC_API_KEY}`;
    request(requestURL, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const bodyObj = JSON.parse(body);
        if (bodyObj.groups){
          identity.profile.accessGroups = bodyObj.groups;
        }
        else{
          logger.logInfo("user service returned", body);
        }
      }
      else{
        logger.logInfo(`error talking to splash_userservice ${response.statusCode} - ${body}.`);
        done(err, null, null);
        return;
      }
      done(err, user, authInfo);
    });
  };
};
