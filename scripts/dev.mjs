#!/usr/bin/env node
/**
 * Dev launcher.
 *
 * Spawns the status API alongside the Vite front-end(s) so the browser only ever
 * talks to one origin — Vite proxies /api to the API process. Output is prefixed
 * per process, and SIGINT/SIGTERM take the whole tree down.
 *
 *   node scripts/dev.mjs grinlife   API :3010 + the website :3000
 *   node scripts/dev.mjs all        same thing, kept as an alias
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] ?? "grinlife";

const processes = [];
let shuttingDown = false;

function start(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd: path.resolve(root, cwd),
    env: { ...process.env, FORCE_COLOR: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const prefix = `[${name}]`;
  const pipe = (stream, out) => {
    let buffer = "";
    stream.setEncoding("utf-8");
    stream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) out.write(`${prefix} ${line}\n`);
      }
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on("exit", (code) => {
    if (shuttingDown) return;
    process.stdout.write(`${prefix} exited with code ${code}\n`);
    shutdown(code ?? 0);
  });

  processes.push({ name, child });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const { child } of processes) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 200);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const grinlife = () => {
  start("api", "npx", ["tsx", "server/dev.ts"], "apps/grinlife");
  start("grinlife", "npx", ["vite", "--host", "0.0.0.0"], "apps/grinlife");
};

switch (mode) {
  case "grinlife":
    grinlife();
    break;
  case "all":
    grinlife();
    break;
  default:
    process.stderr.write(`Unknown mode "${mode}". Use: grinlife | all\n`);
    process.exit(1);
}
