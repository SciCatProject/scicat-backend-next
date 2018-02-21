# Testing

Testing is handled by `Mocha` and uses `supertest`.

To run: `npm run test`.

## Set up

In the `test/config/settings.json` file, you should have the following fields:

```
{
    "baseURL": "http://localhost:3000/",
    "apiPrefix": "api/v2/",
    "admin": {
        "username": "<USER>",
        "password": "<PWD>"
    },
    "user": {
        "username": "<USER>",
        "password": "<PWD?"
    },
    "adminLogin": "Users/login",
    "userLogin": "auth/msad"
}
```

## Adding tests

This can be done one of two ways:

### Simple Tests

For simple tests, you can add it to the `test/config/tests.json` file. Each entry should have the following syntax:

```
{
    "method": "GET",
    "route": "Datasets?filter=%7B%22limit%22%3A10%7D",
    "expect": 200,
    "authenticate": "admin"
}
```

Authenticate can be user or admin, depending on the type of account you have specified.

If you include a `body` property, then that will be sent with the request.

If you include a `response` array, then the string content should be valid JS. Note that this uses the unsafe `eval` method so be careful!


### Writing Tests

If you have a chain of tests, or just tests that might be more complex, then you can write them in the `test` folder. See any `js` file in there for examples.