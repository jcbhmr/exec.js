import { once } from "./utils.ts";
import * as process from "node:process";

void Deno;

const getLibc = once(() => {
  const libcName = (() => {
    switch (Deno.build.os) {
      case "darwin":
        return "libc.dylib";
      case "linux":
        return "libc.so.6";
      default:
        throw new DOMException(`${Deno.build.os} not supported`, "NotSupportedError");
    }
  })();
  return Deno.dlopen(libcName, {
    execve: {
      parameters: ["buffer", "pointer", "pointer"],
      result: "i32",
    },
  });
});

function stringsToCStringBlock(strings: string[]): Deno.PointerObject {
  const datas = strings.map((str) => new TextEncoder().encode(str + "\0"));
  const datasTotalByteLength = datas.reduce((acc, data) => acc + data.byteLength, 0);
  const ptrsByteLength = (datas.length + 1) * BigUint64Array.BYTES_PER_ELEMENT;
  const buffer = new ArrayBuffer(ptrsByteLength + datasTotalByteLength);
  const bufferPtr = Deno.UnsafePointer.of(buffer)!;
  const ptrsView = new BigUint64Array(buffer, 0, datas.length);
  const datasView = new Uint8Array(buffer, ptrsByteLength);
  let offset = 0;
  for (const [i, data] of datas.entries()) {
    const datasViewOfData = new Uint8Array(
      datasView.buffer,
      datasView.byteOffset + offset,
      data.byteLength,
    );
    datasViewOfData.set(data);
    offset += data.byteLength;
    ptrsView[i] = Deno.UnsafePointer.value(Deno.UnsafePointer.of(datasViewOfData));
  }
  return bufferPtr;
}

export default function processExecve(
  file: string,
  argv: string[] = [],
  env: NodeJS.ProcessEnv = {},
): never {
  const libc = getLibc();
  const envv = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  const fileBuffer = new TextEncoder().encode(file + "\0");
  const argvBuffer = stringsToCStringBlock(argv);
  const envBuffer = stringsToCStringBlock(envv);
  libc.symbols.execve(fileBuffer, argvBuffer, envBuffer);
  console.error("execve failed");
  process.abort();
}
