module.exports = {
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testRegex: "tests/.*\\.(test|spec)?\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["text"]
};
