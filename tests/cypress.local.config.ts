import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    USE_FIXTURES: true,
  },

  video: false,
  viewportWidth: 1600,
  viewportHeight: 1200,

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require("./cypress/plugins/index.ts")(on, config);
    },
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
});
