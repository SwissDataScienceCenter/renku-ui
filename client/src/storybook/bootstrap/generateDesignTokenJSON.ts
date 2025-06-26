import * as fs from "fs";
import { ExtractedVariables, renderSync } from "sass-extract";

const sassFile = "./src/styles/renku_bootstrap.scss";

function extractSassVariables() {
  return renderSync({
    file: sassFile,
  });
}

function formatShadowValue(
  shadowArray: any[] | undefined
): string | "NotFound" {
  //eslint-disable-line
  const valueNotFound = "NotFound";
  if (!shadowArray || !Array.isArray(shadowArray)) {
    return valueNotFound;
  }

  const shadowParts: string[] = [];

  shadowArray.forEach((part) => {
    if (part.type === "SassNumber") {
      shadowParts.push(`${part.value}${part.unit}`);
    } else if (part.type === "SassColor") {
      const { r, g, b, a } = part.value;
      shadowParts.push(`rgba(${r}, ${g}, ${b}, ${a})`);
    }
  });
  return shadowParts.join(" ");
}

function mapVariablesToTokens(allTokens: ExtractedVariables) {
  //eslint-disable-next-line
  const globalVars = (allTokens as Record<string, any>).vars.global || {};
  const valueNotFound = "NotFound";
  return {
    //eslint-disable-next-line
    $figmaStyle: "true",
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
        gray: { value: globalVars["$gray-600"]?.value.hex ?? valueNotFound }, // Adjusted to match JSON example
        "gray-dark": {
          value: globalVars["$gray-800"]?.value.hex ?? valueNotFound,
        }, // Adjusted to match JSON example
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
      text: {
        "text-primary": {
          value: globalVars["$primary"]?.value.hex ?? valueNotFound,
        },
        "text-secondary": {
          value: globalVars["$secondary"]?.value.hex ?? valueNotFound,
        },
        "text-success": {
          value: globalVars["$success"]?.value.hex ?? valueNotFound,
        },
        "text-info": { value: globalVars["$info"]?.value.hex ?? valueNotFound },
        "text-warning": {
          value: globalVars["$warning"]?.value.hex ?? valueNotFound,
        },
        "text-danger": {
          value: globalVars["$danger"]?.value.hex ?? valueNotFound,
        },
        "text-light": {
          value: globalVars["$light"]?.value.hex ?? valueNotFound,
        },
        "text-dark": { value: globalVars["$dark"]?.value.hex ?? valueNotFound },
        "text-body": {
          value: globalVars["$body-color"]?.value.hex ?? valueNotFound,
        },
        "text-muted": {
          value: globalVars["$secondary"]?.value.hex ?? valueNotFound,
        },
        "text-white": {
          value: globalVars["$white"]?.value.hex ?? valueNotFound,
        },
        "text-black-50": { value: "rgba(0, 0, 0, 0.5)" },
        "text-white-50": { value: "rgba(255, 255, 255, 0.5)" },
        "text-primary-emphasis": {
          value:
            globalVars["$primary-text-emphasis"]?.value.hex ?? valueNotFound,
        },
        "text-secondary-emphasis": {
          value:
            globalVars["$secondary-text-emphasis"]?.value.hex ?? valueNotFound,
        },
        "text-success-emphasis": {
          value:
            globalVars["$success-text-emphasis"]?.value.hex ?? valueNotFound,
        },
        "text-info-emphasis": {
          value: globalVars["$info-text-emphasis"]?.value.hex ?? valueNotFound,
        },
        "text-warning-emphasis": {
          value:
            globalVars["$warning-text-emphasis"]?.value.hex ?? valueNotFound,
        },
        "text-danger-emphasis": {
          value:
            globalVars["$danger-text-emphasis"]?.value.hex ?? valueNotFound,
        },
        "text-light-emphasis": {
          value: globalVars["$light-text-emphasis"]?.value.hex ?? valueNotFound,
        },
        "text-dark-emphasis": {
          value: globalVars["$dark-text-emphasis"]?.value.hex ?? valueNotFound,
        },
      },
      background: {
        "bg-primary-subtle": {
          value: globalVars["$primary-bg-subtle"]?.value.hex ?? valueNotFound,
        },
        "bg-secondary-subtle": {
          value: globalVars["$secondary-bg-subtle"]?.value.hex ?? valueNotFound,
        },
        "bg-success-subtle": {
          value: globalVars["$success-bg-subtle"]?.value.hex ?? valueNotFound,
        },
        "bg-info-subtle": {
          value: globalVars["$info-bg-subtle"]?.value.hex ?? valueNotFound,
        },
        "bg-warning-subtle": {
          value: globalVars["$warning-bg-subtle"]?.value.hex ?? valueNotFound,
        },
        "bg-danger-subtle": {
          value: globalVars["$danger-bg-subtle"]?.value.hex ?? valueNotFound,
        },
        "bg-light-subtle": {
          value: globalVars["$light-bg-subtle"]?.value.hex ?? valueNotFound,
        },
        "bg-dark-subtle": {
          value: globalVars["$dark-bg-subtle"]?.value.hex ?? valueNotFound,
        },
      },
      border: {
        "border-primary-subtle": {
          value:
            globalVars["$primary-border-subtle"]?.value.hex ?? valueNotFound,
        },
        "border-secondary-subtle": {
          value:
            globalVars["$secondary-border-subtle"]?.value.hex ?? valueNotFound,
        },
        "border-success-subtle": {
          value:
            globalVars["$success-border-subtle"]?.value.hex ?? valueNotFound,
        },
        "border-info-subtle": {
          value: globalVars["$info-border-subtle"]?.value.hex ?? valueNotFound,
        },
        "border-warning-subtle": {
          value:
            globalVars["$warning-border-subtle"]?.value.hex ?? valueNotFound,
        },
        "border-danger-subtle": {
          value:
            globalVars["$danger-border-subtle"]?.value.hex ?? valueNotFound,
        },
        "border-light-subtle": {
          value: globalVars["$light-border-subtle"]?.value.hex ?? valueNotFound,
        },
        "border-dark-subtle": {
          value: globalVars["$dark-border-subtle"]?.value.hex ?? valueNotFound,
        },
      },
      "link colors": {
        "link-color": {
          value: globalVars["$link-color"]?.value.hex ?? valueNotFound,
        },
        "link-hover-color": {
          value: globalVars["$link-hover-color"]?.value.hex ?? valueNotFound,
        },
      },
      "border-color": {
        value: globalVars["$border-color"]?.value.hex ?? valueNotFound,
      },
      "form colors": {
        "valid-color": {
          value: globalVars["$form-valid-color"]?.value.hex ?? valueNotFound,
        },
        "valid-border-color": {
          value:
            globalVars["$form-valid-border-color"]?.value.hex ?? valueNotFound,
        },
        "invalid-color": {
          value: globalVars["$form-invalid-color"]?.value.hex ?? valueNotFound,
        },
        "invalid-border-color": {
          value:
            globalVars["$form-invalid-border-color"]?.value.hex ??
            valueNotFound,
        },
      },
      "other colors": {
        "code-color": {
          value: globalVars["$code-color"]?.value.hex ?? valueNotFound,
        },
        "highlight-color": {
          value: globalVars["$mark-color"]?.value.hex ?? valueNotFound,
        }, // Assuming mark-color from extracted vars
        "highlight-bg": {
          value: globalVars["$mark-bg"]?.value.hex ?? valueNotFound,
        },
      },
    },
    spacing: {
      "spacing-0": {
        value: "0px",
        type: "spacing",
        description: "No spacing",
        extensions: {
          px: "0px",
        },
      },
      "spacing-1": {
        value: `${globalVars["$spacers"]?.value[1]?.value}rem` ?? valueNotFound,
        type: "spacing",
        description: "Extra small spacing",
        extensions: {
          px:
            `${parseFloat(globalVars["$spacers"]?.value[1]?.value) * 16}px` ??
            valueNotFound,
        },
      },
      "spacing-2": {
        value: `${globalVars["$spacers"]?.value[2]?.value}rem` ?? valueNotFound,
        type: "spacing",
        description: "Small spacing",
        extensions: {
          px:
            `${parseFloat(globalVars["$spacers"]?.value[2]?.value) * 16}px` ??
            valueNotFound,
        },
      },
      "spacing-3": {
        value: `${globalVars["$spacers"]?.value[3]?.value}rem` ?? valueNotFound,
        type: "spacing",
        description: "Medium spacing",
        extensions: {
          px:
            `${parseFloat(globalVars["$spacers"]?.value[3]?.value) * 16}px` ??
            valueNotFound,
        },
      },
      "spacing-4": {
        value: `${globalVars["$spacers"]?.value[4]?.value}rem` ?? valueNotFound,
        type: "spacing",
        description: "Large spacing",
        extensions: {
          px:
            `${parseFloat(globalVars["$spacers"]?.value[4]?.value) * 16}px` ??
            valueNotFound,
        },
      },
      "spacing-5": {
        value: `${globalVars["$spacers"]?.value[1]?.value}rem` ?? valueNotFound,
        type: "spacing",
        description: "Extra large spacing",
        extensions: {
          px:
            `${parseFloat(globalVars["$spacers"]?.value[5]?.value) * 16}px` ??
            valueNotFound,
        },
      },
    },
    typography: {
      "body-font-family": {
        value: globalVars["$font-family-base"]?.value ?? valueNotFound,
      },
      "body-font-size": {
        value: `${globalVars["$font-size-base"]?.value}rem` ?? valueNotFound,
        px:
          globalVars["$font-size-base"]?.unit === "rem"
            ? `${parseFloat(globalVars["$font-size-base"]?.value) * 16}px`
            : valueNotFound, // Convert rem to px
      },
      "body-font-weight": {
        value: globalVars["$font-weight-normal"]?.value ?? valueNotFound,
      },
      "body-line-height": {
        value: globalVars["$line-height-base"]?.value ?? valueNotFound,
      },
    },
    borderRadius: {
      "rounded-0": {
        value: "0rem",
        type: "borderRadius",
        description: "No border radius",
        extensions: {
          px: "0px",
        },
      },
      "rounded-1": {
        value: `${globalVars["$border-radius-sm"]?.value}rem` ?? valueNotFound,
        type: "borderRadius",
        description: "Extra small border radius",
        extensions: {
          px:
            `${parseFloat(globalVars["$border-radius-sm"]?.value) * 16}px` ??
            valueNotFound,
        },
      },
      "rounded-2": {
        value: `${globalVars["$border-radius"]?.value}rem` ?? valueNotFound,
        type: "borderRadius",
        description: "Small border radius",
        extensions: {
          px:
            `${parseFloat(globalVars["$border-radius"]?.value) * 16}px` ??
            valueNotFound,
        },
      },
      "rounded-3": {
        value: `${globalVars["$border-radius-lg"]?.value}rem` ?? valueNotFound,
        type: "borderRadius",
        description: "Medium border radius",
        extensions: {
          px:
            `${parseFloat(globalVars["$border-radius-lg"]?.value) * 16}px` ??
            valueNotFound,
        },
      },
      "rounded-circle": {
        value: "50%" ?? valueNotFound, // Assuming 50% for circle
        type: "borderRadius",
        description: "Perfect circle border radius",
      },
      "rounded-pill": {
        value:
          `${globalVars["$border-radius-pill"]?.value}rem` ?? valueNotFound,
        type: "borderRadius",
        description: "Fully rounded pill shape",
        extensions: {
          px:
            `${parseFloat(globalVars["$border-radius-pill"]?.value) * 16}px` ??
            valueNotFound,
        },
      },
    },
    shadow: {
      shadow: { value: formatShadowValue(globalVars["$box-shadow"]?.value) },
      "shadow-sm": {
        value: formatShadowValue(globalVars["$box-shadow-sm"]?.value),
      },
      "shadow-lg": {
        value: formatShadowValue(globalVars["$box-shadow-lg"]?.value),
      },
      "shadow-inset": {
        value: `inset ${formatShadowValue(
          globalVars["$box-shadow-inset"]?.value
        )}`,
      },
    },
    opacity: {
      "bg-opacity-0": {
        value: "0",
        type: "opacity",
      },
      "bg-opacity-25": {
        value: "0.25",
        type: "opacity",
      },
      "bg-opacity-50": {
        value: "0.5",
        type: "opacity",
      },
      "bg-opacity-75": {
        value: "0.75",
        type: "opacity",
      },
      "bg-opacity-100": {
        value: "1",
        type: "opacity",
      },
    },
    border: {
      "border-width": {
        value: globalVars["$border-width"]?.value ?? valueNotFound,
      },
      "border-style": {
        value: globalVars["$border-style"]?.value ?? valueNotFound,
      },
    },
    "font sizes": {
      "fs-1": {
        value: `${globalVars["$h1-font-size"]?.value}rem` ?? valueNotFound,
        px:
          globalVars["$h1-font-size"]?.unit === "rem"
            ? `${parseFloat(globalVars["$h1-font-size"]?.value) * 16}px`
            : valueNotFound,
        type: "fontSizes",
      },
      "fs-2": {
        value: `${globalVars["$h2-font-size"]?.value}rem` ?? valueNotFound,
        px:
          globalVars["$h2-font-size"]?.unit === "rem"
            ? `${parseFloat(globalVars["$h2-font-size"]?.value) * 16}px`
            : valueNotFound,
        type: "fontSizes",
      },
      "fs-3": {
        value: `${globalVars["$h3-font-size"]?.value}rem` ?? valueNotFound,
        px:
          globalVars["$h3-font-size"]?.unit === "rem"
            ? `${parseFloat(globalVars["$h3-font-size"]?.value) * 16}px`
            : valueNotFound,
        type: "fontSizes",
      },
      "fs-4": {
        value: `${globalVars["$h4-font-size"]?.value}rem` ?? valueNotFound,
        px:
          globalVars["$h4-font-size"]?.unit === "rem"
            ? `${parseFloat(globalVars["$h4-font-size"]?.value) * 16}px`
            : valueNotFound,
        type: "fontSizes",
      },
      "fs-5": {
        value: `${globalVars["$h5-font-size"]?.value}rem` ?? valueNotFound,
        px:
          globalVars["$h5-font-size"]?.unit === "rem"
            ? `${parseFloat(globalVars["$h5-font-size"]?.value) * 16}px`
            : valueNotFound,
        type: "fontSizes",
      },
      "fs-6": {
        value: `${globalVars["$h6-font-size"]?.value}rem` ?? valueNotFound,
        px:
          globalVars["$h1-font-size"]?.unit === "rem"
            ? `${parseFloat(globalVars["$h1-font-size"]?.value) * 16}px`
            : valueNotFound,
        type: "fontSizes",
      },
    },
    lineHeight: {
      "1": {
        value: 1,
        type: "lineHeight",
        description: "Tight line height (Bootstrap lh-1)",
        extensions: {
          px: "16px", // Assuming base font size of 16px
          rem: "1rem",
        },
      },
      sm: {
        value: globalVars["$line-height-sm"]?.value ?? valueNotFound,
        type: "lineHeight",
        description: "Small line height (Bootstrap lh-sm)",
        extensions: {
          px:
            `${parseFloat(globalVars["$line-height-sm"]?.value) * 16}px` ??
            valueNotFound,
          rem: globalVars["$line-height-sm"]?.value ?? valueNotFound,
        },
      },
      base: {
        value: globalVars["$line-height-base"]?.value ?? valueNotFound,
        type: "lineHeight",
        description: "Base/default line height (Bootstrap lh-base)",
        extensions: {
          px:
            `${parseFloat(globalVars["$line-height-base"]?.value) * 16}px` ??
            valueNotFound,
          rem: globalVars["$line-height-base"]?.value ?? valueNotFound,
        },
      },
      lg: {
        value: globalVars["$line-height-lg"]?.value ?? valueNotFound,
        type: "lineHeight",
        description: "Large line height (Bootstrap lh-lg)",
        extensions: {
          px:
            `${parseFloat(globalVars["$line-height-lg"]?.value) * 16}px` ??
            valueNotFound,
          rem: globalVars["$line-height-lg"]?.value ?? valueNotFound,
        },
      },
    },
  };
}

async function generateTokens() {
  try {
    const vars = extractSassVariables();
    const tokens = mapVariablesToTokens(vars);
    fs.writeFileSync(
      //eslint-disable-next-line
      "src/styles/figma-design-tokens.json",
      JSON.stringify(tokens, null, 2),
      //eslint-disable-next-line
      "utf8"
    );
    //eslint-disable-next-line
    console.log("Design tokens JSON generated successfully.");
  } catch (err) {
    //eslint-disable-next-line
    console.error("Error generating design tokens:", err);
  }
}

generateTokens();
