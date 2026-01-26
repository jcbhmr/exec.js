import test from "node:test";
import assert from "node:assert/strict";
import * as execa from "execa";
import * as url from "node:url";

test("node exec works", async () => {
  const { stdout: expected } = await execa.$`node --version`;

  const { stdout: actual } =
    await execa.$`node ${url.fileURLToPath(import.meta.resolve("./nodewrapper.ts"))} --version`;

  assert.deepEqual(actual, expected);
});
