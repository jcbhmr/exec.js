import * as url from "node:url";
import * as process from "node:process";
import * as utils from "./utils.ts";

void Deno;

const getLibcName = utils.once(() => {
  switch (Deno.build.os) {
    case "darwin":
      return "libc.dylib";
    case "linux":
      return "libc.so.6";
    default:
      throw new DOMException(`${Deno.build.os} not supported`, "NotSupportedError");
  }
});
const getLibc = utils.once(() =>
  Deno.dlopen(getLibcName(), {
    execvpe: {
      parameters: ["buffer", "pointer", "pointer"],
      result: "i32",
    },
    setuid: {
      optional: true,
      parameters: ["u32"],
      result: "i32",
    },
    setgid: {
      optional: true,
      parameters: ["u32"],
      result: "i32",
    },
  }),
);

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

export class Command extends Deno.Command {
  #command: string | URL;
  #options: Deno.CommandOptions | undefined;
  constructor(command: string | URL, options?: Deno.CommandOptions) {
    super(command, options);
    this.#command = command;
    this.#options = options;
  }

  exec(): never {
    const args = this.#options?.args ?? [];
    const name = toPath(this.#command);
    const argv = [name, ...args];
    const env =
      (this.#options?.clearEnv ?? false)
        ? (this.#options?.env ?? {})
        : { ...Deno.env.toObject(), ...this.#options?.env };
    const libc = getLibc();
    const nameBuffer = new TextEncoder().encode(name + "\0");
    const argvBuffer = stringsToCStringBlock(argv);
    const envBuffer = stringsToCStringBlock(
      Object.entries(env).map(([key, value]) => `${key}=${value}`),
    );
    // TODO: dup2 for stdio fd setup?
    try {
      if (this.#options?.gid != null) {
        libc.symbols.setgid?.(this.#options.gid);
      }
      if (this.#options?.uid != null) {
        libc.symbols.setuid?.(this.#options.uid);
      }
      if (this.#options?.cwd != null) {
        Deno.chdir(toPath(this.#options.cwd));
      }
      libc.symbols.execvpe(nameBuffer, argvBuffer, envBuffer);
      throw new Error("execvpe failed");
    } catch (error) {
      console.error(error);
      process.abort();
    }
  }
}

function toPath(path: string | URL): string {
  if (typeof path === "string") {
    return path;
  } else if (path instanceof URL) {
    return url.fileURLToPath(path);
  } else {
    throw new TypeError("path not string | URL");
  }
}
