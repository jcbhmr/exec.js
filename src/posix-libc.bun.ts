import * as ffi from "bun:ffi"
import * as process from "node:process"
import * as utils from "./utils.ts";

const libcFileName = (() => {
    if (process.platform === "darwin") {
        return "libc.dylib"
    } else if (process.platform === "linux") {
        return "libc.so.6"
    } else {
        throw new DOMException(utils.stringJSON`Unknown libc file name for Bun.ffi.dlopen: ${process.platform} is not ${`"darwin" | "linux"`}`, "NotSupportedError")
    }
})()

const libc = ffi.dlopen(libcFileName, {
    execve: {
        args: ["buffer", "ptr", "ptr"],
        returns: "i32"
    }
})

export const execve = libc.symbols.execve
