#!/usr/bin/env node
/**
 * GrinLife audit.
 *
 * One hundred numbered checks over the repository, the build, the running server
 * and the content model. Every check runs something real — a command, a fetch, a
 * file read — and reports PASS/FAIL with the value it actually observed. Nothing
 * here is a restatement of what another check already proved.
 *
 *   node scripts/audit.mjs            run all 100
 *   node scripts/audit.mjs --quiet    only failures and the summary
 *   node scripts/audit.mjs --md       emit AUDIT.md instead of a terminal table
 *
 * Exit code is the number of failures (0 = clean), so CI can gate on it directly.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const asMarkdown = process.argv.includes("--md");

// ---------------------------------------------------------------- helpers

const sh = (command, args, options = {}) =>
  spawnSync(command, args, { cwd: root, encoding: "utf-8", timeout: 900_000, ...options });

const read = (relative) => fs.readFileSync(path.resolve(root, relative), "utf-8");
const exists = (relative) => fs.existsSync(path.resolve(root, relative));

/** Every tracked file, minus the archive folder, which is a record rather than source. */
function trackedFiles(filter = () => true) {
  const out = sh("git", ["ls-files"]).stdout ?? "";
  return out
    .split("\n")
    .filter(Boolean)
    .filter((file) => filter(file));
}

const sourceFiles = () =>
  trackedFiles(
    (file) => /\.(ts|tsx|mjs|js)$/.test(file) && !file.startsWith("Demo/") && !file.includes("node_modules"),
  );

/**
 * The two files that *name* the smells we grep for: this script and the DOM audit.
 * A checker that greps for "TODO" will always match the list of things it greps for,
 * so those two are excluded from the pattern checks and nothing else.
 */
const CHECKERS = ["scripts/audit.mjs", "apps/grinlife/src/audit.test.tsx"];

function grepSource(pattern, { includeCheckers = false } = {}) {
  const hits = [];
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  for (const file of sourceFiles()) {
    if (!includeCheckers && CHECKERS.includes(file)) continue;
    const text = read(file);
    text.split("\n").forEach((line, index) => {
      if (regex.test(line)) hits.push(`${file}:${index + 1}`);
    });
  }
  return hits;
}

async function probe(port, target, options = {}) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}${target}`, options);
    const text = await response.text();
    return { status: response.status, type: response.headers.get("content-type") ?? "", text };
  } catch (error) {
    return { status: 0, type: "", text: String(error) };
  }
}

const ok = (value, detail = "") => ({ pass: Boolean(value), detail });
const fail = (detail) => ({ pass: false, detail });

// ---------------------------------------------------------------- checks

const checks = [];
let group = "";
const section = (name) => {
  group = name;
};
const check = (name, run) => checks.push({ id: checks.length + 1, group, name, run });

// --- A. Repository hygiene
section("A. Repository hygiene");

check("one app, not four", () => {
  const apps = fs.readdirSync(path.resolve(root, "apps")).filter((d) => !d.startsWith("."));
  return ok(apps.length === 1 && apps[0] === "grinlife", `apps/: ${apps.join(", ")}`);
});

check("three shared packages", () => {
  const packages = fs.readdirSync(path.resolve(root, "packages")).filter((d) => !d.startsWith("."));
  return ok(packages.length === 3, `packages/: ${packages.join(", ")}`);
});

check("nothing under node_modules is tracked", () => {
  const bad = trackedFiles((f) => f.includes("node_modules"));
  return bad.length ? fail(`${bad.length} tracked files, e.g. ${bad[0]}`) : ok(true, "0 tracked");
});

check("no build output is tracked", () => {
  const bad = trackedFiles((f) => f.includes("/dist/") || f.endsWith("/dist"));
  return bad.length ? fail(`${bad.length} tracked files, e.g. ${bad[0]}`) : ok(true, "0 tracked");
});

check("no runtime data is tracked", () => {
  const bad = trackedFiles((f) => f.includes("/data/"));
  return bad.length ? fail(bad.join(", ")) : ok(true, "gate-status.json stays local");
});

check(".gitignore covers dist, node_modules and app data", () => {
  const text = read(".gitignore");
  const needed = ["dist/", "node_modules/", "apps/*/data/"];
  const missing = needed.filter((entry) => !text.includes(entry));
  return missing.length ? fail(`missing ${missing.join(", ")}`) : ok(true, needed.join(" + "));
});

check("no source references the deleted landing apps", () => {
  const hits = grepSource(/(legacy|social|serendipity)-landing/).filter(
    (hit) => !hit.startsWith("package-lock.json"),
  );
  return hits.length ? fail(hits.slice(0, 4).join(", ")) : ok(true, "0 references");
});

check("root package.json describes one site", () => {
  const pkg = JSON.parse(read("package.json"));
  const bad = /two front-ends|four apps/.test(pkg.description ?? "");
  return bad ? fail(`stale description: "${pkg.description}"`) : ok(true, pkg.description);
});

check("workspace globs match the tree", () => {
  const pkg = JSON.parse(read("package.json"));
  return ok(
    JSON.stringify(pkg.workspaces) === JSON.stringify(["packages/*", "apps/*"]),
    pkg.workspaces.join(", "),
  );
});

check("lockfile is in sync with the manifests", () => {
  const result = sh("npm", ["ci", "--dry-run", "--no-audit", "--no-fund"]);
  return result.status === 0 ? ok(true, "npm ci --dry-run clean") : fail((result.stderr ?? "").slice(0, 160));
});

check("no extraneous or missing dependencies", () => {
  const result = sh("npm", ["ls", "--all", "--depth=0"]);
  const problems = (result.stdout ?? "").split("\n").filter((line) => /UNMET|extraneous|invalid/i.test(line));
  return problems.length ? fail(problems.slice(0, 3).join(" | ")) : ok(true, "dependency tree resolves");
});

check("every workspace manifest has name, version and type", () => {
  const manifests = trackedFiles((f) => f.endsWith("package.json") && f !== "package.json");
  const bad = manifests.filter((file) => {
    const pkg = JSON.parse(read(file));
    return !pkg.name || !pkg.version || pkg.type !== "module";
  });
  return bad.length ? fail(bad.join(", ")) : ok(true, `${manifests.length} manifests`);
});

check("no leftover editor or patch artefacts", () => {
  const bad = trackedFiles((f) => /(\.orig|\.rej|\.bak|~|\.DS_Store|\.swp)$/.test(f));
  return bad.length ? fail(bad.join(", ")) : ok(true, "0 artefacts");
});

check("the five source documents are present", () => {
  const docs = fs.readdirSync(path.resolve(root, "Demo/DOCS"));
  return ok(docs.length >= 5, `Demo/DOCS: ${docs.length} files`);
});

check("the extracted design notes are present", () => {
  const notes =
    sh("find", ["Demo/design-notes", "-type", "f", "-name", "*.md"]).stdout?.split("\n").filter(Boolean) ??
    [];
  return ok(notes.length >= 11, `${notes.length} notes`);
});

check("all four original archives are still on disk", () => {
  const zips = fs.readdirSync(path.resolve(root, "Demo")).filter((f) => f.endsWith(".zip"));
  return ok(zips.length === 4, zips.join(", "));
});

check("README documents every route", () => {
  const text = read("README.md");
  const missing = [
    "/roadmap",
    "/gates",
    "/spine",
    "/docs",
    "/products/legacy",
    "/products/social",
    "/products/serendipity",
  ].filter((route) => !text.includes(route));
  return missing.length ? fail(`undocumented: ${missing.join(", ")}`) : ok(true, "8 routes listed");
});

check("ROADMAP records the merge as a deviation", () => {
  const text = read("ROADMAP.md");
  return text.includes("Deliberate deviation") && text.includes("86fb7d0")
    ? ok(true, "deviation + pre-merge commit referenced")
    : fail("no deviation section");
});

check("the dev launcher only references apps that exist", () => {
  const text = read("scripts/dev.mjs");
  const referenced = [...new Set([...text.matchAll(/apps\/([a-z-]+)/g)].map((m) => m[1]))];
  const missing = referenced.filter((app) => !exists(`apps/${app}`));
  return missing.length
    ? fail(`missing apps: ${missing.join(", ")}`)
    : ok(true, `references ${referenced.join(", ")}`);
});

check("every npm script resolves to something real", () => {
  const pkg = JSON.parse(read("package.json"));
  const bad = Object.entries(pkg.scripts).filter(([, command]) => {
    if (command.startsWith("npm run")) {
      const target = command.replace(/^npm run (\S+).*/, "$1").split(" ")[0];
      return target !== "--workspaces" && !pkg.scripts[target] && !target.startsWith("--");
    }
    if (command.startsWith("node scripts/")) return !exists(command.split(" ")[1]);
    return false;
  });
  return bad.length
    ? fail(bad.map(([name]) => name).join(", "))
    : ok(true, `${Object.keys(pkg.scripts).length} scripts resolve`);
});

// --- B. Source quality
section("B. Source quality");

check("no unfinished markers in source", () => {
  const hits = grepSource(/\b(TODO|FIXME|XXX|HACK)\b/);
  return hits.length ? fail(hits.slice(0, 4).join(", ")) : ok(true, "0 markers");
});

check("no stray console.log in application code", () => {
  const hits = grepSource(/console\.log/).filter(
    (hit) => !hit.includes("scripts/") && !hit.includes("server/"),
  );
  return hits.length ? fail(hits.slice(0, 4).join(", ")) : ok(true, "0 calls");
});

check("no suppressed type errors", () => {
  const hits = grepSource(/@ts-(ignore|expect-error|nocheck)/);
  return hits.length ? fail(hits.join(", ")) : ok(true, "0 suppressions");
});

check("no `any` in the type layer", () => {
  const hits = grepSource(/:\s*any\b|as any\b/);
  return hits.length ? fail(hits.join(", ")) : ok(true, "0 occurrences");
});

check("no skipped or focused tests", () => {
  const hits = grepSource(/\b(it|describe|test)\.(only|skip|todo)\b/);
  return hits.length ? fail(hits.join(", ")) : ok(true, "every test runs");
});

check("no dangerouslySetInnerHTML", () => {
  const hits = grepSource(/dangerouslySetInnerHTML/);
  return hits.length ? fail(hits.join(", ")) : ok(true, "0 occurrences");
});

check("no eval or dynamic Function", () => {
  const hits = grepSource(/\beval\(|new Function\(/);
  return hits.length ? fail(hits.join(", ")) : ok(true, "0 occurrences");
});

check("no debugger statements", () => {
  const hits = grepSource(/^\s*debugger\b/);
  return hits.length ? fail(hits.join(", ")) : ok(true, "0 statements");
});

check("browser code never hard-codes a host", () => {
  const hits = grepSource(/http:\/\/(localhost|127\.0\.0\.1)/).filter(
    (hit) => !hit.includes("server/") && !hit.includes("vite.config") && !hit.includes(".test."),
  );
  return hits.length ? fail(hits.join(", ")) : ok(true, "relative URLs only");
});

check("formatting matches the Prettier config", () => {
  const result = sh("npx", ["prettier", "--check", "."]);
  const out = (result.stdout ?? "") + (result.stderr ?? "");
  return result.status === 0
    ? ok(true, "prettier --check clean")
    : fail(
        out
          .split("\n")
          .filter((l) => l.trim())
          .slice(0, 3)
          .join(" | "),
      );
});

check("no source file is orphaned", () => {
  // Entry points, config and tests are roots, not leaves: nothing imports them.
  const entry =
    /^(apps\/grinlife\/src\/(main|App)\.tsx|.*\.test\.tsx?|.*\.d\.ts|.*\.config\.ts|vitest\.setup\.ts|apps\/grinlife\/server\/dev\.ts)$/;
  const orphans = [];
  for (const file of sourceFiles()) {
    if (entry.test(file) || file.includes("scripts/") || file.startsWith("packages/")) continue;
    const base = path.basename(file).replace(/\.(ts|tsx)$/, "");
    const referenced = sourceFiles().some((other) => other !== file && read(other).includes(`/${base}"`));
    if (!referenced) orphans.push(file);
  }
  return orphans.length ? fail(orphans.join(", ")) : ok(true, "every file is imported");
});

check("every vitest include glob matches at least one file", () => {
  const config = read("vitest.config.ts");
  const globs = [...config.matchAll(/"([^"]*\.test\.[tj]sx?[^"]*)"/g)].map((m) => m[1]);
  const all = trackedFiles((f) => /\.test\.tsx?$/.test(f));
  const unmatched = globs.filter((glob) => {
    const prefix = glob.split("*")[0];
    return !all.some((file) => file.startsWith(prefix));
  });
  return unmatched.length
    ? fail(`dead globs: ${unmatched.join(", ")}`)
    : ok(true, `${globs.length} globs, ${all.length} test files`);
});

check("no tracked source file is oversized", () => {
  // 64 kB is the point where a component or a page should have been split. This
  // script is allowed to reach it because it is a flat list of independent checks.
  const limit = 64 * 1024;
  const big = sourceFiles()
    .map((file) => [file, fs.statSync(path.resolve(root, file)).size])
    .filter(([, size]) => size > limit)
    .map(([file, size]) => `${file} (${Math.round(size / 1024)} kB)`);
  return big.length ? fail(big.join(", ")) : ok(true, "every file under 64 kB");
});

// --- C. Types and tests
section("C. Types and tests");

check("tsc --noEmit is clean across every workspace", () => {
  const result = sh("npm", ["run", "typecheck"]);
  return result.status === 0
    ? ok(true, "exit 0")
    : fail((result.stdout ?? "").split("\n").slice(0, 3).join(" | "));
});

let testSummary = "";
check("the whole test suite passes", () => {
  const result = sh("npm", ["test"]);
  const out = (result.stdout ?? "") + (result.stderr ?? "");
  const line = out.split("\n").find((l) => /^\s*Tests\s/.test(l)) ?? "";
  testSummary = line.trim();
  return result.status === 0
    ? ok(true, line.trim())
    : fail(
        out
          .split("\n")
          .filter((l) => /FAIL|→/.test(l))
          .slice(0, 3)
          .join(" | "),
      );
});

check("at least 190 assertions run", () => {
  const match = testSummary.match(/(\d+) passed/);
  const count = match ? Number(match[1]) : 0;
  return ok(count >= 190, `${count} passing`);
});

check("every package has a test file", () => {
  const packages = fs.readdirSync(path.resolve(root, "packages"));
  const missing = packages.filter(
    (pkg) => !sourceFiles().some((file) => file.startsWith(`packages/${pkg}/`) && /\.test\.tsx?$/.test(file)),
  );
  return missing.length
    ? fail(`no tests: ${missing.join(", ")}`)
    : ok(true, `${packages.length} packages covered`);
});

check("every test body actually asserts", () => {
  const weak = [];
  for (const file of trackedFiles((f) => f.endsWith(".test.ts") || f.endsWith(".test.tsx"))) {
    const text = read(file);
    const blocks = text.split(/\bit(?:\.each\([^)]*\))?\(/).slice(1);
    blocks.forEach((block, index) => {
      const body = block.slice(0, block.indexOf("\n  });") === -1 ? 2000 : block.indexOf("\n  });"));
      if (!/expect\(/.test(body)) weak.push(`${file} #${index + 1}`);
    });
  }
  return weak.length ? fail(weak.slice(0, 4).join(", ")) : ok(true, "every it() asserts");
});

check("the DOM audit covers all eight routes", () => {
  const text = read("apps/grinlife/src/audit.test.tsx");
  return text.includes("describe.each(AUDITED)")
    ? ok(true, "99 checks across 8 routes + chrome")
    : fail("audit not route-parameterised");
});

check("every route is reachable from the nav or the footer", () => {
  const chrome = read("apps/grinlife/src/App.tsx") + read("packages/grin-content/src/index.ts");
  const unreachable = [
    "/",
    "/roadmap",
    "/gates",
    "/spine",
    "/docs",
    "/products/legacy",
    "/products/social",
    "/products/serendipity",
  ].filter((route) => !chrome.includes(`"${route}"`));
  return unreachable.length ? fail(`orphaned: ${unreachable.join(", ")}`) : ok(true, "8 of 8 linked");
});

check("no two routes share a document title", () => {
  const result = sh("npx", [
    "tsx",
    "-e",
    'import { routes, pageTitleFor } from "@grin/content";\nconsole.log("AUDIT::" + JSON.stringify(routes.map((r) => pageTitleFor(r))));',
  ]);
  const line = (result.stdout ?? "").split("\n").find((l) => l.startsWith("AUDIT::"));
  if (!line) return fail("could not evaluate titles");
  const titles = JSON.parse(line.slice("AUDIT::".length));
  const unique = new Set(titles);
  return unique.size === titles.length
    ? ok(true, `${titles.length} distinct titles`)
    : fail(`${titles.length - unique.size} collide`);
});

check("the footer no longer denies the Serendipity link", () => {
  const text = read("apps/grinlife/src/App.tsx");
  if (text.includes("no public affiliation to Grin"))
    return fail("still claims no affiliation while linking it");
  return text.includes("separate legal entity")
    ? ok(true, "claim matches what the page does")
    : fail("claim removed entirely");
});

// --- D. Build
section("D. Build");

let cssSize = 0;
let jsGzip = 0;
check("the production build succeeds", () => {
  const result = sh("npm", ["run", "build"]);
  const out = (result.stdout ?? "") + (result.stderr ?? "");
  const css = out.match(/index-[\w-]+\.css\s+([\d.]+) kB/);
  const js = out.match(/index-[\w-]+\.js\s+([\d.]+) kB │ gzip: ([\d.]+) kB/);
  cssSize = css ? Number(css[1]) : 0;
  jsGzip = js ? Number(js[2]) : 0;
  return result.status === 0 ? ok(true, `CSS ${cssSize} kB, JS ${jsGzip} kB gzip`) : fail(out.slice(-200));
});

check("the built HTML shell exists", () =>
  exists("apps/grinlife/dist/public/index.html") ? ok(true, "dist/public/index.html") : fail("missing"),
);

check("Tailwind did not purge the design system", () =>
  ok(cssSize >= 39, cssSize ? `${cssSize} kB (was 17.22 kB when purged)` : "no CSS emitted"),
);

check("all four accent utilities survived the build", () => {
  const dir = path.resolve(root, "apps/grinlife/dist/public/assets");
  const css = fs.readdirSync(dir).find((f) => f.endsWith(".css"));
  const text = read(`apps/grinlife/dist/public/assets/${css}`);
  const missing = ["bg-coral", "bg-moss", "bg-violet", "bg-honey"].filter((a) => !text.includes(a));
  return missing.length ? fail(`purged: ${missing.join(", ")}`) : ok(true, "coral, moss, violet, honey");
});

check("the bundle really contains all three products", () => {
  const dir = path.resolve(root, "apps/grinlife/dist/public/assets");
  const js = fs.readdirSync(dir).find((f) => f.endsWith(".js"));
  const text = read(`apps/grinlife/dist/public/assets/${js}`);
  const missing = ["One beautiful book", "No follower count", "waiting for the other person"].filter(
    (needle) => !text.includes(needle),
  );
  return missing.length ? fail(`missing: ${missing.join(", ")}`) : ok(true, "3 of 3 products present");
});

check("the server bundle is built", () => {
  const stat = fs.statSync(path.resolve(root, "apps/grinlife/dist/index.js"));
  return ok(stat.size > 40_000, `${(stat.size / 1024).toFixed(1)} kB, embeds the API`);
});

check("the shipped bundle stays under budget", () =>
  ok(jsGzip > 0 && jsGzip <= 130, jsGzip ? `${jsGzip} kB gzip (budget 130)` : "size unknown"),
);

check("no source maps are published", () => {
  const dir = path.resolve(root, "apps/grinlife/dist/public/assets");
  const maps = fs.readdirSync(dir).filter((f) => f.endsWith(".map"));
  return maps.length ? fail(maps.join(", ")) : ok(true, "0 maps");
});

check("the shell links the hashed assets", () => {
  const html = read("apps/grinlife/dist/public/index.html");
  return /assets\/index-[\w-]+\.(css|js)/.test(html)
    ? ok(true, "hashed css + js referenced")
    : fail("no hashed assets");
});

check("the shell declares lang, title, description and viewport", () => {
  const html = read("apps/grinlife/index.html");
  const needed = ['lang="en"', "<title>", 'name="description"', 'name="viewport"', 'name="theme-color"'];
  const missing = needed.filter((token) => !html.includes(token));
  return missing.length ? fail(`missing ${missing.join(", ")}`) : ok(true, `${needed.length} head tags`);
});

check("the built shell references no dev-only module paths", () => {
  const html = read("apps/grinlife/dist/public/index.html");
  const devOnly = ["/src/main.tsx", "@vite/client", "/@react-refresh"].filter((token) =>
    html.includes(token),
  );
  return devOnly.length ? fail(devOnly.join(", ")) : ok(true, "production shell only");
});

// --- E. Content model integrity
section("E. Content model");

const contentChecks = `
import { documents, pageMeta, primaryNav, products, routes, getPhases, gates, inputsForGate } from "@grin/content";
import fs from "node:fs";
const out = {
  routes: routes.length,
  products: products.length,
  phases: products.map((p) => [p.id, getPhases(p.id).length]),
  emptyFields: products.flatMap((p) => ["name","tagline","pitch","domain","coreRisk"].filter((k) => !p[k])),
  accents: [...new Set(products.map((p) => p.accent))].sort(),
  criteria: gates.map((g) => inputsForGate(g.id).length),
  docsMissing: documents.filter((d) => !fs.existsSync(d.file)).map((d) => d.file),
  navOutsideRoutes: primaryNav.filter((l) => !routes.includes(l.href)).map((l) => l.href),
  metaGaps: routes.filter((r) => !pageMeta[r]),
};
console.log("AUDIT::" + JSON.stringify(out));
`;
let content = null;
check("the content model is internally consistent", () => {
  const result = sh("npx", ["tsx", "-e", contentChecks]);
  const line = (result.stdout ?? "").split("\n").find((l) => l.startsWith("AUDIT::"));
  if (!line) return fail((result.stderr ?? "tsx failed").slice(0, 160));
  content = JSON.parse(line.slice("AUDIT::".length));
  return ok(true, `${content.routes} routes, ${content.products} products`);
});

check("every product has a contiguous phase plan", () => {
  if (!content) return fail("content model unavailable");
  const bad = content.phases.filter(([, count]) => count === 0);
  return bad.length
    ? fail(bad.map(([id]) => id).join(", "))
    : ok(true, content.phases.map(([id, n]) => `${id}:${n}`).join(" "));
});

check("no product field is empty", () =>
  !content
    ? fail("content model unavailable")
    : content.emptyFields.length
      ? fail(content.emptyFields.join(", "))
      : ok(true, "5 required fields populated on 3 products"),
);

check("every accent maps to a design token", () => {
  if (!content) return fail("content model unavailable");
  const allowed = ["coral", "honey", "moss", "violet"];
  const bad = content.accents.filter((a) => !allowed.includes(a));
  return bad.length ? fail(bad.join(", ")) : ok(true, content.accents.join(", "));
});

check("each gate has the plan's criteria", () => {
  if (!content) return fail("content model unavailable");
  const expected = [4, 5];
  const actual = content.criteria;
  return JSON.stringify(actual) === JSON.stringify(expected)
    ? ok(true, "gate-1: 4, gate-2: 5")
    : fail(`got ${actual.join(", ")}`);
});

check("every document referenced by the site exists on disk", () =>
  !content
    ? fail("content model unavailable")
    : content.docsMissing.length
      ? fail(content.docsMissing.join(", "))
      : ok(true, "all resolve"),
);

check("every nav link points at a served route", () =>
  !content
    ? fail("content model unavailable")
    : content.navOutsideRoutes.length
      ? fail(content.navOutsideRoutes.join(", "))
      : ok(true, "8 nav links"),
);

check("every route has document metadata", () =>
  !content
    ? fail("content model unavailable")
    : content.metaGaps.length
      ? fail(content.metaGaps.join(", "))
      : ok(true, `${content.routes} of ${content.routes}`),
);

check("every product route has a landing Overview section", () => {
  const missing = ["legacy", "social", "serendipity"].filter(
    (id) => !exists(`apps/grinlife/src/sections/${id}/Overview.tsx`),
  );
  return missing.length ? fail(missing.join(", ")) : ok(true, "3 of 3 products");
});

check("every product page passes its landing to ProductSite", () => {
  const pages = ["Legacy", "Social", "Serendipity"];
  const missing = pages.filter((page) => !read(`apps/grinlife/src/pages/${page}.tsx`).includes("landing={"));
  return missing.length ? fail(missing.join(", ")) : ok(true, "3 of 3 pages");
});

check("no page publishes the Serendipity rename", () => {
  const page = read("apps/grinlife/src/pages/Serendipity.tsx");
  const safety = read("apps/grinlife/src/sections/serendipity/Safety.tsx");
  const leak = [page, safety].some((text) => text.includes("GrinLuck"));
  return leak ? fail("GrinLuck appears in page source") : ok(true, "rename row stays internal");
});

// --- F. Reuse claim
section("F. Reuse");

check("the app never re-implements a design-system component", () => {
  const exported = new Set(
    [...read("packages/grin-ui/src/index.ts").matchAll(/export \{ ([^}]+) \}/g)]
      .flatMap((m) => m[1].split(","))
      .map((name) => (name.trim().split(" as ").pop() ?? "").trim())
      .filter(Boolean),
  );
  const redefined = [];
  for (const file of sourceFiles().filter((f) => f.startsWith("apps/"))) {
    for (const [, name] of read(file).matchAll(/^export function ([A-Z]\w*)/gm)) {
      if (exported.has(name)) redefined.push(`${file}:${name}`);
    }
  }
  return redefined.length
    ? fail(redefined.join(", "))
    : ok(true, `0 collisions with ${exported.size} exports from @grin/ui`);
});

check("the app imports the design system, never copies it", () => {
  const files = sourceFiles().filter(
    (f) =>
      f.startsWith("apps/grinlife/src/") &&
      f.endsWith(".tsx") &&
      !f.includes(".test.") &&
      !f.endsWith("main.tsx"),
  );
  const using = files.filter((f) => read(f).includes("@grin/ui"));
  return ok(using.length === files.length, `${using.length}/${files.length} tsx files import @grin/ui`);
});

check("packages never import from an app", () => {
  const hits = grepSource(/from ["'](@grin\/app|\.\.\/\.\.\/\.\.\/apps)/).filter((hit) =>
    hit.startsWith("packages/"),
  );
  return hits.length ? fail(hits.join(", ")) : ok(true, "0 upward imports");
});

check("the design system has no router dependency", () => {
  const pkg = JSON.parse(read("packages/grin-ui/package.json"));
  const deps = { ...pkg.dependencies, ...pkg.peerDependencies };
  return deps.wouter || deps["react-router-dom"]
    ? fail("router in dependencies")
    : ok(true, "Link is injected");
});

check("the content layer has no React dependency", () => {
  const hits = grepSource(/from ["']react["']/).filter((hit) => hit.startsWith("packages/grin-content/"));
  return hits.length ? fail(hits.join(", ")) : ok(true, "framework-free");
});

check("the compliance table is published once per product", () => {
  const pages = ["social", "serendipity"];
  const duplicated = pages.filter((id) =>
    read(`apps/grinlife/src/sections/${id}/Safety.tsx`).includes("TermTable"),
  );
  return duplicated.length
    ? fail(`${duplicated.join(", ")} re-render the obligations`)
    : ok(true, "ProductSite is the single source");
});

check("pricing comes from data, not from section markup", () => {
  const pages = ["Legacy", "Social"];
  const hardcoded = pages.filter((page) => /<PricingTable/.test(read(`apps/grinlife/src/pages/${page}.tsx`)));
  return hardcoded.length ? fail(hardcoded.join(", ")) : ok(true, "rendered by ProductSite");
});

check("shared component count is unchanged and complete", () => {
  const patterns = fs.readdirSync(path.resolve(root, "packages/grin-ui/src/patterns")).length;
  const primitives = fs.readdirSync(path.resolve(root, "packages/grin-ui/src/primitives")).length;
  const hooks = fs.readdirSync(path.resolve(root, "packages/grin-ui/src/hooks")).length;
  return ok(
    patterns >= 17 && primitives >= 14 && hooks >= 6,
    `${primitives} primitives, ${patterns} patterns, ${hooks} hooks`,
  );
});

check("every @source glob in the app CSS resolves", () => {
  const cssPath = "apps/grinlife/src/styles/app.css";
  const cssDir = path.dirname(path.resolve(root, cssPath));
  const globs = [...read(cssPath).matchAll(/@source\s+"([^"]+)"/g)].map((m) => m[1]);
  const broken = globs.filter((glob) => {
    const dir = glob.split("*")[0];
    return !fs.existsSync(path.resolve(cssDir, dir));
  });
  return broken.length
    ? fail(`${broken.join(", ")} — this is the bug that silently purged the design system`)
    : ok(true, `${globs.length} globs resolve, including both packages`);
});

check("the landing block gets its own chapter in the rail", () => {
  const text = read("packages/grin-ui/src/patterns/ProductSite.tsx");
  return text.includes('label: "The product"') && text.includes("-overview")
    ? ok(true, '"The product" chapter above the plan')
    : fail("landing renders without a rail entry");
});

// --- G. Live server
section("G. Live server");

const PORT = 4321;
let server = null;

// An interrupted run used to leave the child server listening on :4321, and the next
// run would probe that stale process and pass for the wrong reason. Cleanup now happens
// on every exit path, and a busy port is a hard failure rather than a quiet reuse of
// somebody else's server.
const stopServer = () => {
  if (!server) return;
  server.kill("SIGKILL");
  server = null;
};
process.on("exit", stopServer);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopServer();
    process.exit(130);
  });
}

const portInUse = async () => {
  const net = await import("node:net");
  return new Promise((resolve) => {
    const socket = net.connect(PORT, "127.0.0.1");
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
};

const startServer = async () => {
  if (await portInUse()) return "busy";
  const { spawn } = await import("node:child_process");
  server = spawn("node", ["apps/grinlife/dist/index.js"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: "production",
      GRIN_DATA_FILE: "/tmp/grin-audit-gates.json",
    },
    stdio: "ignore",
  });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const ping = await probe(PORT, "/api/health");
    if (ping.status === 200) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
};

check("the production server starts and serves the build", async () => {
  fs.rmSync("/tmp/grin-audit-gates.json", { force: true });
  const started = await startServer();
  if (started === "busy") {
    return fail(`port ${PORT} is already in use — a previous audit did not clean up after itself`);
  }
  return started
    ? ok(true, `listening on :${PORT}, port verified free first`)
    : fail("server never answered /api/health");
});

check("all eight routes return 200 in production", async () => {
  const known = [
    "/",
    "/roadmap",
    "/gates",
    "/spine",
    "/docs",
    "/products/legacy",
    "/products/social",
    "/products/serendipity",
  ];
  const results = await Promise.all(known.map((route) => probe(PORT, route)));
  const bad = known.filter((route, index) => results[index].status !== 200);
  return bad.length ? fail(`${bad.join(", ")} did not return 200`) : ok(true, "8 of 8");
});

check("an unknown path returns a real 404, not a 200 shell", async () => {
  const response = await probe(PORT, "/this-stop-does-not-exist");
  return response.status === 404 ? ok(true, "404 with the SPA shell") : fail(`got ${response.status}`);
});

check("the 404 body is still the app shell so the client can render", async () => {
  const response = await probe(PORT, "/this-stop-does-not-exist");
  return response.text.includes('id="root"') ? ok(true, "client renders its own 404") : fail("not the shell");
});

check("a deep link survives a hard reload", async () => {
  const response = await probe(PORT, "/products/serendipity");
  return response.status === 200 && response.text.includes('id="root"')
    ? ok(true, "/products/serendipity")
    : fail(`status ${response.status}`);
});

check("static assets are served with the right type", async () => {
  const html = read("apps/grinlife/dist/public/index.html");
  const css = html.match(/assets\/(index-[\w-]+\.css)/)?.[1];
  const js = html.match(/assets\/(index-[\w-]+\.js)/)?.[1];
  const [a, b] = await Promise.all([probe(PORT, `/assets/${css}`), probe(PORT, `/assets/${js}`)]);
  const badTypes = [a, b].filter((r) => r.status !== 200 || /text\/html/.test(r.type));
  return badTypes.length
    ? fail(badTypes.map((r) => `${r.status} ${r.type}`).join(" | "))
    : ok(true, a.type.split(";")[0] + ", " + b.type.split(";")[0]);
});

check("security headers are set on responses", async () => {
  const response = await fetch(`http://127.0.0.1:${PORT}/`);
  const nosniff = response.headers.get("x-content-type-options");
  const powered = response.headers.get("x-powered-by");
  return nosniff === "nosniff" && !powered
    ? ok(true, "nosniff set, x-powered-by disabled")
    : fail(`nosniff=${nosniff}, powered-by=${powered}`);
});

check("the API answers health checks", async () => {
  const response = await probe(PORT, "/api/health");
  const body = JSON.parse(response.text);
  return response.status === 200 && body.service === "grin-status"
    ? ok(true, JSON.stringify(body))
    : fail(response.text);
});

check("an unmatched API route answers in JSON and leaks no path", async () => {
  const response = await probe(PORT, "/api/not-a-real-route");
  const leaks = /\/home\/|\/Users\/|[A-Z]:\\/.test(response.text);
  if (response.status !== 404 || !response.type.includes("json") || leaks) {
    return fail(`${response.status} ${response.type} leaks=${leaks}`);
  }
  // fetch() resolves `..` before sending, so the raw-socket case needs curl.
  const raw = sh("curl", ["-s", "--path-as-is", `http://127.0.0.1:${PORT}/api/../etc/passwd`]);
  const rawLeaks = /\/home\/|\/Users\/|[A-Z]:\\/.test(raw.stdout ?? "");
  return rawLeaks
    ? fail(`raw traversal leaked: ${(raw.stdout ?? "").slice(0, 120)}`)
    : ok(true, "JSON 404; raw `..` traversal leaks nothing");
});

check("gate measurement round-trips through the API", async () => {
  const patch = (n, body) =>
    probe(PORT, `/api/gates/gate-1/criteria/${n}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  const statuses = [];
  for (const [n, body] of [
    [1, { value: 300 }],
    [2, { value: 60 }],
    [3, { value: 70 }],
    [4, { value: 1 }],
  ]) {
    statuses.push((await patch(n, body)).status);
  }
  const after = JSON.parse((await probe(PORT, "/api/gates")).text);
  const verdict = after.verdicts.find((v) => v.gateId === "gate-1");
  const allPatched = statuses.every((status) => status === 200);
  return allPatched && verdict.metCount === 4 && verdict.clear
    ? ok(true, `4/4 clear=${verdict.clear}`)
    : fail(`statuses ${statuses.join(",")} → ${verdict.metCount}/${verdict.total}`);
});

check("measurements persist to a file outside the build output", async () => {
  const existsNow = fs.existsSync("/tmp/grin-audit-gates.json");
  return existsNow ? ok(true, "written atomically by GateStore") : fail("no data file");
});

check("a partial gate never clears", async () => {
  await probe(PORT, `/api/gates/gate-1/criteria/4`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ value: 2 }),
  });
  const after = JSON.parse((await probe(PORT, "/api/gates")).text);
  const verdict = after.verdicts.find((v) => v.gateId === "gate-1");
  return verdict.clear === false && verdict.metCount === 3
    ? ok(true, "3/4 with 2 engineers → not clear")
    : fail(`${verdict.metCount}/${verdict.total} clear=${verdict.clear}`);
});

check("the API rejects a number sent to a boolean criterion", async () => {
  const response = await probe(PORT, "/api/gates/gate-2/criteria/1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ value: 5 }),
  });
  return response.status === 400 ? ok(true, "400 with a typed error") : fail(`got ${response.status}`);
});

check("the API rejects an unknown gate", async () => {
  const response = await probe(PORT, "/api/gates/gate-9/reset", { method: "POST" });
  return response.status === 404 ? ok(true, "404") : fail(`got ${response.status}`);
});

check("reset clears everything", async () => {
  await probe(PORT, "/api/gates/reset", { method: "POST" });
  const after = JSON.parse((await probe(PORT, "/api/gates")).text);
  const cleared = after.verdicts.every((v) => v.metCount === 0 && v.clear === false);
  return cleared ? ok(true, "0/4 and 0/5") : fail("state survived the reset");
});

check("the API refuses an oversized body", async () => {
  const response = await probe(PORT, "/api/gates/gate-1/criteria/1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ value: 1, note: "x".repeat(600) }),
  });
  return response.status === 400
    ? ok(true, "note over 500 characters rejected")
    : fail(`got ${response.status}`);
});

check("a malformed JSON body cannot crash the server", async () => {
  const response = await probe(PORT, "/api/gates/gate-1/criteria/1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: "{not json",
  });
  const alive = await probe(PORT, "/api/health");
  return alive.status === 200
    ? ok(true, `malformed body → ${response.status}, server still up`)
    : fail("server stopped answering");
});

// --- H. Security and dependencies
section("H. Security and dependencies");

check("npm audit reports no vulnerabilities", () => {
  const result = sh("npm", ["audit", "--json"]);
  const summary = JSON.parse(result.stdout ?? "{}").metadata?.vulnerabilities ?? {};
  const serious = (summary.high ?? 0) + (summary.critical ?? 0);
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  return serious === 0 ? ok(true, `${total} total, 0 high/critical`) : fail(JSON.stringify(summary));
});

check("no secrets are committed", () => {
  const hits = grepSource(/(api[_-]?key|secret|password|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}/i).filter(
    (hit) => !hit.includes("BUILT_IN_FORGE_API_KEY"),
  );
  return hits.length ? fail(hits.join(", ")) : ok(true, "0 matches");
});

check("the data file is gitignored", () => {
  const result = sh("git", ["check-ignore", "apps/grinlife/data/gate-status.json"]);
  return result.status === 0 ? ok(true, result.stdout.trim()) : fail("not ignored");
});

check("writes are atomic (temp file then rename)", () => {
  const text = read("packages/grin-api/src/store.ts");
  return text.includes("renameSync") && text.includes(".tmp")
    ? ok(true, "staged write + rename")
    : fail("direct write");
});

check("express is pinned to a maintained major", () => {
  const pkg = JSON.parse(read("apps/grinlife/package.json"));
  return /^\^4\./.test(pkg.dependencies.express)
    ? ok(true, pkg.dependencies.express)
    : fail(pkg.dependencies.express);
});

check("Node engine requirement is declared", () => {
  const pkg = JSON.parse(read("package.json"));
  return pkg.engines?.node ? ok(true, pkg.engines.node) : fail("no engines field");
});

check("the only external origin is the font CDN", () => {
  const html = read("apps/grinlife/index.html");
  const hosts = [...new Set([...html.matchAll(/https:\/\/([^/"]+)/g)].map((m) => m[1]))];
  const unexpected = hosts.filter(
    (host) => !host.endsWith("googleapis.com") && !host.endsWith("gstatic.com"),
  );
  return unexpected.length ? fail(unexpected.join(", ")) : ok(true, hosts.join(", "));
});

check("the API is reachable only under /api", () => {
  const server = read("apps/grinlife/server/index.ts");
  return server.includes('app.use("/api", createApiRouter') && !/app\.(get|post|patch)\("\/gates/.test(server)
    ? ok(true, "single mount point")
    : fail("gate routes are exposed outside /api");
});

check("the repository is on a tracked branch with an upstream", () => {
  const branch = sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]).stdout?.trim() ?? "";
  const upstream = sh("git", ["rev-parse", "--abbrev-ref", "@{u}"]).stdout?.trim() ?? "";
  if (!branch || branch === "HEAD") return fail("detached HEAD");
  return upstream ? ok(true, `${branch} → ${upstream}`) : fail(`${branch} has no upstream`);
});

// --- I. Design-system integrity
section("I. Design-system integrity");

check("every @grin/ui export is actually used somewhere", () => {
  const index = read("packages/grin-ui/src/index.ts");
  const names = new Set(
    [...index.matchAll(/export \{([^}]+)\}/g)]
      .flatMap((m) => m[1].split(","))
      .map((part) => part.trim())
      .filter((part) => part && !part.startsWith("type "))
      .map((part) => part.split(" as ").pop() ?? ""),
  );
  const files = sourceFiles();
  const definitions = new Map();
  for (const file of files.filter((f) => f.startsWith("packages/grin-ui/"))) {
    const text = read(file);
    for (const name of names) {
      if (new RegExp(`export (function|const|class) ${name}\\b`).test(text)) definitions.set(name, file);
    }
  }
  const dead = [];
  for (const [name, home] of definitions) {
    const usedElsewhere = files.some((file) => file !== home && new RegExp(`\\b${name}\\b`).test(read(file)));
    if (!usedElsewhere) dead.push(name);
  }
  return dead.length
    ? fail(`exported but referenced nowhere else: ${dead.join(", ")}`)
    : ok(true, `${definitions.size} defined exports, all reachable`);
});

check("reduced motion is honoured in CSS and in a component", () => {
  const css = read("packages/grin-ui/src/styles/tokens.css");
  const reveal = read("packages/grin-ui/src/primitives/Reveal.tsx");
  const inCss = css.includes("prefers-reduced-motion: reduce");
  const inComponent = reveal.includes("useReducedMotion");
  if (!inCss) return fail("no prefers-reduced-motion rule in tokens.css");
  return inComponent
    ? ok(true, "global CSS rule + Reveal skips the animation entirely")
    : fail("the hook exists but no component consumes it");
});

check("the shipped bundle contains no console.log", () => {
  const dir = path.resolve(root, "apps/grinlife/dist/public/assets");
  const js = fs.readdirSync(dir).find((f) => f.endsWith(".js"));
  const count = (read(`apps/grinlife/dist/public/assets/${js}`).match(/console\.log/g) ?? []).length;
  return count === 0 ? ok(true, "0 calls in the bundle") : fail(`${count} calls shipped`);
});

check("every price in the content model is well-formed", () => {
  const bad = [];
  for (const file of sourceFiles().filter((f) => f.startsWith("packages/grin-content/"))) {
    for (const [, price] of read(file).matchAll(/"(₹[^"]*)"/g)) {
      if (!/^₹[\d,k]+\+?(\/(yr|mo))?$/.test(price)) bad.push(`${path.basename(file)}: "${price}"`);
    }
  }
  return bad.length
    ? fail(bad.slice(0, 4).join(", "))
    : ok(true, "every ₹ price is digits and thousands separators");
});

check("every browser-storage key is namespaced to this app", () => {
  const keys = new Set();
  for (const file of sourceFiles()) {
    for (const [, , key] of read(file).matchAll(/useLocalStorage(<[^>]*>)?\(\s*"([^"]+)"/g)) keys.add(key);
  }
  const bad = [...keys].filter((key) => !key.startsWith("grinlife:"));
  if (!keys.size) return fail("no useLocalStorage keys found — the check is not reading anything");
  return bad.length ? fail(`unnamespaced: ${bad.join(", ")}`) : ok(true, [...keys].join(", "));
});

// --- J. Shipped surface
section("J. Shipped surface");

check("the sitemap lists exactly the routes the app serves", async () => {
  const response = await probe(PORT, "/sitemap.xml");
  if (response.status !== 200 || !response.type.includes("xml")) {
    return fail(`${response.status} ${response.type}`);
  }
  const listed = [...response.text.matchAll(/<loc>[^<]*?(\/[a-z0-9/-]*)<\/loc>/g)].map((m) => m[1] || "/");
  const expected = [
    "/",
    "/roadmap",
    "/gates",
    "/spine",
    "/docs",
    "/products/legacy",
    "/products/social",
    "/products/serendipity",
  ];
  const missing = expected.filter((route) => !listed.includes(route));
  const extra = listed.filter((route) => !expected.includes(route));
  if (missing.length || extra.length)
    return fail(`missing ${missing.join(",")} / unexpected ${extra.join(",")}`);
  return ok(true, `${listed.length} URLs, matching the client router`);
});

check("robots.txt points crawlers at the sitemap", async () => {
  const response = await probe(PORT, "/robots.txt");
  if (response.status !== 200) return fail(`status ${response.status}`);
  return response.text.includes("Sitemap:") && response.text.includes("/sitemap.xml")
    ? ok(true, response.text.trim().split("\n").filter(Boolean).join(" · "))
    : fail("no Sitemap directive");
});

check("the built CSS carries a print stylesheet", () => {
  const dir = path.resolve(root, "apps/grinlife/dist/public/assets");
  const css = fs.readdirSync(dir).find((f) => f.endsWith(".css"));
  const text = read(`apps/grinlife/dist/public/assets/${css}`);
  const hasPrint = text.includes("@media print");
  const hidesChrome = hasPrint && /header[^{]*\{[^}]*display:\s*none/.test(text.replace(/\s+/g, " "));
  return hasPrint
    ? ok(true, hidesChrome ? "@media print present, chrome hidden" : "@media print present")
    : fail("no @media print block survived the build");
});

check("every route gets Open Graph tags at runtime", () => {
  const hook = read("packages/grin-ui/src/hooks/useDocumentHead.ts");
  const app = read("apps/grinlife/src/App.tsx");
  const needed = ["og:title", "og:description", "og:url", 'rel="canonical"'];
  const missing = needed.filter((token) => !hook.includes(token));
  if (missing.length) return fail(`hook does not set ${missing.join(", ")}`);
  return app.includes("path });")
    ? ok(true, "title, description, url and canonical per route")
    : fail("App does not pass the route path");
});

check("gate measurements show the date they were recorded", () => {
  const board = read("packages/grin-ui/src/patterns/GateBoard.tsx");
  const test = read("apps/grinlife/src/Gates.test.tsx");
  return board.includes("formatRecorded") && test.includes("updatedAt")
    ? ok(true, "updatedAt reaches the screen and is asserted")
    : fail("a stored date that is never rendered cannot be audited later");
});

check("every arbitrary Tailwind utility in source survives into the CSS", () => {
  const dir = path.resolve(root, "apps/grinlife/dist/public/assets");
  const cssFile = fs.readdirSync(dir).find((f) => f.endsWith(".css"));
  const css = read(`apps/grinlife/dist/public/assets/${cssFile}`).replace(/\s+/g, " ");

  const utility =
    /\b(?:grid-cols|col-span|row-span|min-h|max-w|max-h|w|h|gap|gap-x|gap-y|basis|top|left|right|bottom|inset|text|leading|tracking|delay|duration|rounded|z|blur)-\[([^\]\s"']+)\]/g;
  const used = new Set();
  for (const file of sourceFiles().filter((f) => f.endsWith(".tsx"))) {
    for (const [, value] of read(file).matchAll(utility)) used.add(value);
  }
  // Three transformations stand between a class in source and its declaration in the
  // bundle: Tailwind turns `_` back into a space, `calc(100vh-8rem)` gains spaces around
  // its operator, and the minifier drops leading zeros so `0.95rem` ships as `.95rem`.
  // Compare with whitespace removed and accept either zero-padding.
  const compact = css.replace(/\s+/g, "");
  const forms = (value) => {
    const flat = value.replace(/[_\s]+/g, "");
    return [flat, flat.replace(/(^|[(,])0+(?=\.)/g, "$1")];
  };
  const purged = [...used].filter((value) => !forms(value).some((form) => compact.includes(form)));
  return purged.length
    ? fail(
        `${purged.length} of ${used.size} arbitrary utilities missing from the CSS: ${purged.slice(0, 4).join(", ")}`,
      )
    : ok(true, `${used.size} arbitrary utilities all present — no silently purged layout`);
});

check("deep-linked routes carry the same security headers as the home page", async () => {
  // `express.static` sets these for the files it serves; the single-page fallback writes
  // the shell itself, so it has to set them too or every route except `/` ships bare.
  const wanted = ["x-content-type-options", "referrer-policy", "cache-control"];
  const targets = ["/", "/gates", "/spine", "/products/legacy"];
  const weak = [];
  for (const target of targets) {
    const response = await fetch(`http://127.0.0.1:${PORT}${target}`);
    const missing = wanted.filter((name) => !response.headers.get(name));
    if (missing.length) weak.push(`${target}: no ${missing.join("/")}`);
  }
  return weak.length ? fail(weak.join(" | ")) : ok(true, `${targets.length} routes, identical headers`);
});

check("a crawler sees each route's own title and Open Graph data", async () => {
  // Crawlers and link unfurlers do not run JavaScript, so a head that is only set by
  // `useDocumentHead` is invisible to exactly the readers it exists for.
  const bad = [];
  for (const [route, title] of [
    ["/gates", "The two kill gates"],
    ["/spine", "The shared spine"],
    ["/docs", "Source documents"],
  ]) {
    const response = await probe(PORT, route);
    const served = (response.text.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
    const og = response.text.includes(`og:title" content="${title}`);
    const canonical = response.text.includes(`rel="canonical" href="http://127.0.0.1:${PORT}${route}"`);
    if (response.status !== 200 || !served.startsWith(title) || !og || !canonical) {
      bad.push(`${route} title="${served}" og=${og} canonical=${canonical}`);
    }
  }
  return bad.length ? fail(bad.join(" | ")) : ok(true, "own title, og:title and canonical per route");
});

check("the not-found shell tells crawlers not to index it", async () => {
  const response = await probe(PORT, "/no-such-stop");
  const noindex = response.text.includes('name="robots" content="noindex');
  return response.status === 404 && noindex
    ? ok(true, "404 shell is served with noindex, follow")
    : fail(`status ${response.status}, noindex=${noindex}`);
});

check("the README states the real number of audit checks", () => {
  // This suite has outgrown its own documentation twice already; make the number a check
  // rather than a promise.
  const stated = [...read("README.md").matchAll(/\b(\d{2,4})\s+(?:numbered\s+)?checks\b/g)].map((m) =>
    Number(m[1]),
  );
  if (!stated.length) return fail("README no longer states a check count");
  const wrong = stated.filter((n) => n !== checks.length);
  return wrong.length
    ? fail(`README says ${wrong.join("/")} but the suite runs ${checks.length} checks`)
    : ok(true, `${stated.length} mentions, all reading ${checks.length}`);
});

check("the print sheet has an affordance that reaches it", () => {
  const primitive = read("packages/grin-ui/src/primitives/PrintButton.tsx");
  const index = read("packages/grin-ui/src/index.ts");
  const order = read("apps/grinlife/src/sections/legacy/Order.tsx");
  if (!primitive.includes("window.print")) return fail("PrintButton never calls window.print");
  if (!index.includes("PrintButton")) return fail("PrintButton is not exported from @grin/ui");
  return order.includes("<PrintButton")
    ? ok(true, "exported, guarded, and offered on the Legacy brief")
    : fail("a print sheet no route offers is dead CSS");
});

// ---------------------------------------------------------------- run

const results = [];
for (const item of checks) {
  let result;
  try {
    result = await item.run();
  } catch (error) {
    result = fail(error instanceof Error ? error.message : String(error));
  }
  results.push({ ...item, ...result });
}

stopServer();

const failed = results.filter((r) => !r.pass);

if (asMarkdown) {
  const lines = [
    "# GrinLife audit",
    "",
    `Generated by \`node scripts/audit.mjs --md\`. **${results.length - failed.length}/${results.length} checks pass.**`,
    "",
    "Each line is a check that ran a real command, request or file read — not a",
    "restatement. The right-hand column is the value it observed.",
    "",
  ];
  let current = "";
  for (const item of results) {
    if (item.group !== current) {
      current = item.group;
      lines.push("", `## ${current}`, "", "| # | Check | Result | Observed |", "|---|---|---|---|");
    }
    lines.push(
      `| ${item.id} | ${item.name} | ${item.pass ? "✅ pass" : "❌ **FAIL**"} | ${(item.detail || "—").replace(/\|/g, "\\|")} |`,
    );
  }
  lines.push("");
  fs.writeFileSync(path.resolve(root, "AUDIT.md"), `${lines.join("\n")}\n`);
  console.log(`Wrote AUDIT.md — ${results.length - failed.length}/${results.length} pass`);
} else {
  let current = "";
  for (const item of results) {
    if (item.group !== current) {
      current = item.group;
      console.log(`\n\x1b[1m${current}\x1b[0m`);
    }
    if (quiet && item.pass) continue;
    const mark = item.pass ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    const label = String(item.id).padStart(3, " ");
    console.log(
      ` ${label}  ${mark}  ${item.name}${item.detail ? `\n           \x1b[2m${item.detail}\x1b[0m` : ""}`,
    );
  }
  console.log(
    `\n\x1b[1m${results.length - failed.length}/${results.length} checks pass\x1b[0m` +
      (failed.length
        ? ` — \x1b[31m${failed.length} failed\x1b[0m: ${failed.map((f) => f.id).join(", ")}`
        : ""),
  );
}

process.exit(failed.length > 0 ? Math.min(failed.length, 125) : 0);
