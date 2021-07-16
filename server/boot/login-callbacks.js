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
