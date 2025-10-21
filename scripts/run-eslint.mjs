#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

function getGlobalNodePath() {
  const result = spawnSync("npm", ["root", "-g"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });

  if (result.status !== 0) {
    return "";
  }

  return result.stdout.trim();
}

const eslintArgs = process.argv.slice(2);
const defaultArgs = [
  "--max-warnings=0",
  "--no-error-on-unmatched-pattern",
  "app",
  "components",
  "lib",
  "pages",
  "src"
];

const args = eslintArgs.length > 0 ? eslintArgs : defaultArgs;
const env = { ...process.env };
const globalNodePath = getGlobalNodePath();

if (globalNodePath) {
  env.NODE_PATH = env.NODE_PATH
    ? `${globalNodePath}${path.delimiter}${env.NODE_PATH}`
    : globalNodePath;
}

const result = spawnSync("eslint", args, {
  stdio: "inherit",
  env
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
