module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "spellcheck"],
  rules: {
    "@typescript-eslint/interface-name-prefix": [
      "error",
      { prefixWithI: "always" }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn", { vars: "all", args: "none", ignoreRestSiblings: false }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/quotes": [
      "warn",
      "double",
      { allowTemplateLiterals: true, avoidEscape: true }
    ],
    "no-console": "warn",
    curly: ["warn", "multi-or-nest", "consistent"],
    eqeqeq: "error",
    "prefer-arrow-callback": "error",
    "max-len": ["warn", 120],
    "no-eval": "error",
    indent: ["warn", 2, {
      "ignoredNodes": ["TemplateLiteral"],
      "SwitchCase": 1
    }],
    semi: ["warn", "always"],
    "space-before-blocks": ["warn", "always"],
    "no-multi-spaces": "warn",
    "brace-style": ["warn", "stroustrup", {
      "allowSingleLine": true
    }],
    "max-nested-callbacks": ["warn", 3],
    "no-alert": "error",
    "no-else-return": "warn",
    "jest/expect-expect": "off",
    "comma-spacing": "warn",
    "block-spacing": ["warn", "always"],
    "key-spacing": "warn",
    "no-trailing-spaces": "warn",
    "object-curly-spacing": ["warn", "always"],
    "space-infix-ops": "warn",
    "space-unary-ops": ["warn", {
      "words": true,
      "nonwords": false
    }],
    "keyword-spacing": ["warn", {
      "before": true
    }],
    "no-multiple-empty-lines": ["warn", {
      "max": 2,
      "maxEOF": 1
    }],
"spellcheck/spell-checker": [
      "warn", {
        "identifiers": true,
        "comments": true,
        "strings": true,
        "minLength": 4,
        "skipIfMatch": [
          // Careful! This skips the entire JS node, better to avoid it.
        ],
        "skipWordIfMatch": [
          "http(s)?://[^s]*", // url
          "0x[0-9a-fx]{2,16}",// hex
        ],
        "skipWords": [
          "closable",
          "dataset",
          "datasets",
          "Jupyter",
          "namespace",
          "noreferrer",
          "noopener",
          "renku",
          "scrollbar",
          "svgstr"
        ]
      }
    ]
  },
  settings: {
    jsdoc: {
      mode: "typescript"
    },
    react: {
      version: "detect"
    }
  }
};
