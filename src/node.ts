import * as process from "node:process";
import * as fs from "node:fs";
import * as buffer from "node:buffer";
import * as url from "node:url";
import which from "which";

type ExecOptionsStdio = "inherit" | undefined | null;

export interface ExecOptions {
  cwd?: string | URL | undefined;
  env?: NodeJS.ProcessEnv | undefined;
  argv0?: string | undefined;
  stdio?: ExecOptionsStdio | ExecOptionsStdio[] | undefined;
  uid?: number | undefined;
  gid?: number | undefined;
}

export function exec(command: string, options?: ExecOptions): never;
export function exec(command: string, args?: string[], options?: ExecOptions): never;
export function exec(
  command: string,
  argsOrOptions?: string[] | ExecOptions,
  optionsRaw?: ExecOptions,
): never {
  const [args = [], options = {}] = Array.isArray(argsOrOptions)
    ? [argsOrOptions, optionsRaw]
    : [undefined, argsOrOptions];
  const file = which.sync(command);
  const argv = [options.argv0 ?? command, ...args];
  // TODO: dup2 for stdio fd setup?
  try {
    if (options.uid != null) {
      process.setuid?.(options.uid);
    }
    if (options.gid != null) {
      process.setgid?.(options.gid);
    }
    if (options.cwd != null) {
      process.chdir(toPath(options.cwd));
    }
    process.execve!(file, argv, options.env);
    throw new Error("noreturn");
  } catch (error) {
    console.error(error);
    process.abort();
  }
}

function toPath(path: fs.PathLike): string {
  if (typeof path === "string") {
    return path;
  } else if (path instanceof URL) {
    return url.fileURLToPath(path);
  } else if (buffer.Buffer.isBuffer(path)) {
    return path.toString();
  } else {
    throw new TypeError("path not fs.PathLike");
  }
}
