import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
    "@storybook/react-vite",
    // "addon-redux",
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: { builder: "@storybook/builder-vite" },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
      },
    },
  },
  docs: {
    autodocs: true,
  },

  async viteFinal(config) {
    return mergeConfig(config, {
      define: { "process.env": {} },
    });
  },
};

export default config;
