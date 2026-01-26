# `exec(3)` for Node.js

🐧 `exec(3)` for `node:child_process`, `Deno.Command`, and `Bun.spawn`

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

<details><summary><code>Deno.Command</code> example</summary>

```ts
// Unix-like operating systems ONLY.
import * as deno from "@jcbhmr/exec/deno";

// Deno.Command uses this.#command and this.#options internally 😥
// so we can't extend it easily without using our own constructor. 🤷
const command = new deno.Command("node", {
  args: ["--version"],
});
command.exec();
```

</details>

<details><summary><code>Bun.spawn</code> example</summary>

```ts
// Unix-like operating systems ONLY.
import * as bun from "@jcbhmr/exec/bun";

// Bun.spawn has a slightly different signature compared to
// node:child_process spawn.
bun.exec(["node", "--version"]);
```

</details>

## Development

![macOS](https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=macOS&logoColor=FFFFFF)
![Linux](https://img.shields.io/badge/Linux-222222?style=for-the-badge&logo=Linux&logoColor=FCC624)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=Node.js&logoColor=FFFFFF)
![Deno](https://img.shields.io/badge/Deno-222222?style=for-the-badge&logo=Deno&logoColor=70FFAF)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=Bun&logoColor=FFFFFF)

You must use WSL on Windows to develop and test this package.

TODO: Implement fd rearrangement according to the stdio options. Right now it just inherits.
