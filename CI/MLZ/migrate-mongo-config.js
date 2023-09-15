// In this file you can configure migrate-mongo
//const MONGODB_URI = require("dotenv").config().parsed.MONGODB_URI;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Environment variable MONGODB_URI not set");
}

const lastSlashIndex = MONGODB_URI.lastIndexOf("/");
// NOTE: Get the database url and name from the MONGODB_URI and use them instead of defining new variables.
const DATABASE_URL = MONGODB_URI.substring(0, lastSlashIndex);
const DATABASE_NAME = MONGODB_URI.substring(lastSlashIndex + 1);

const config = {
  mongodb: {
    url: DATABASE_URL,

    databaseName: DATABASE_NAME,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: "commonjs",
};

module.exports = config;
