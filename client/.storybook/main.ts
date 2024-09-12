import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
    "@storybook/react-vite",
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
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
  // This adjusts Vite build options to preserve class and function names when building for production.
  viteFinal: async (config, { configType }) => {
    if (configType === "PRODUCTION") {
      config.build = {
        ...config.build,
        minify: "esbuild",
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      };
      config.esbuild = {
        keepNames: true,
      };
    }
    return config;
  },
};

export default config;
