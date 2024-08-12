// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

// Paths to the OpenAPI Generator config files
const configPaths = {
  typescript: ".github/openapi/typescript-config.json",
  python: ".github/openapi/python-config.json",
};

// Function to read and parse JSON files
const readJsonFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

// Function to write JSON objects to files
const writeJsonFile = (filePath, jsonObject) => {
  fs.writeFileSync(filePath, JSON.stringify(jsonObject, null, 2), "utf8");
};

// Get the version from the root package.json
const packageJson = readJsonFile("package.json");
const packageVersion = packageJson.version;

for (const [key, configFilePath] of Object.entries(configPaths)) {
  const configJson = readJsonFile(configFilePath);

  // Update the relevant version field
  switch (key) {
    case "typescript":
      configJson.npmVersion = packageVersion;
      break;
    case "python":
      configJson.packageVersion = packageVersion;
      break;
  }

  // Write the updated config back to the file
  writeJsonFile(configFilePath, configJson);
}

console.log(`Updated configs with version: ${packageVersion}`);
