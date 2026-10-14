import { describe, expect, it } from "vitest";

import * as newDocsLinks from "./NewDocs.ts";

// Check the validity of documentation links.
describe.skip("Docs links", () => {
  const links = Object.entries(newDocsLinks).filter(
    ([, value]) => typeof value === "string",
  );

  links.forEach(([name, link]) => {
    it(`"${name}": "${link}" can be resolved`, async ({ annotate }) => {
      const { status } = await fetch(link, {
        method: "GET",
        redirect: "follow",
      });
      expect(status).toBe(200);

      const { status: statusNoRedirect } = await fetch(link, {
        method: "GET",
        redirect: "manual",
      });
      if (statusNoRedirect != 200) {
        await annotate(`Got redirected (HTTP ${statusNoRedirect})`, "warning");
      }
    });
  });
});
