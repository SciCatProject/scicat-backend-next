module.exports = {
  recursive: true,
  exit: true,
  timeout: 60000,
  file: ["./test/config/pretest.js"],
  "forbid-only": !!process.env.GITHUB_ACTIONS,
};
