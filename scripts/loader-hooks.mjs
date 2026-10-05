// Lets plain Node import the app's own modules in the test scripts: the app
// writes extensionless relative imports ("./wordbanks") and "@/..." aliases,
// which Next resolves but Node's ESM loader doesn't. Registered by
// scripts/register-loader.mjs; used via `node --import ./scripts/register-loader.mjs`.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, nextResolve) {
  let target = null;
  if (specifier.startsWith("@/")) target = path.join(root, specifier.slice(2));
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:"))
    target = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  if (target && !path.extname(target) && existsSync(`${target}.js`)) {
    return nextResolve(pathToFileURL(`${target}.js`).href, context);
  }
  return nextResolve(specifier, context);
}
