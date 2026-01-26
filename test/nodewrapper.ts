#!/usr/bin/env node
import * as process from "node:process";
import * as node from "../src/node.ts";

const noFileArgNames = ["--eval", "-e", "--print", "-p"];
const noFile = noFileArgNames.some((name) => process.execArgv.includes(name));
const args = process.argv.slice(noFile ? 1 : 2);
node.exec("node", args);
