import * as process from "node:process"

const execve = process.execve ?? (() => {
    throw new DOMException(`${process.platform} not supported`, "NotSupportedError")
})();
export { execve as default }
