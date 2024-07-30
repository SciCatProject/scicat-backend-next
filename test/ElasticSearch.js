/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

const { faker } = require("@faker-js/faker");
const utils = require("./LoginUtils");
const { TestData } = require("./TestData");
require("dotenv").config();

let accessTokenAdminIngestor = null;
let accessTokenArchiveManager = null;
let pid = null;
const isESenabled = process.env.ELASTICSEARCH_ENABLED == "yes";

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

const scientificMetadata = (values) => {
  const scientificQuery = values.map((value) => {
    return {
      lhs: value.lhs,
      relation: value.relation,
      rhs: value.rhs,
      unit: value.unit,
    };
  });

  return {
    scientific: scientificQuery,
  };
};

(isESenabled ? describe : describe.skip)(
  "ElastiSearch: CRUD, filtering and search test case",
  () => {
    before(() => {
      db.collection("Dataset").deleteMany({});
    });
    beforeEach(async() => {
      accessTokenAdminIngestor = await utils.getToken(appUrl, {
        username: "adminIngestor",
        password: TestData.Accounts["adminIngestor"]["password"],
      });
  
      accessTokenArchiveManager = await utils.getToken(appUrl, {
        username: "archiveManager",
        password: TestData.Accounts["archiveManager"]["password"],
      });
    });

    it("0010: adds a new raw dataset with scientificMetadata", async () => {
      return request(appUrl)
        .post("/api/v3/Datasets")
        .send(TestData.ScientificMetadataForElasticSearch)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.EntryCreatedStatusCode)
        .expect("Content-Type", /json/)
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
    });

    it("0020: should fetch dataset with correct unitSI and ValueSI condition for scientific filter", async () => {
      return request(appUrl)
        .post("/api/v3/elastic-search/search")
        .send(
          scientificMetadata([
            {
              lhs: scientificMetadataFieldName.unitAndValue,
              relation: Relation.GREATER_THAN,
              rhs: 99,
              unit: "m",
            },
            {
              lhs: scientificMetadataFieldName.unitAndValue,
              relation: Relation.EQUAL_TO_NUMERIC,
              rhs: 100,
              unit: "m",
            },
            {
              lhs: scientificMetadataFieldName.unitAndValue,
              relation: Relation.LESS_THAN,
              rhs: 101,
              unit: "m",
            },
          ]),
        )
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulPostStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.data.should.include(decodeURIComponent(pid));
        });
    });

    it("0021: should fetch dataset with correct numeric value for scientific filter", async () => {
      return request(appUrl)
        .post("/api/v3/elastic-search/search")
        .send(
          scientificMetadata([
            {
              lhs: scientificMetadataFieldName.number,
              relation: Relation.EQUAL_TO_NUMERIC,
              rhs: 111,
              unit: "",
            },
          ]),
        )
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulPostStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.data.should.include(decodeURIComponent(pid));
        });
    });

    it("0022: should fetch dataset with correct string value for the scientific filter", async () => {
      return request(appUrl)
        .post("/api/v3/elastic-search/search")
        .send(
          scientificMetadata([
            {
              lhs: scientificMetadataFieldName.string,
              relation: Relation.EQUAL_TO_STRING,
              rhs: "222",
              unit: "",
            },
          ]),
        )
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulPostStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.data.should.include(decodeURIComponent(pid));
        });
    });

    it("0023: should fail when fetching dataset with incorrect relation type and value type for the scientific filter", async () => {
      return request(appUrl)
        .post("/api/v3/elastic-search/search")
        .send(
          scientificMetadata([
            {
              lhs: scientificMetadataFieldName.number,
              relation: Relation.EQUAL_TO_NUMERIC,
              rhs: "111",
              unit: "",
            },
          ]),
        )
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulPostStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.data.should.be.length(0);
        });
    });

    it("0030: should fetching dataset with correct proposalId and size", async () => {
      return request(appUrl)
        .post("/api/v3/elastic-search/search")
        .send({
          proposalId: TestData.ScientificMetadataForElasticSearch.proposalId,
          size: TestData.ScientificMetadataForElasticSearch.size,
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulPostStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.data.should.include(decodeURIComponent(pid));
        });
    });

    it("0031: should fail fetching dataset with correct proposalId but wrong size", async () => {
      return request(appUrl)
        .post("/api/v3/elastic-search/search")
        .send({
          proposalId: TestData.ScientificMetadataForElasticSearch.proposalId,
          size: faker.number.int({ min: 100000001, max: 100400000 }),
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulPostStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.data.should.be.length(0);
        });
    });
    it("0032: should fail fetching dataset with wrong proposalId but correct size", async () => {
      return request(appUrl)
        .post("/api/v3/elastic-search/search")
        .send({
          proposalId: "wrongProposalId",
          size: TestData.ScientificMetadataForElasticSearch.size,
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulPostStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.data.should.be.length(0);
        });
    });

    it("0033: should fail fetching dataset with incorrect proposalId and size", async () => {
      return request(appUrl)
        .post("/api/v3/elastic-search/search")
        .send({
          proposalId: "wrongProposalId",
          size: faker.number.int({ min: 100000001, max: 100400000 }),
        })
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenAdminIngestor}` })
        .expect(TestData.SuccessfulPostStatusCode)
        .expect("Content-Type", /json/)
        .then((res) => {
          res.body.data.should.be.length(0);
        });
    });

    it("0034: should delete this raw dataset", async () => {
      return request(appUrl)
        .delete("/api/v3/datasets/" + pid)
        .set("Accept", "application/json")
        .set({ Authorization: `Bearer ${accessTokenArchiveManager}` })
        .expect(TestData.SuccessfulDeleteStatusCode)
        .expect("Content-Type", /json/);
    });
  },
);
