import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "2nbsft",
  defaultCommandTimeout: 6000,
  experimentalStudio: true,
  chromeWebSecurity: false,
  env: {
    GITLAB_PROVIDER: "dev.renku.ch",
    USER: "",
    USE_FIXTURES: true,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require("./cypress/plugins/index.ts")(on, config);
    },
    baseUrl: "https://dev.renku.ch/",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
});
