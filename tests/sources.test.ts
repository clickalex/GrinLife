/**
 * Tailwind source registration guard — for every front-end in the monorepo.
 *
 * `@grin/ui` and `@grin/content` live outside each app's directory. If an app's
 * `@source` globs point at a directory that does not exist, Tailwind silently
 * purges every utility used inside a shared component: the build still succeeds
 * and the site renders unstyled. This test catches that off-by-one instead of
 * shipping it, and it covers any app added later without needing to be edited.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const monorepoRoot = resolve(import.meta.dirname, "..");
const appsDir = resolve(monorepoRoot, "apps");

const apps = readdirSync(appsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function hasSourceFiles(dir: string): boolean {
  if (!existsSync(dir)) return false;
  return readdirSync(dir, { withFileTypes: true }).some((entry) => {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) return hasSourceFiles(full);
    return /\.(tsx?|jsx?)$/.test(entry.name);
  });
}

describe("monorepo apps", () => {
  it("finds both front-ends", () => {
    expect(apps.sort()).toEqual(["grinlife", "legacy-landing"]);
  });
});

describe.each(apps)("Tailwind @source registration in %s", (app) => {
  const cssFile = resolve(appsDir, app, "src/styles/app.css");
  const css = existsSync(cssFile) ? readFileSync(cssFile, "utf-8") : "";
  const sourcePaths = [...css.matchAll(/@source\s+"([^"]+)"/g)].map((match) => match[1]!);
  const resolved = sourcePaths.map((p) => resolve(dirname(cssFile), p));

  it("has a stylesheet", () => {
    expect(existsSync(cssFile), cssFile).toBe(true);
  });

  it("resolves every @source path to a real directory containing source files", () => {
    expect(sourcePaths.length, `${app} declares no @source`).toBeGreaterThanOrEqual(3);
    for (const path of resolved) {
      expect(existsSync(path), `${path} does not exist`).toBe(true);
      expect(hasSourceFiles(path), `${path} contains no source files`).toBe(true);
    }
  });

  it("scans both shared packages, not just the app itself", () => {
    expect(resolved).toContain(resolve(monorepoRoot, "packages/grin-ui/src"));
    expect(resolved).toContain(resolve(monorepoRoot, "packages/grin-content/src"));
  });

  it("imports the shared tokens exactly once", () => {
    expect(css.match(/@import\s+"@grin\/ui\/styles\/tokens.css"/g)).toHaveLength(1);
  });
});
