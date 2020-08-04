import * as path from "path";
import template, { getThemeMeta, SchemeName } from "./template";
import { kebabCase } from "lodash";
import {
  getFilePath,
  writeFile,
  getPackageJSON,
  formatJSON,
  updatePackageJSON,
} from "./utils";

const schemes: SchemeName[] = ["dark", "darkContrast", "light"];
let pkgJSON = getPackageJSON();

build();

function build() {
  let themes: ReturnType<typeof getThemeMeta>[] = [];
  for (let variant of schemes) {
    for (let italic of [true, false]) {
      writeFile(
        getFilePath(variant, italic),
        getThemeFromTemplate(variant, italic)
      );
      themes.push(getThemeMeta(variant, italic));
    }
    console.log(`Updated ${variant}`);
  }

  pkgJSON = {
    ...pkgJSON,
    contributes: {
      ...pkgJSON.contributes,
      themes,
    },
  };

  updatePackageJSON(JSON.stringify(pkgJSON));
}

function getThemeFromTemplate(variant: SchemeName, italic: boolean) {
  return JSON.stringify(template(variant, italic), null, "\t");
}
