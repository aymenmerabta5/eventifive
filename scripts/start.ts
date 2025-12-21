import { spawn } from "bun";

const wsProcess = spawn({
  cmd: ["bun", "run", "src/server/realtime/ws.ts"],
  stdout: "inherit",
  stderr: "inherit",
});

const nextProcess = spawn({
  cmd: ["bun", "--bun", "next", "start"],
  stdout: "inherit",
  stderr: "inherit",
});

process.on("SIGTERM", () => {
  wsProcess.kill();
  nextProcess.kill();
});

process.on("SIGINT", () => {
  wsProcess.kill();
  nextProcess.kill();
  process.exit(0);
});

await Promise.all([wsProcess.exited, nextProcess.exited]);
