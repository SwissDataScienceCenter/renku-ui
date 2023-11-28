// ? Craco allows to use create-react-app with custom configurations for webpack and other sub-libraries
// ? REF: https://github.com/gsoft-inc/craco

// get the commit short hash
const commitHash = process.env.RENKU_UI_SHORT_SHA?.trim();
const version = commitHash ? commitHash : "dev";

const enableAnalyzer = process.argv.find((arg) => arg.trim() === "--analyze");
const BundleAnalyzerPlugin = enableAnalyzer
  ? require("webpack-bundle-analyzer").BundleAnalyzerPlugin
  : null;

module.exports = {
  webpack: {
    configure: {
      output: {
        filename: `[name].[fullhash]-${version}.js`,
        chunkFilename: `[name].[fullhash]-${version}.chunk.js`,
      },
    },
    plugins: {
      add: [
        ...(BundleAnalyzerPlugin != null ? [new BundleAnalyzerPlugin()] : []),
      ],
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "react-pdf/dist/esm/entry.webpack": "react-pdf/dist/umd/entry.jest",
      },
    },
  },
};
