import configuration from "./configuration";

describe("configuration", () => {
  beforeEach(() => {
    process.env = {};
  });

  it("should generate clientConfig with default client 'scicat'", () => {
    process.env.OIDC_SUCCESS_URL = "https://default-success-url.com";
    process.env.OIDC_RETURN_URL = "/datasets";

    const config = configuration();

    expect(config.oidc.clientConfig).toEqual({
      scicat: {
        successURL: "https://default-success-url.com",
        returnURL: "/datasets",
      },
    });
  });

  it("should generate clientConfig with additional clients from environment variables", () => {
    process.env.OIDC_FRONTEND_CLIENTS = "client1,client2";
    process.env.OIDC_CLIENT1_SUCCESS_URL = "https://client1-success-url.com";
    process.env.OIDC_CLIENT1_RETURN_URL = "/client1-homepage";
    process.env.OIDC_CLIENT2_SUCCESS_URL = "https://client2-success-url.com";
    process.env.OIDC_CLIENT2_RETURN_URL = "/client2-homepage";

    const config = configuration();

    expect(config.oidc.clientConfig).toEqual({
      scicat: {
        successURL: undefined,
        returnURL: undefined,
      },
      client1: {
        successURL: "https://client1-success-url.com",
        returnURL: "/client1-homepage",
      },
      client2: {
        successURL: "https://client2-success-url.com",
        returnURL: "/client2-homepage",
      },
    });
  });

  it("should deduplicate 'scicat' client if included in OIDC_FRONTEND_CLIENTS", () => {
    process.env.OIDC_FRONTEND_CLIENTS = "scicat,client1";
    process.env.OIDC_SUCCESS_URL = "https://default-success-url.com";
    process.env.OIDC_RETURN_URL = "/datasets";
    process.env.OIDC_CLIENT1_SUCCESS_URL = "https://client1-success-url.com";
    process.env.OIDC_CLIENT1_RETURN_URL = "/client1-homepage";

    const config = configuration();

    expect(config.oidc.clientConfig).toEqual({
      scicat: {
        successURL: "https://default-success-url.com",
        returnURL: "/datasets",
      },
      client1: {
        successURL: "https://client1-success-url.com",
        returnURL: "/client1-homepage",
      },
    });
  });
});
