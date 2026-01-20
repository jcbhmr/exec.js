import * as utils from "./utils.ts";

void Deno;

const libcFileName = (() => {
    if (Deno.build.os === "darwin") {
        return "libc.dylib"
    } else if (Deno.build.os === "linux") {
        return "libc.so.6"
    } else {
        throw new DOMException(utils.stringJSON`Unknown libc file name for Deno.dlopen: ${Deno.build.os} is not ${`"darwin" | "linux"`}`, "NotSupportedError")
    }
})()

const libc = Deno.dlopen(libcFileName, {
    "execve": {
        parameters: ["buffer", "pointer", "pointer"],
        result: "i32"
    }
})

export const execve = libc.symbols.execve;
