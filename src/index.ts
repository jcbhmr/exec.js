import processExecve from "#process-execve";
import type { PathLike } from "node:fs";
import * as url from "node:url";
import { Buffer } from "node:buffer";
import * as process from "node:process";
import which from "which";

type ExecOptionsStdio = "inherit" | undefined | null;

/**
 * Options for the {@link exec} function. Based on Node.js' {@link https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options child_process spawnSync} options.
 */
export interface ExecOptions {
  /**
   * A directory path or URL to {@link https://nodejs.org/api/process.html#processchdirdirectory process.chdir} to before executing the new process.
   */
  cwd?: string | URL | undefined;
  /**
   * An enumerable object of key-value pairs like {@link process.env process.env} to set as environment variables for the new process.
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
   * A value to {@link https://nodejs.org/api/process.html#processsetuidid process.setuid} before executing the new process.
   */
  uid?: number | undefined;
  /**
   * A value to {@link https://nodejs.org/api/process.html#processsetgidid process.setgid} before executing the new process.
   */
  gid?: number | undefined;
}

/**
 *
 * @param command The command to run. If this is a relative path, it's
 * @param options
 */
export default function exec(command: string, options?: ExecOptions): never;
export default function exec(command: string, args?: string[], options?: ExecOptions): never;
export default function exec(
  command: string,
  argsOrOptions?: string[] | ExecOptions,
  optionsRaw?: ExecOptions,
): never {
  const [args = [], options = {}] = Array.isArray(argsOrOptions)
    ? [argsOrOptions, optionsRaw]
    : [undefined, argsOrOptions];
  const { argv0 = command, env } = options;
  const argv = [argv0, ...args];
  const cwd = options.cwd !== undefined ? toPath(options.cwd) : undefined;
  const pwd = process.cwd();
  if (cwd !== undefined) {
    process.chdir(cwd);
  }
  let file: string;
  try {
    file = which.sync(command, { path: env?.PATH, pathExt: env?.PATHEXT });
  } finally {
    process.chdir(pwd);
  }
  if (options.uid !== undefined) {
    process.setuid?.(options.uid);
  }
  if (options.gid !== undefined) {
    process.setgid?.(options.gid);
  }
  // TODO: dup2 for stdio fd setup?
  processExecve(file, argv, env);
  throw new Error("noreturn");
}

function toPath(path: PathLike): string {
  if (typeof path === "string") {
    return path;
  } else if (path instanceof URL) {
    return url.fileURLToPath(path);
  } else if (Buffer.isBuffer(path)) {
    return path.toString();
  } else {
    throw new TypeError("path not PathLike");
  }
}
