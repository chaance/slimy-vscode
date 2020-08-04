import * as fs from "fs";
import { kebabCase } from "lodash";
import * as path from "path";
import * as prettier from "prettier";

import { CHARSET, ROOT_DIR, THEMES_DIR } from "./constants";
import { SchemeName } from "./types";

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

export function isThemeHighContrast(variant: SchemeName) {
  return variant.toLowerCase().includes("contrast");
}

export function getThemeType(variant: SchemeName) {
  return variant.toLowerCase().includes("light") ? "light" : "dark";
}

export function getThemeName(variant: SchemeName, italics: boolean) {
  const highContrast = isThemeHighContrast(variant);
  const type = getThemeType(variant);
  return joinExisting(
    [
      "Slimy",
      wrapExisting(
        joinExisting(
          [
            type === "light" && "light",
            highContrast && "high-contrast",
            !italics && "no italics",
          ],
          ", "
        ),
        ["(", ")"]
      ),
    ],
    " "
  );
}

export function getThemeMeta(variant: SchemeName, italics: boolean) {
  return {
    label: getThemeName(variant, italics),
    uiTheme: getThemeType(variant) === "dark" ? "vs-dark" : "vs",
    path: `./themes/${getThemeFileName(variant, italics)}`,
  };
}

export function wrapExisting(str: string, pair: [string, string]) {
  return str ? pair[0] + str + pair[1] : str;
}

export function joinExisting(arr: string[], separator?: string) {
  return arr.filter(Boolean).join(separator);
}

export function warnWithStackTrace(warning?: any, ...optionalParams: any[]) {
  console.warn(warning, ...optionalParams);
  console.trace();
}
