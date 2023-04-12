import { spawnSync } from "child_process";
import { defineConfig } from "cypress";

const findChromium = () => {
  const chromiumPath =
    "/home/leafty/.local/share/flatpak/exports/bin/org.chromium.Chromium";
  const versionStdOut = spawnSync(chromiumPath, ["--version"], {
    encoding: "utf-8",
  }).stdout;
  const [, version] = /Chromium (\d+\.\d+\.\d+\.\d+)/.exec(versionStdOut);
  const majorVersion = parseInt(version.split(".")[0]);

  return {
    name: "chromium",
    channel: "stable",
    family: "chromium",
    displayName: "Chromium",
    version,
    path: chromiumPath,
    majorVersion,
    isHeaded: true,
    isHeadless: false,
  } as const;
};

export default defineConfig({
  env: {
    USE_FIXTURES: true,
  },

  video: false,
  viewportWidth: 1600,
  viewportHeight: 1200,

  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    setupNodeEvents(_on, config) {
      const chromium = findChromium();
      return {
        ...config,
        browsers: [...config.browsers, chromium],
      };
    },
  },
});
