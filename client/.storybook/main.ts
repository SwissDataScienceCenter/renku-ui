import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/react-vite",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: "storybook-vite.config.ts",
      },
    },
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
