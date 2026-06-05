#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

function prefixStream(stream: NodeJS.ReadableStream, prefix: string) {
	const rl = createInterface({ input: stream });
	rl.on("line", (line) => {
		console.log(`[${prefix}] ${line}`);
	});
}

const caddy = spawn("caddy", ["run"], { stdio: ["pipe", "pipe", "pipe"] });
const dev = spawn("pnpm", ["run", "dev"], { stdio: ["pipe", "pipe", "pipe"] });

prefixStream(caddy.stdout, "caddy");
prefixStream(caddy.stderr, "caddy");
prefixStream(dev.stdout, "dev");
prefixStream(dev.stderr, "dev");

process.on("SIGINT", () => {
	caddy.kill();
	dev.kill();
	process.exit(0);
});
