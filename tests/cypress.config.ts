import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    USE_FIXTURES: true,
  },

  video: false,
  viewportWidth: 1600,
  viewportHeight: 1200,

  e2e: {
    // setupNodeEvents(on, config) {
    //   return require("./cypress/plugins/index.ts")(on, config);
    // },
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
});
