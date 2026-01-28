# `exec(3)` for JavaScript

🐧 Ergonomic `exec(3)` for JavaScript

<table align=center><td>

```js
// Replaces the current process with a new one.
exec("node", ["--version"], {
  cwd: "/home/someone_else/projects",
  env: { HELLO: "WORLD" },
  uid: 1234,
});
```

</table>

## Installation

![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=FFFFFF)
![pnpm](https://img.shields.io/badge/pnpm-222222?style=for-the-badge&logo=pnpm&logoColor=F69220)
![Deno](https://img.shields.io/badge/Deno-222222?style=for-the-badge&logo=Deno&logoColor=70FFAF)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=Bun&logoColor=FFFFFF)

```sh
npm install @jcbhmr/exec
```

⚠️ This package requires a Unix-like OS (Linux, macOS, etc.). Windows is not supported. For an isomorphic cross-platform solution, consider using [`@jcbhmr/cross-exec`](https://www.npmjs.com/package/@jcbhmr/cross-exec).

## Usage

![macOS](https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=macOS&logoColor=FFFFFF)
![Linux](https://img.shields.io/badge/Linux-222222?style=for-the-badge&logo=Linux&logoColor=FCC624)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=Node.js&logoColor=FFFFFF)
![Deno](https://img.shields.io/badge/Deno-222222?style=for-the-badge&logo=Deno&logoColor=70FFAF)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=Bun&logoColor=FFFFFF)

```js
// Unix-like operating systems ONLY.
import exec from "@jcbhmr/exec";

exec("node", ["--version"]);
```

## Development

![macOS](https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=macOS&logoColor=FFFFFF)
![Linux](https://img.shields.io/badge/Linux-222222?style=for-the-badge&logo=Linux&logoColor=FCC624)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=Node.js&logoColor=FFFFFF)
![Deno](https://img.shields.io/badge/Deno-222222?style=for-the-badge&logo=Deno&logoColor=70FFAF)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=Bun&logoColor=FFFFFF)

If you're on Windows you **must** use WSL to develop this package.

TODOs

- Implement fd rearrangement according to the stdio options. Right now it just inherits.
- When Deno adds `process.execve()` support, use that instead of FFI. https://github.com/denoland/deno/issues/29017
- When Bun adds `process.execve()` support, use that instead of FFI.
