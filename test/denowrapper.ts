#!/usr/bin/env -S deno --allow-all
import * as deno from "../src/deno.ts";

const command = new deno.Command("deno", { args: Deno.args });
command.exec()
