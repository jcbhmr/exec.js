import processExecve from "#process-execve";
import type { PathLike } from "node:fs";
import * as url from "node:url";
import { Buffer } from "node:buffer";
import * as process from "node:process";
import * as path from "node:path"
import * as fs from "node:fs";

type ExecOptionsStdio = "inherit" | undefined | null;

/**
 * Options for the {@link exec} function. Based on Node.js' {@link https://nodejs.org/api/child_process.html#child_processspawncommand-args-options node:child_process spawn} options.
 */
export interface ExecOptions {
  /**
   * A directory path or URL to {@link https://nodejs.org/api/process.html#processchdirdirectory node:process chdir} to before executing the new process.
   */
  cwd?: string | URL | undefined;
  /**
   * An enumerable object of key-value pairs like {@link process.env node:process env} to set as environment variables for the new process.
   *
   * @default process.env
   */
  env?: NodeJS.ProcessEnv | undefined;
  /**
   * The value to use as `argv[0]` in the new process.
   *
   * @default command
   */
  argv0?: string | undefined;
  /**
   * Child's stdio configuration. Currently only `"inherit"` is supported.
   *
   * @default "inherit"
   */
  stdio?: ExecOptionsStdio | ExecOptionsStdio[] | undefined;
  /**
   * A value to {@link https://nodejs.org/api/process.html#processsetuidid node:process setuid} before executing the new process.
   */
  uid?: number | undefined;
  /**
   * A value to {@link https://nodejs.org/api/process.html#processsetgidid node:process setgid} before executing the new process.
   */
  gid?: number | undefined;
}

/**
 * Replaces the current process with a new one given by `command` and `args`.
 * 
 * This function does not return. On success, the current process is replaced and does not continue executing JavaScript code. On failure, it throws an error or aborts the process with a fatal error.
 *
 * @param command The command to run. Can be relative, absolute, or a bare name to be resolved via `PATH`.
 * @param args Arguments to pass to the new process.
 * @param options Options for the new process. Based on Node.js' {@link https://nodejs.org/api/child_process.html#child_processspawncommand-args-options node:child_process spawn} options.
 */
export default function exec(command: string, args?: string[], options?: ExecOptions): never;
export default function exec(command: string, options?: ExecOptions): never;
export default function exec(
  command: string,
  argsOrOptions?: string[] | ExecOptions,
  optionsRaw?: ExecOptions,
): never {
  const [args = [], options = {}] = Array.isArray(argsOrOptions)
    ? [argsOrOptions, optionsRaw]
    : [undefined, argsOrOptions];
  const { argv0 = command, env } = options;
  const file = command.includes(path.sep) ? command : which(command);
  const argv = [argv0, ...args];
  const cwd = options.cwd !== undefined ? toPath(options.cwd) : undefined;
  if (options.uid !== undefined) {
    process.setuid?.(options.uid);
  }
  if (options.gid !== undefined) {
    process.setgid?.(options.gid);
  }
  if (cwd !== undefined) {
    process.chdir(cwd);
  }
  // TODO: dup2 for stdio fd setup?
  processExecve(file, argv, env);
  return undefined as never;
}

function toPath(path: PathLike): string {
  if (typeof path === "string") {
    return path;
  } else if (path instanceof URL) {
    return url.fileURLToPath(path);
  } else if (Buffer.isBuffer(path)) {
    return path.toString();
  } else {
    throw new TypeError(`${path} path not PathLike`);
  }
}

function which(command: string): string {
  const { PATH = "" } = process.env;
  const dirs = PATH.split(path.delimiter);
  const found = dirs.find(d => canAccessSync(path.join(d, command), fs.constants.X_OK));
  if (found == null) {
    throw Object.assign(new Error(`${command} not found in ${PATH}`), { code: "ENOENT" });
  }
  return path.join(found, command);
}

function canAccessSync(path: PathLike, mode?: number): boolean {
  try {
    fs.accessSync(path, mode);
  } catch {
    return false;
  }
  return true;
}
