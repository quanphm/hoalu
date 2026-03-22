#!/usr/bin/env bun

function prefixStream(stream: ReadableStream, prefix: string) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();

	(async () => {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const lines = decoder.decode(value).split("\n");
			for (const line of lines) {
				if (line) console.log(`[${prefix}] ${line}`);
			}
		}
	})();
}

const caddy = Bun.spawn(["caddy", "run"], { stdout: "pipe", stderr: "pipe" });
const dev = Bun.spawn(["bun", "run", "dev"], { stdout: "pipe", stderr: "pipe" });

prefixStream(caddy.stdout, "caddy");
prefixStream(caddy.stderr, "caddy");
prefixStream(dev.stdout, "dev");
prefixStream(dev.stderr, "dev");

process.on("SIGINT", () => {
	caddy.kill();
	dev.kill();
	process.exit(0);
});

Promise.all([caddy.exited, dev.exited]);
