import { test, expect } from "bun:test";
import * as Bun from "bun";

test("exec works", async () => {
  const expected = await (async () => {
    const subprocess = Bun.spawn(["bun", "--version"], { stdout: "pipe" });
    return await subprocess.stdout!.text();
  })();

  const actual = await (async () => {
    const subprocess = Bun.spawn(
      ["bun", Bun.fileURLToPath(import.meta.resolve("./bunwrapper.ts")), "--version"],
      { stdout: "pipe" },
    );
    return await subprocess.stdout!.text();
  })();

  expect(actual).toBe(expected);
});
