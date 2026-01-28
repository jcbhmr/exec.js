import * as ffi from "bun:ffi";
import * as process from "node:process";
import { once } from "./utils.ts";

const getLibcName = once(() => {
  switch (process.platform) {
    case "darwin":
      return "libc.dylib";
    case "linux":
      return "libc.so.6";
    default:
      throw new DOMException(`${process.platform} not supported`, "NotSupportedError");
  }
});

const getLibc = once(() =>
  ffi.dlopen(getLibcName(), {
    execve: {
      args: ["buffer", "ptr", "ptr"],
      returns: "i32",
    },
  }),
);

function stringsToCStringBlock(strings: string[]): ffi.Pointer {
  const datas = strings.map((str) => new TextEncoder().encode(str + "\0"));
  const datasTotalByteLength = datas.reduce((acc, data) => acc + data.byteLength, 0);
  const ptrsByteLength = (datas.length + 1) * BigUint64Array.BYTES_PER_ELEMENT;
  const buffer = new ArrayBuffer(ptrsByteLength + datasTotalByteLength);
  const bufferPtr = ffi.ptr(buffer);
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
    ptrsView[i] = BigInt(ffi.ptr(datasViewOfData));
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
  const envvBuffer = stringsToCStringBlock(envv);
  libc.symbols.execve(fileBuffer, argvBuffer, envvBuffer);
  throw new Error("execve failed");
}
