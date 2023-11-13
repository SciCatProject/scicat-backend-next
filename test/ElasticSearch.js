/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const utils = require("./LoginUtils");
const { TestData } = require("./TestData");

let accessToken = null;
let accessTokenArchiveManager = null;
let pid = null;

const Relation = {
  GREATER_THAN: "GREATER_THAN",
  LESS_THAN: "LESS_THAN",
  EQUAL_TO_NUMERIC: "EQUAL_TO_NUMERIC",
  EQUAL_TO_STRING: "EQUAL_TO_STRING",
};

const scientificMetadataFieldName = {
  unitAndValue: "with_unit_and_value_si",
  number: "with_number",
  string: "with_string",
};

const scientificMetadata = ({
  lhs = "",
  relation = "",
  rhs = "",
  unit = "",
}) => {
  return {
    scientific: [
      {
        lhs,
        relation,
        rhs,
        unit,
      },
    ],
  };
};

describe("RawDataset: Raw Datasets", () => {
  beforeEach((done) => {
    utils.getToken(
      appUrl,
      {
        username: "ingestor",
        password: "aman",
      },
      (tokenVal) => {
        accessToken = tokenVal;
        utils.getToken(
          appUrl,
          {
            username: "archiveManager",
            password: "aman",
          },
          (tokenVal) => {
            accessTokenArchiveManager = tokenVal;
            done();
          },
        );
      },
    );
  });

  it("0010: adds a new raw dataset with scientificMetadata", function () {
    return request(appUrl)
      .post("/api/v3/Datasets")
      .send(TestData.ScientificMetadataForElasticSearch)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(res);
          }, 2000);
        });
      })
      .then((res) => {
        res.body.should.have
          .property("scientificMetadata")
          .which.is.an("object")
          .that.has.all.keys(
            scientificMetadataFieldName.unitAndValue,
            scientificMetadataFieldName.number,
            scientificMetadataFieldName.string,
          );
        pid = encodeURIComponent(res.body["pid"]);
      });
  }).timeout(5000);

  it("0020: should fetch dataset with unitSI and ValueSI condition filter", function () {
    request(appUrl)
      .post("/api/v3/elastic-search/search")
      .send(
        scientificMetadata({
          lhs: scientificMetadataFieldName.unitAndValue,
          relation: Relation.GREATER_THAN,
          rhs: 99,
          unit: "m",
        }),
      );

    request(appUrl)
      .post("/api/v3/elastic-search/search")
      .send(
        scientificMetadata({
          lhs: scientificMetadataFieldName.unitAndValue,
          relation: Relation.LESS_THAN,
          rhs: 101,
          unit: "m",
        }),
      );

    return request(appUrl)
      .post("/api/v3/elastic-search/search")
      .send(
        scientificMetadata({
          lhs: scientificMetadataFieldName.unitAndValue,
          relation: Relation.EQUAL_TO_NUMERIC,
          rhs: 100,
          unit: "m",
        }),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.data.should.include(decodeURIComponent(pid));
      });
  });
  it("0030: should fetch dataset with numeric value filter", async () => {
    return request(appUrl)
      .post("/api/v3/elastic-search/search")
      .send(
        scientificMetadata({
          lhs: scientificMetadataFieldName.number,
          relation: Relation.EQUAL_TO_NUMERIC,
          rhs: 111,
          unit: "",
        }),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.data.should.include(decodeURIComponent(pid));
      });
  });

  it("0040: should fetch dataset with string value filter", async () => {
    return request(appUrl)
      .post("/api/v3/elastic-search/search")
      .send(
        scientificMetadata({
          lhs: scientificMetadataFieldName.string,
          relation: Relation.EQUAL_TO_STRING,
          rhs: "222",
          unit: "",
        }),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.data.should.include(decodeURIComponent(pid));
      });
  });

  it("0050: should fail when fetching dataset with incorrect relation type and value type", async () => {
    return request(appUrl)
      .post("/api/v3/elastic-search/search")
      .send(
        scientificMetadata({
          lhs: scientificMetadataFieldName.number,
          relation: Relation.EQUAL_TO_NUMERIC,
          rhs: "111",
          unit: "",
        }),
      )
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        res.body.should.have
          .property("data")
          .which.is.an("array")
          .that.has.lengthOf(0);
      });
  });

  it("0060: should delete this raw dataset", async () => {
    return request(appUrl)
      .delete("/api/v3/datasets/" + pid)
      .set("Accept", "application/json")
      .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
      .expect(200)
      .expect("Content-Type", /json/);
  });
});
