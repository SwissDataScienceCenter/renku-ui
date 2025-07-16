import type { ConfigFile } from "@rtk-query/codegen-openapi";

enum Backends {
  Core = "Core",
  KnowledgeGraph = "KnowledgeGraph",
  Notebooks = "Notebooks",
}

// ? CUSTOMIZE THESE 2 LINES ? //
const targetDeplyoment = "dev.renku.ch";
const targetBackend = Backends.Notebooks;

const PREFIX = "https://";

const configDefaults = {
  apiFile: "./emptyTemplate.ts",
  apiImport: "emptySplitApi",
  hooks: true,
};
const BackendsConfig = {
  Core: {
    schemaFile: `${PREFIX}${targetDeplyoment}/api/renku/spec.json`,
    outputFile: "./coreApi.ts",
    exportName: "coreApi",
  },
  Notebooks: {
    schemaFile: `${PREFIX}${targetDeplyoment}/api/notebooks/spec.json`,
    outputFile: "./notebooksApi.ts",
    exportName: "notebooksApi",
  },
  KnowledgeGraph: {
    schemaFile: `${PREFIX}${targetDeplyoment}/api/kg/spec.json`,
    outputFile: "./knowledgeGraphApi.ts",
    exportName: "knowledgeGraphApi",
  },
};

const config: ConfigFile = {
  ...BackendsConfig[targetBackend],
  ...configDefaults,
};

export default config;
