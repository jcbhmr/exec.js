const kernel32 = Deno.dlopen("kernel32.dll", {
    SetConsoleCtrlHandler: {
        parameters: [],
        result: "i32"
    }
})