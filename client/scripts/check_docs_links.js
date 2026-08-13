// Script to check the validity of documentation links.

import * as newDocsLinks from "../src/utils/constants/NewDocs.ts";

async function checkLink(name, url) {
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    return { name, url, status: response.status, ok: response.ok };
  } catch (error) {
    return { name, url, status: null, ok: false, error: error.message };
  }
}

async function main() {
  const links = Object.entries(newDocsLinks).filter(
    ([, value]) => typeof value === "string",
  );

  const results = await Promise.all(
    links.map(([name, url]) => checkLink(name, url)),
  );

  const failures = results.filter((result) => !result.ok);

  for (const result of results) {
    const label = result.ok ? "OK  " : "FAIL";
    const detail = result.error ?? result.status;
    console.log(`[${label}] ${result.name} -> ${result.url} (${detail})`);
  }

  if (failures.length > 0) {
    console.error(
      `\n${failures.length}/${results.length} NewDocs link(s) failed.`,
    );
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${results.length} NewDocs links are reachable.`);
  }
}

main();
