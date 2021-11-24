// ? Craco allows to use create-react-app with custom configurations for webpack and other sub-libraries
// ? REF: https://github.com/gsoft-inc/craco

// get the commit short hash
const commitHash = require("child_process")
  .execSync("echo $RENKU_UI_SHORT_SHA")
  .toString()
  .trim();
const version = commitHash ?
  commitHash :
  "dev";

module.exports = {
  webpack: {
    configure: {
      output: {
        filename: `[name].[hash]-${version}.js`,
        chunkFilename: `[name].[hash]-${version}.chunk.js`
      }
    }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "react-pdf/dist/esm/entry.webpack": "react-pdf/dist/umd/entry.jest",
      }
    }
  }
};
