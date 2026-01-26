#!/usr/bin/env bun
import * as Bun from "bun";
import * as process from "node:process";
import * as bun from "../src/bun.ts";

const noFileArgNames = ["--eval", "-e", "--print", "-p"];
const noFile = noFileArgNames.some((name) => process.execArgv.includes(name));
const args = Bun.argv.slice(noFile ? 1 : 2);
bun.exec(["bun", ...args]);
