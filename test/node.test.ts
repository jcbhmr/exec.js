import test from "node:test";
import assert from "node:assert/strict";
import * as execa from "execa";
import * as url from "node:url";

test("node exec works", async () => {
  const { stdout: expected } = await execa.$`node --version`;

  const { stdout: actual } =
    await execa.$`node --conditions development:@jcbhmr/exec ${url.fileURLToPath(import.meta.resolve("./.nodewrapper.ts"))} --version`;

  assert.deepEqual(actual, expected);
});

test("deno exec works", async () => {
  const { stdout: expected } = await execa.$`node --version`;

  const { stdout: actual } =
    await execa.$`deno --allow-all --conditions development:@jcbhmr/exec ${url.fileURLToPath(import.meta.resolve("./.nodewrapper.ts"))} --version`;

  assert.deepEqual(actual, expected);
});

test("bun exec works", async () => {
  const { stdout: expected } = await execa.$`node --version`;

  const { stdout: actual } =
    await execa.$`bun --conditions development:@jcbhmr/exec ${url.fileURLToPath(import.meta.resolve("./.nodewrapper.ts"))} --version`;

  assert.deepEqual(actual, expected);
});
