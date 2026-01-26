import assert from "node:assert/strict";
import * as url from "node:url";

Deno.test("Deno.Command exec", async () => {
  const expected = await (async () => {
    const command = new Deno.Command("deno", { args: ["--version"] });
    const output = await command.output();
    return output.stdout;
  })();

  const actual = await (async () => {
    const command = new Deno.Command("deno", {
      args: [
        "--allow-all",
        url.fileURLToPath(import.meta.resolve("./denowrapper.ts")),
        "--version",
      ],
    });
    const output = await command.output();
    return output.stdout;
  })();

  assert.deepEqual(actual, expected);
});
