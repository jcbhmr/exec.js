import * as deno from "./deno.ts";

void Deno;

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
  const command2 = new deno.Command(command, {
    args,
    cwd: options.cwd,
    env: options.env as Record<string, string> | undefined,
    uid: options.uid,
    gid: options.gid,
  });
  command2.exec();
  throw new Error("noreturn");
}
