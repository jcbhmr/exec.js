import * as ffi from "bun:ffi";
import * as process from "node:process";
import * as utils from "./utils.ts";

type ExecOptionsStdio = "inherit" | undefined | null;

export interface ExecOptions {
  cwd?: string | undefined;
  env?: Record<string, string | undefined> | undefined;
  stdio?: ExecOptionsStdio | ExecOptionsStdio[] | undefined;
  stdin?: ExecOptionsStdio | undefined;
  stdout?: ExecOptionsStdio | undefined;
  stderr?: ExecOptionsStdio | undefined;
  uid?: number | undefined;
  gid?: number | undefined;
  argv0?: string | undefined;
}

const getLibcName = utils.once(() => {
  switch (process.platform) {
    case "darwin":
      return "libc.dylib";
    case "linux":
      return "libc.so.6";
    default:
      throw new DOMException(`${process.platform} not supported`, "NotSupportedError");
  }
});

const getLibc = utils.once(() =>
  ffi.dlopen(getLibcName(), {
    execvpe: {
      args: ["buffer", "ptr", "ptr"],
      returns: "i32",
    },
  }),
);

const getLibc2 = utils.once(() => {
  try {
    return ffi.dlopen(getLibcName(), {
      setuid: {
        args: ["u32"],
        returns: "i32",
      },
      setgid: {
        args: ["u32"],
        returns: "i32",
      },
    });
  } catch (error: any) {
    if (error?.code === "ERR_INVALID_ARG_TYPE") {
      // Symbol "${x}" not found in "${o}"
      return null;
    } else {
      throw error;
    }
  }
});

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

export function exec(options: ExecOptions & { cmd: string[] }): never;
export function exec(cmds: string[], options?: ExecOptions): never;
export function exec(
  cmdsOrOptions: string[] | (ExecOptions & { cmd: string[] }),
  optionsRaw?: ExecOptions,
): never {
  const [cmds, options] = Array.isArray(cmdsOrOptions)
    ? [cmdsOrOptions, optionsRaw ?? {}]
    : [cmdsOrOptions.cmd, cmdsOrOptions];
  const argv = [options.argv0 ?? cmds[0], ...cmds.slice(1)];
  const env = options.env ?? Bun.env;
  const libc = getLibc();
  const libc2 = getLibc2();
  const nameBuffer = new TextEncoder().encode(cmds[0] + "\0");
  const argvBuffer = stringsToCStringBlock(argv);
  const envBuffer = stringsToCStringBlock(
    Object.entries(env).map(([key, value]) => `${key}=${value}`),
  );
  // TODO: dup2 for stdio fd setup?
  try {
    if (options.gid != null) {
      libc2?.symbols.setgid(options.gid);
    }
    if (options.uid != null) {
      libc2?.symbols.setuid(options.uid);
    }
    if (options.cwd != null) {
      process.chdir(options.cwd);
    }
    libc.symbols.execvpe(nameBuffer, argvBuffer, envBuffer);
    throw new Error("execvpe failed");
  } catch (error) {
    console.error(error);
    process.abort();
  }
}
