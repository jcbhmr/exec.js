import * as process from "node:process"
import * as childProcess from "node:child_process"
import * as path from "node:path"
import * as os from "node:os"
import * as utils from "./utils.ts"

export default function execve(file: string, args: string[] = [], env: NodeJS.ProcessEnv = process.env): never {
    if (process.execve) {
        process.execve(file, args, env)
    }

    const result = childProcess.spawnSync(path.resolve(file), args.slice(1), {
        argv0: args[0],
        env,
        stdio: "inherit",
    })
    if (result.error) {
        throw result.error
    }
    if (result.signal) {
        process.kill(process.pid, result.signal)
        process.exit(128 + os.constants.signals[result.signal])
    }
    process.exit(result.status!)
}
