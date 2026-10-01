import fs from "fs";
import path from "path";

const ROOT = process.cwd();

export function listMd(dirName: "Req" | "Spec" | "Job") {
  const dir = path.join(ROOT, dirName);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();
}

export function readMd(dirName: "Req" | "Spec" | "Job", file: string) {
  const p = path.join(ROOT, dirName, file);
  return fs.readFileSync(p, "utf-8");
}
