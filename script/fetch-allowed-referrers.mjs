// Downloads the referrer allow list once per build and writes it to a local data
// file, so pages can inline it without hitting the network per render.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://www.openhomefoundation.org/allowed-referrers.json";
const OUTPUT = fileURLToPath(
  new URL("../src/_data/allowedReferrers.json", import.meta.url)
);

async function main() {
  await mkdir(dirname(OUTPUT), { recursive: true });

  const response = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "bthome.io-build" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || !data.every((d) => typeof d === "string")) {
    throw new Error("payload is not an array of strings");
  }

  const referrers = data
    .map((d) => d.trim().toLowerCase().replace(/\.$/, ""))
    .filter((d) => d.length > 0);

  await writeFile(OUTPUT, JSON.stringify(referrers, null, 2) + "\n");
  console.log(`[allowed-referrers] wrote ${referrers.length} domains`);
}

main().catch(async (error) => {
  console.warn(
    `[allowed-referrers] fetch failed, keeping existing file. ${error}`
  );

  // Never hard-fail the build: if there is no file at all yet, write an empty
  // list so the template still has something to inline.
  await mkdir(dirname(OUTPUT), { recursive: true }).catch(() => {});
  await writeFile(OUTPUT, "[]\n", { flag: "wx" }).catch(() => {});
});
