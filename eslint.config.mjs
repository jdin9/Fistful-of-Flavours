import { tsProcessorPlugin } from "./lib/eslint/tsProcessor.js";

const sharedGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  console: "readonly",
  fetch: "readonly",
  Request: "readonly",
  Response: "readonly",
  Headers: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  process: "readonly",
  Buffer: "readonly",
  module: "readonly",
  require: "readonly",
  globalThis: "readonly",
  crypto: "readonly"
};

const languageOptions = {
  ecmaVersion: 2022,
  sourceType: "module",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  globals: sharedGlobals
};

const baseRules = {
  "arrow-body-style": ["error", "as-needed"],
  eqeqeq: ["error", "smart"],
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "no-undef": "error",
  "no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_"
    }
  ],
  "object-shorthand": ["error", "always"],
  "prefer-const": "error"
};

const jsxAwareRules = {
  ...baseRules,
  "ts-lite/jsx-uses-vars": "error"
};

export default [
  {
    ignores: ["node_modules", ".next", "out", "dist", "coverage"]
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions,
    plugins: {
      "ts-lite": tsProcessorPlugin
    },
    rules: jsxAwareRules
  },
  {
    files: ["**/*.ts"],
    languageOptions,
    plugins: {
      "ts-lite": tsProcessorPlugin
    },
    processor: "ts-lite/typescript",
    rules: baseRules
  },
  {
    files: ["**/*.tsx"],
    languageOptions,
    plugins: {
      "ts-lite": tsProcessorPlugin
    },
    processor: "ts-lite/tsx",
    rules: jsxAwareRules
  }
];
