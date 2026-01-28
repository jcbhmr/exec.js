#!/usr/bin/env node
import * as process from "node:process";
import exec from "../src/index.ts";

const noFileArgNames = ["--eval", "-e", "--print", "-p"];
const noFile = noFileArgNames.some((name) => process.execArgv.includes(name));
const args = process.argv.slice(noFile ? 1 : 2);

exec("node", args);
