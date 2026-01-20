import * as path from "node:path"
import * as utils from "./utils.ts"

void Deno;

let posixLibc: typeof import("./posix-libc.deno.ts") | undefined
if (Deno.build.os === "darwin" || Deno.build.os === "linux") {
    try {
        posixLibc = await import("./posix-libc.deno.ts");
    } catch (error: any) {
        if (error?.name === "NotCapable") {
            // continue
        } else {
            throw error;
        }
    }
}

export default function execve(file: string, args: string[] = [], env: NodeJS.ProcessEnv = process.env): never {
    if (posixLibc) {
        const path = new TextEncoder().encode(file + "\0");
        const argv = Deno.UnsafePointer.of(BigUint64Array.from(args.map(arg => {
            const a = new TextEncoder().encode(arg + "\0")
            return Deno.UnsafePointer.value(Deno.UnsafePointer.of(a))
        }).concat(0n)))
        const envp = Deno.UnsafePointer.of(BigUint64Array.from(Object.entries(env).map(([key, value]) => {
            const a = new TextEncoder().encode(key + "=" + value + "\0")
            return Deno.UnsafePointer.value(Deno.UnsafePointer.of(a))
        }).concat(0n)))
        posixLibc.execve(path, argv, envp)
        throw new DOMException(utils.stringJSON`execve ${file} failed`, "OperationError")
    }

    const cmd = new Deno.Command(path.resolve(file), {
        args: args.slice(1),
        clearEnv: true,
        env: env as Record<string, string>,
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
    })
    const output = cmd.outputSync()
    if (output.signal) {
        Deno.kill(Deno.pid, output.signal)
        // TODO: Is this correct?
        Deno.exit(output.code)
    }
    Deno.exit(output.code);
}
