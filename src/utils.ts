import * as fs from "fs";
import { kebabCase } from "lodash";
import * as path from "path";
import * as prettier from "prettier";

import { CHARSET, ROOT_DIR, THEMES_DIR } from "./constants";

export function ensureDir(dirname: string) {
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }
}

export function getPackageJSON() {
  return require(path.join(ROOT_DIR, "package.json"));
}

export function formatJSON(content: string) {
  return prettier.format(content, { parser: "json" });
}

export function updatePackageJSON(content: string) {
  writeFile(path.join(ROOT_DIR, "package.json"), formatJSON(content));
}

export function writeFile(fileName: string, content: string) {
  fs.writeFileSync(fileName, content, { encoding: CHARSET });
}

export function getThemeFileName(variant: string, italic: boolean) {
  return [
    "slimy",
    kebabCase(variant),
    !italic && "noitalics",
    "color-theme.json",
  ]
    .filter(Boolean)
    .join("-");
}

export function getFilePath(variant: string, italic: boolean) {
  return path.join(THEMES_DIR, getThemeFileName(variant, italic));
}
