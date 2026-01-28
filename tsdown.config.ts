import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "./src/index.ts",
    "./src/process-execve.node.ts",
    "./src/process-execve.deno.ts",
    "./src/process-execve.bun.ts",
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
