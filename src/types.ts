import slimy from "slimy";

export type SchemeName = keyof typeof slimy;

export type ColorTheme = {
  name: string;
  type: "light" | "dark";
  colors: Record<string, string>;
  tokenColors: {
    name?: string;
    scope?: string | string[];
    settings: {
      background?: string;
      foreground?: string;
      fontStyle?:
        | "italic"
        | "bold"
        | "underline"
        | "bold italic"
        | "bold italic underline"
        | "bold underline"
        | "italic underline"
        | "";
    };
  }[];
  semanticHighlighting: boolean;
  semanticTokenColors?: Record<string, string>;
};
