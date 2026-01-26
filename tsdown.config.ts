import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/node.ts",
    "./src/deno.ts",
    "./src/bun.ts",
    "./src/index.node.ts",
    "./src/index.deno.ts",
    "./src/index.bun.ts",
  ],
  external: [/^#/, "bun", /^bun:/],
  fixedExtension: false,
  dts: true,
  inputOptions: {
    resolve: {
      conditionNames: ["development:@jcbhmr/exec"],
    },
  },
});
