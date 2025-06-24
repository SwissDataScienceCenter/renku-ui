/// <reference path="../../types/sass-extract/index.d.ts" />

import * as fs from "fs";
import { ExtractedVariables, renderSync } from "sass-extract";
// Path to your main SASS entry file (adjust if needed)
const sassFile = "./src/styles/renku_bootstrap.scss";

function extractSassVariables() {
  const result: ExtractedVariables = renderSync({
    file: sassFile,
  });
  // Access the `global` property from the returned object
  return result;
}

function mapVariablesToTokens(vars: Record<string, any>) {
  // console.log("✨ ", vars.vars.global['$utilities-bg-subtle'])
  // console.log("✨✨ GRAYS", vars.vars.global['$grays'])
  const globalVars = vars.vars.global || {};
  const valueNotFound = "NotFound";
  return {
    color: {
      "brand colors": {
        primary: { value: globalVars["$primary"]?.value.hex ?? valueNotFound },
        secondary: {
          value: globalVars["$secondary"]?.value.hex ?? valueNotFound,
        },
        navy: { value: globalVars["$navy"]?.value.hex ?? valueNotFound },
      },
      "feedback colors": {
        success: { value: globalVars["$success"]?.value.hex ?? valueNotFound },
        info: { value: globalVars["$info"]?.value.hex ?? valueNotFound },
        warning: { value: globalVars["$warning"]?.value.hex ?? valueNotFound },
        danger: { value: globalVars["$danger"]?.value.hex ?? valueNotFound },
      },
      "body colors": {
        "body-color": {
          value: globalVars["$body-color"]?.value.hex ?? valueNotFound,
        },
        "body-bg": {
          value: globalVars["$body-bg"]?.value.hex ?? valueNotFound,
        },
      },
      grayscale: {
        white: { value: globalVars["$white"]?.value.hex ?? valueNotFound },
        light: { value: globalVars["$light"]?.value.hex ?? valueNotFound },
        dark: { value: globalVars["$dark"]?.value.hex ?? valueNotFound },
        gray: { value: globalVars["$gray-700"]?.value.hex ?? valueNotFound },
        "gray-dark": {
          value: globalVars["$gray-900"]?.value.hex ?? valueNotFound,
        },
        "gray-100": {
          value: globalVars["$gray-100"]?.value.hex ?? valueNotFound,
        },
        "gray-200": {
          value: globalVars["$gray-200"]?.value.hex ?? valueNotFound,
        },
        "gray-300": {
          value: globalVars["$gray-300"]?.value.hex ?? valueNotFound,
        },
        "gray-400": {
          value: globalVars["$gray-400"]?.value.hex ?? valueNotFound,
        },
        "gray-500": {
          value: globalVars["$gray-500"]?.value.hex ?? valueNotFound,
        },
        "gray-600": {
          value: globalVars["$gray-600"]?.value.hex ?? valueNotFound,
        },
        "gray-700": {
          value: globalVars["$gray-700"]?.value.hex ?? valueNotFound,
        },
        "gray-800": {
          value: globalVars["$gray-800"]?.value.hex ?? valueNotFound,
        },
        "gray-900": {
          value: globalVars["$gray-900"]?.value.hex ?? valueNotFound,
        },
        black: { value: globalVars["$black"]?.value.hex ?? valueNotFound },
      },
    },
  };
}

async function generateTokens() {
  try {
    const vars = extractSassVariables();
    const tokens = mapVariablesToTokens(vars);
    fs.writeFileSync(
      "design-tokens.json",
      JSON.stringify(tokens, null, 2),
      "utf8"
    );
    console.log("Design tokens JSON generated successfully.");
  } catch (err) {
    console.error("Error generating design tokens:", err);
  }
}

generateTokens();
