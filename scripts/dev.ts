import { spawn } from "bun";

const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
};

async function runDev() {
  console.log(
    `${colors.yellow}[DEV]${colors.reset} Starting development servers...\n`,
  );

  const wsProcess = spawn({
    cmd: ["bun", "run", "src/server/realtime/ws.ts"],
    stdout: "pipe",
    stderr: "pipe",
  });

  const nextProcess = spawn({
    cmd: ["bun", "--bun", "next", "dev", "--turbo"],
    stdout: "pipe",
    stderr: "pipe",
  });

  // Stream WS output with prefix
  (async () => {
    const reader = wsProcess.stdout.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(
        `${colors.blue}[WS]${colors.reset} ${decoder.decode(value)}`,
      );
    }
  })();

  (async () => {
    const reader = wsProcess.stderr.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stderr.write(
        `${colors.blue}[WS]${colors.reset} ${decoder.decode(value)}`,
      );
    }
  })();

  // Stream Next.js output with prefix
  (async () => {
    const reader = nextProcess.stdout.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(
        `${colors.green}[NEXT]${colors.reset} ${decoder.decode(value)}`,
      );
    }
  })();

  (async () => {
    const reader = nextProcess.stderr.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stderr.write(
        `${colors.green}[NEXT]${colors.reset} ${decoder.decode(value)}`,
      );
    }
  })();

  process.on("SIGINT", () => {
    console.log(`\n${colors.yellow}[DEV]${colors.reset} Shutting down...`);
    wsProcess.kill();
    nextProcess.kill();
    process.exit(0);
  });

  await Promise.race([wsProcess.exited, nextProcess.exited]);
}

runDev();
