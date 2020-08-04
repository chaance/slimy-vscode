import slimy, { Color } from "slimy";
import { getThemeFileName } from "./utils";

export type SchemeName = keyof typeof slimy;

const transparent = "#f0f0f000";

const WCAG_RATIO_AA = 4.5;
const WCAG_RATIO_AAA = 7.1;

type ColorTheme = {
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

export function template(variant: SchemeName, italics: boolean): ColorTheme {
  const scheme = slimy[variant];
  const type = getThemeType(variant);
  const highContrast = isThemeHighContrast(variant);

  const name = getThemeName(variant, italics);

  // A few helpers to check contrast ratios for common BG/FG checks
  const prefers = highContrast ? preferredColorContrast : preferredColor;
  const fgColorIfContrastChecks = (baseColor: Color) =>
    prefers(
      baseColor,
      scheme.common.fg,
      scheme.common.bg,
      scheme.chalk.black,
      scheme.chalk.white
    );
  const bgColorIfContrastChecks = (baseColor: Color) =>
    prefers(
      baseColor,
      scheme.common.bg,
      scheme.common.fg,
      scheme.chalk.white,
      scheme.chalk.black
    );

  const badgeBackground = scheme.common.accent[darkenIfDark(type)](1);
  const badgeForeground = fgColorIfContrastChecks(badgeBackground);

  const buttonBackground = scheme.ui.button.bg;
  const buttonForeground = fgColorIfContrastChecks(buttonBackground);
  const secondaryButtonBackground = scheme.common.accent;
  const secondaryButtonForeground = fgColorIfContrastChecks(
    secondaryButtonBackground
  );

  const listActiveSelectionBackground = scheme.ui.list.activeBg;
  const listActiveSelectionForeground = prefers(
    scheme.ui.list.activeBg,
    scheme.ui.list.activeFg,
    scheme.common.fg,
    scheme.common.bg
  );

  const listHoverBackground = scheme.ui.list.hoverBg;
  const listHoverForeground = prefers(
    scheme.ui.list.hoverBg,
    scheme.ui.list.hoverFg,
    scheme.common.fg,
    scheme.common.bg
  );

  const selectionBackground = scheme.ui.selection.bg;
  const selectionForeground = scheme.common.fg;

  const syntaxTypeParam = scheme.syntax.type.alpha(0.75);
  const syntaxEnum = scheme.syntax.type.brighten(0.15);
  const syntaxEnumMember = scheme.syntax.variable.brighten(0.15);
  const syntaxInterface = scheme.syntax.type.brighten(0.15);
  const syntaxNamespace = scheme.syntax.type.brighten(0.2);
  const syntaxNull = scheme.syntax.error.alpha(0.65);
  const syntaxUndefined = scheme.syntax.error.alpha(0.55);
  const syntaxNaN = scheme.syntax.error.alpha(0.75);
  const syntaxObjectKey = scheme.syntax.string.fade(0.3);
  const syntaxKeywordControl = scheme.syntax.entity
    .desaturate(1)
    [brightenIfDark(type)](0.6);
  const syntaxReference = scheme.syntax.markup[brightenIfDark(type)](0.3);

  return {
    name,
    type,
    // https://code.visualstudio.com/api/references/theme-color
    colors: {
      ...(highContrast ? {
        "contrastActiveBorder": scheme.common.accent.hex(),
        "contrastBorder": scheme.common.accent.alpha(0.5).hex(),
      } : {}),

      // Base colors
      // @link https://code.visualstudio.com/api/references/theme-color#base-colors
      "focusBorder": scheme.common.ui.fade(0.4).hex(),
      "foreground": scheme.common.ui.hex(),
      "widget.shadow": scheme.ui.panel.shadow?.hex() || transparent,
      "selection.background": selectionBackground.alpha(0.4).hex(),
      "descriptionForeground": scheme.common.ui.hex(),
      "errorForeground": scheme.syntax.error.hex(),
      "icon.foreground": scheme.common.ui.hex(),

      // Window border
      // @link https://code.visualstudio.com/api/references/theme-color#window-border
      "window.activeBorder": transparent,
      "window.inactiveBorder": transparent,

      // Text colors
      // @link https://code.visualstudio.com/api/references/theme-color#text-colors
      "textBlockQuote.background": scheme.ui.panel.bg.hex(),
      "textBlockQuote.border": scheme.ui.panel.border?.hex() || transparent,
      "textCodeBlock.background": scheme.ui.popover.bg.hex(),
      "textLink.activeForeground": scheme.common.accent.brighten(0.2).hex(),
      "textLink.foreground": scheme.common.accent.hex(),
      "textPreformat.foreground": scheme.common.fg.hex(),
      "textSeparator.foreground": scheme.common.ui.hex(),

      // Button control
      // @link https://code.visualstudio.com/api/references/theme-color#button-control
      "button.background": buttonBackground.hex(),
      "button.foreground": buttonForeground.hex(),
      "button.hoverBackground": buttonBackground[darkenIfDark(type)](0.2).hex(),
      "button.secondaryBackground": secondaryButtonBackground.hex(),
      "button.secondaryForeground": secondaryButtonForeground.hex(),
      "button.secondaryHoverBackground": secondaryButtonBackground[
        darkenIfDark(type)
      ](0.2).hex(),
      "checkbox.background": scheme.ui.popover.bg.hex(),
      "checkbox.foreground": scheme.common.ui.hex(),
      "checkbox.border": scheme.ui.popover.border?.hex() || transparent,

      // Dropdown control
      // @link https://code.visualstudio.com/api/references/theme-color#dropdown-control
      "dropdown.background": scheme.ui.popover.bg.hex(),
      "dropdown.listBackground": scheme.ui.popover.bg.hex(),
      "dropdown.border": scheme.ui.popover.border?.hex() || transparent,
      "dropdown.foreground": scheme.common.ui.hex(),

      // Input control
      // @link https://code.visualstudio.com/api/references/theme-color#input-control
      "input.background": scheme.ui.popover.bg.hex(),
      "input.border": scheme.ui.popover.border?.hex() || transparent,
      "input.foreground": scheme.common.fg.hex(),
      "input.placeholderForeground": scheme.common.ui.fade(0.3).hex(),
      "inputOption.activeBackground": scheme.ui.popover.bg.hex(),
      "inputOption.activeBorder": scheme.common.accent.hex(),
      "inputOption.activeForeground": scheme.common.fg.hex(),
      "inputValidation.errorBackground": scheme.ui.popover.bg.hex(),
      "inputValidation.errorBorder": scheme.ui.state.error.hex(),
      "inputValidation.errorForeground": scheme.common.fg.hex(),
      "inputValidation.infoBackground": scheme.ui.popover.bg.hex(),
      "inputValidation.infoBorder": scheme.ui.state.info.hex(),
      "inputValidation.infoForeground": scheme.common.fg.hex(),
      "inputValidation.warningBackground": scheme.ui.popover.bg.hex(),
      "inputValidation.warningBorder": scheme.ui.state.warning.hex(),
      "inputValidation.warningForeground": scheme.common.fg.hex(),

      // Scrollbar control
      // @link https://code.visualstudio.com/api/references/theme-color#scrollbar-control
      "scrollbar.shadow": transparent,
      "scrollbarSlider.activeBackground": scheme.common.ui
        .alpha(highContrast ? 0.9 : 0.5)
        .hex(),
      "scrollbarSlider.background": scheme.common.ui
        .alpha(highContrast ? 0.5 : 0.2)
        .hex(),
      "scrollbarSlider.hoverBackground": scheme.common.ui
        .alpha(highContrast ? 0.8 : 0.4)
        .hex(),

      // Badge
      // @link https://code.visualstudio.com/api/references/theme-color#badge
      "badge.background": badgeBackground.hex(),
      "badge.foreground": badgeForeground.hex(),

      // Progress bar
      // @link https://code.visualstudio.com/api/references/theme-color#progress-bar
      "progressBar.background": scheme.common.accent.hex(),

      // Lists and trees
      // @link https://code.visualstudio.com/api/references/theme-color#lists-and-trees
      "list.activeSelectionBackground": listActiveSelectionBackground.hex(),
      "list.activeSelectionForeground": listActiveSelectionForeground.hex(),
      "list.dropBackground": listActiveSelectionBackground.hex(),
      "list.focusBackground": listActiveSelectionBackground.hex(),
      "list.focusForeground": listActiveSelectionForeground.hex(),
      "list.highlightForeground": scheme.common.accent[brightenIfDark(type)](
        0.2
      ).hex(),
      "list.hoverBackground": listHoverBackground.hex(),
      "list.hoverForeground": listHoverForeground.hex(),
      "list.inactiveSelectionBackground": listActiveSelectionBackground
        .alpha(0.5)
        .hex(),
      "list.inactiveSelectionForeground": listActiveSelectionForeground
        .alpha(0.5)
        .hex(),
      "list.invalidItemForeground": scheme.common.ui.alpha(0.7).hex(),
      "list.errorForeground": scheme.ui.state.error[brightenIfDark(type)](
        0.2
      ).hex(),
      "list.warningForeground": scheme.ui.state.warning[brightenIfDark(type)](
        0.2
      ).hex(),
      "listFilterWidget.background": scheme.ui.popover.bg.hex(),
      "listFilterWidget.outline":
        scheme.ui.popover.border?.hex() || transparent,
      "listFilterWidget.noMatchesOutline": scheme.ui.state.error.hex(),
      "list.filterMatchBackground": scheme.common.accent.alpha(0.05).hex(),
      "list.filterMatchBorder": scheme.common.accent.hex(),
      "tree.indentGuidesStroke": transparent,
      "list.deemphasizedForeground": scheme.common.fg.fade(0.25).hex(),

      // Activity Bar
      // @link https://code.visualstudio.com/api/references/theme-color#activity-bar
      "activityBar.background": scheme.common.bg.hex(),
      "activityBar.dropBorder": scheme.common.accent.hex(),
      "activityBar.foreground": scheme.common.ui
        .alpha(highContrast ? 1 : 0.6)
        .hex(),
      "activityBar.inactiveForeground": scheme.common.ui
        .alpha(highContrast ? 0.6 : 0.4)
        .hex(),
      "activityBar.border": transparent,
      "activityBarBadge.background": badgeBackground.hex(),
      "activityBarBadge.foreground": badgeForeground.hex(),
      "activityBar.activeBorder": transparent,
      "activityBar.activeBackground": transparent,
      "activityBar.activeFocusBorder": highContrast
        ? scheme.common.accent.hex()
        : transparent,

      // Side Bar
      // @link https://code.visualstudio.com/api/references/theme-color#side-bar
      "sideBar.background": scheme.common.bg.hex(),
      "sideBar.foreground": scheme.common.fg.hex(),
      "sideBar.border": transparent,
      "sideBar.dropBackground": transparent,
      "sideBarTitle.foreground": scheme.common.ui.hex(),
      "sideBarSectionHeader.background": scheme.common.bg.hex(),
      "sideBarSectionHeader.foreground": scheme.common.ui.hex(),
      "sideBarSectionHeader.border": transparent,

      // Minimap
      // @link https://code.visualstudio.com/api/references/theme-color#minimap
      // 'minimap.findMatchHighlight': '',
      // 'minimap.selectionHighlight': '',
      // 'minimap.errorHighlight': '',
      // 'minimap.warningHighlight': '',
      // 'minimap.background': '',
      // 'minimapSlider.background': '',
      // 'minimapSlider.hoverBackground': '',
      // 'minimapSlider.activeBackground': '',
      // 'minimapGutter.addedBackground': '',
      // 'minimapGutter.modifiedBackground': '',
      // 'minimapGutter.deletedBackground': '',

      // Editor Groups & Tabs
      // @link https://code.visualstudio.com/api/references/theme-color#editor-groups-tabs
      // Editor Groups are the containers of editors. There can be many editor groups.
      "editorGroup.border": transparent,
      "editorGroup.dropBackground": scheme.common.accent.alpha(0.2).hex(),
      "editorGroupHeader.noTabsBackground": scheme.common.bg.hex(),
      "editorGroupHeader.tabsBackground": scheme.common.bg.hex(),
      "editorGroupHeader.tabsBorder": transparent,
      "editorGroupHeader.border": transparent,
      "editorGroup.emptyBackground": scheme.common.bg.hex(),
      "editorGroup.focusedEmptyBorder": transparent,
      // A Tab is the container of an editor. Multiple Tabs can be opened in one editor group.
      "tab.activeBackground": scheme.common.bg.brighten(0.4).hex(),
      "tab.unfocusedActiveBackground": scheme.common.bg.brighten(0.4).hex(),
      "tab.activeForeground": fgColorIfContrastChecks(
        scheme.common.bg.brighten(0.4)
      ).hex(),
      "tab.border": transparent,
      "tab.activeBorder": transparent,
      "tab.unfocusedActiveBorder": transparent,
      "tab.activeBorderTop": scheme.common.accent.hex(),
      "tab.unfocusedActiveBorderTop": transparent,
      "tab.inactiveBackground": scheme.common.bg.hex(),
      "tab.inactiveForeground": scheme.common.ui.hex(),
      "tab.unfocusedActiveForeground": fgColorIfContrastChecks(
        scheme.common.bg.brighten(0.4)
      ).hex(),
      "tab.unfocusedInactiveForeground": scheme.common.ui.hex(),
      "tab.hoverBackground": scheme.common.bg.brighten(0.2).hex(),
      "tab.unfocusedHoverBackground": scheme.common.bg.brighten(0.2).hex(),
      "tab.hoverForeground": fgColorIfContrastChecks(
        scheme.common.bg.brighten(0.2)
      ).hex(),
      "tab.unfocusedHoverForeground": fgColorIfContrastChecks(
        scheme.common.bg.brighten(0.2)
      ).hex(),
      "tab.hoverBorder": transparent,
      "tab.unfocusedHoverBorder": transparent,
      // 'tab.activeModifiedBorder': '',
      // 'tab.inactiveModifiedBorder': '',
      // 'tab.unfocusedActiveModifiedBorder': '',
      // 'tab.unfocusedInactiveModifiedBorder': '',
      "editorPane.background": scheme.common.bg.hex(),

      // Editor colors
      // @link https://code.visualstudio.com/api/references/theme-color#editor-colors
      "editor.background": scheme.common.bg.hex(),
      "editor.foreground": scheme.common.fg.hex(),
      "editorLineNumber.foreground": scheme.ui.gutter.normal.hex(),
      "editorLineNumber.activeForeground": scheme.ui.gutter.active.hex(),
      "editorCursor.background": transparent,
      "editorCursor.foreground": scheme.common.accent.hex(),

      // Selection colors are visible when selecting one or more characters. In
      // addition to the selection also all regions with the same content are
      // highlighted.
      "editor.selectionBackground": selectionBackground.hex(),
      "editor.selectionForeground": selectionForeground.hex(),
      "editor.inactiveSelectionBackground": scheme.ui.selection.inactive.hex(),
      "editor.selectionHighlightBackground": scheme.ui.selection.inactive.hex(),
      "editor.selectionHighlightBorder":
        scheme.ui.selection.border?.hex() || transparent,

      // Word highlight colors are visible when the cursor is inside a symbol or
      // a word. Depending on the language support available for the file type,
      // all matching references and declarations are highlighted and read and
      // write accesses get different colors. If document symbol language
      // support is not available, this falls back to word highlighting.
      "editor.wordHighlightBackground": scheme.vcs.modified.alpha(0.07).hex(),
      "editor.wordHighlightBorder": transparent,
      "editor.wordHighlightStrongBackground": scheme.vcs.added
        .alpha(0.07)
        .hex(),
      "editor.wordHighlightStrongBorder": transparent,

      // Find colors depend on the current find string in the Find/Replace
      // dialog.
      "editor.findMatchBackground": scheme.common.accent.alpha(0.05).hex(),
      "editor.findMatchBorder": transparent,
      "editor.findMatchHighlightBackground": scheme.common.accent
        .alpha(0.05)
        .hex(),
      "editor.findMatchHighlightBorder": transparent,
      "editor.findRangeHighlightBackground": scheme.ui.selection.inactive.hex(),
      "editor.findRangeHighlightBorder": transparent,

      // 'searchEditor.findMatchBackground': '',
      // 'searchEditor.findMatchBorder': '',
      // 'searchEditor.textInputBorder': '',

      // The hover highlight is shown behind the symbol for which a hover is
      // shown.
      "editor.hoverHighlightBackground": scheme.common.bg
        .darken(0.8)
        .alpha(0.2)
        .hex(),

      // The current line is typically shown as either background highlight or a
      // border (not both).
      "editor.lineHighlightBackground": scheme.common.bg.darken(0.2).hex(),
      "editor.lineHighlightBorder": transparent,

      // The link color is visible when clicking on a link.
      "editorLink.activeForeground": scheme.common.accent.hex(),

      // The range highlight is visible when selecting a search result.
      "editor.rangeHighlightBackground": scheme.common.bg
        .darken(0.8)
        .alpha(0.2)
        .hex(),
      "editor.rangeHighlightBorder": transparent,

      // The symbol highlight is visible when navigating to a symbol via a
      // command such as `Go to Definition`.
      "editor.symbolHighlightBackground": scheme.common.bg
        .darken(0.8)
        .alpha(0.2)
        .hex(),
      "editor.symbolHighlightBorder": transparent,

      // To see the editor white spaces, enable `Toggle Render Whitespace`.
      "editorWhitespace.foreground": scheme.ui.gutter.normal.hex(),

      // To see the editor indent guides, set `"editor.renderIndentGuides": true`.
      "editorIndentGuide.background": scheme.ui.guide.normal.hex(),
      "editorIndentGuide.activeBackground": scheme.ui.guide.active.hex(),

      // To see editor rulers, define their location with `"editor.rulers"`
      "editorRuler.foreground": scheme.ui.guide.normal.hex(),

      // CodeLens
      "editorCodeLens.foreground": scheme.syntax.comment.hex(),

      // Lightbulb
      "editorLightBulb.foreground": scheme.common.accent.hex(),
      // 'editorLightBulbAutoFix.foreground': '',

      // Bracket matches
      "editorBracketMatch.background": scheme.ui.gutter.normal.alpha(0.3).hex(),
      "editorBracketMatch.border": scheme.ui.gutter.active.alpha(0.6).hex(),

      // Folding
      // 'editor.foldBackground': '',

      // The overview ruler is located beneath the scroll bar on the right edge
      // of the editor and gives an overview of the decorations in the editor.
      // 'editorOverviewRuler.background': '',
      "editorOverviewRuler.border": transparent,
      "editorOverviewRuler.findMatchForeground": scheme.common.accent
        .alpha(0.8)
        .hex(),
      // 'editorOverviewRuler.rangeHighlightForeground': '',
      // 'editorOverviewRuler.selectionHighlightForeground': '',
      "editorOverviewRuler.wordHighlightForeground": scheme.common.accent
        .alpha(0.4)
        .hex(),
      "editorOverviewRuler.wordHighlightStrongForeground": scheme.common.accent
        .alpha(0.4)
        .hex(),
      "editorOverviewRuler.modifiedForeground": scheme.syntax.entity
        .alpha(0.35)
        .hex(),
      "editorOverviewRuler.addedForeground": scheme.vcs.added.alpha(0.6).hex(),
      "editorOverviewRuler.deletedForeground": scheme.vcs.removed
        .alpha(0.6)
        .hex(),
      "editorOverviewRuler.errorForeground": scheme.syntax.error.hex(),
      "editorOverviewRuler.warningForeground": scheme.ui.state.warning.hex(),
      "editorOverviewRuler.infoForeground": scheme.common.accent.hex(),
      // 'editorOverviewRuler.bracketMatchForeground': '',

      // Errors and warnings
      "editorError.foreground": scheme.ui.state.error.hex(),
      "editorError.border": transparent,
      "editorWarning.foreground": scheme.syntax.entity.hex(),
      "editorWarning.border": transparent,
      "editorInfo.foreground": scheme.common.accent.hex(),
      "editorInfo.border": transparent,
      "editorHint.border": transparent,
      // 'problemsErrorIcon.foreground': '',
      // 'problemsWarningIcon.foreground': '',
      // 'problemsInfoIcon.foreground': '',

      // Unused source code
      // 'editorUnnecessaryCode.border': '',
      // 'editorUnnecessaryCode.opacity': '',

      // The gutter contains the glyph margins and the line numbers
      "editorGutter.background": scheme.common.bg.hex(),
      "editorGutter.modifiedBackground": scheme.vcs.modified.alpha(0.6).hex(),
      "editorGutter.addedBackground": scheme.vcs.added.alpha(0.6).hex(),
      "editorGutter.deletedBackground": scheme.vcs.removed.alpha(0.6).hex(),
      // 'editorGutter.commentRangeForeground': '',
      // 'editorGutter.foldingControlForeground': '',

      // Diff editor colors
      // @link https://code.visualstudio.com/api/references/theme-color#diff-editor-colors
      "diffEditor.insertedTextBackground": scheme.vcs.added.alpha(0.25).hex(),
      "diffEditor.insertedTextBorder": transparent,
      "diffEditor.removedTextBackground": scheme.vcs.removed.alpha(0.25).hex(),
      "diffEditor.removedTextBorder": transparent,
      "diffEditor.border": transparent,
      // 'diffEditor.diagonalFill': '',

      // Editor widget colors
      // @link https://code.visualstudio.com/api/references/theme-color#editor-widget-colors
      "editorWidget.foreground": scheme.common.fg.hex(),
      "editorWidget.background": scheme.ui.popover.bg.hex(),
      "editorWidget.border": scheme.ui.popover.border?.hex() || transparent,
      "editorWidget.resizeBorder":
        scheme.ui.popover.border?.hex() || transparent,
      "editorSuggestWidget.background": scheme.ui.popover.bg.hex(),
      "editorSuggestWidget.border":
        scheme.ui.popover.border?.hex() || transparent,
      "editorSuggestWidget.foreground": scheme.common.ui.brighten(0.2).hex(),
      "editorSuggestWidget.highlightForeground": scheme.common.ui
        .brighten(0.2)
        .hex(),
      "editorSuggestWidget.selectedBackground": listActiveSelectionBackground.hex(),
      "editorHoverWidget.foreground": scheme.common.ui.hex(),
      "editorHoverWidget.background": scheme.ui.popover.bg.hex(),
      "editorHoverWidget.border":
        scheme.ui.popover.border?.hex() || transparent,
      "editorHoverWidget.statusBarBackground": scheme.ui.popover.bg.hex(),

      // The Debug Exception widget is a peek view that shows in the editor when
      // debug stops at an exception.
      "debugExceptionWidget.background": scheme.ui.popover.bg.hex(),
      "debugExceptionWidget.border":
        scheme.ui.popover.border?.hex() || transparent,

      // The editor marker view shows when navigating to errors and warnings in
      // the editor (Go to Next Error or Warning command)
      "editorMarkerNavigation.background": scheme.ui.popover.bg.hex(),
      "editorMarkerNavigationError.background": scheme.ui.state.error.hex(),
      "editorMarkerNavigationWarning.background": scheme.ui.state.warning.hex(),
      "editorMarkerNavigationInfo.background": scheme.ui.state.info.hex(),

      // Peek view colors
      // @link https://code.visualstudio.com/api/references/theme-color#peek-view-colors
      "peekViewEditor.background": scheme.ui.popover.bg.hex(),
      "peekView.border": scheme.ui.popover.border?.hex() || transparent,
      "peekViewEditorGutter.background": scheme.ui.popover.bg.hex(),
      "peekViewEditor.matchHighlightBackground": selectionBackground.hex(),
      "peekViewEditor.matchHighlightBorder": transparent,
      "peekViewResult.background": scheme.ui.popover.bg.hex(),
      "peekViewResult.matchHighlightBackground": selectionBackground.hex(),
      "peekViewResult.selectionBackground": selectionBackground.hex(),
      "peekViewResult.selectionForeground": selectionForeground.hex(),
      "peekViewTitle.background": scheme.ui.popover.bg.hex(),
      "peekViewTitleDescription.foreground": scheme.common.ui.hex(),
      "peekViewTitleLabel.foreground": scheme.common.ui.hex(),

      // Merge conflicts
      // @link https://code.visualstudio.com/api/references/theme-color#merge-conflicts-colors
      "merge.currentHeaderBackground": scheme.ui.button.bg
        .brighten(0.2)
        .alpha(0.4)
        .hex(),
      "merge.currentContentBackground": scheme.ui.button.bg
        .brighten(0.2)
        .alpha(0.25)
        .hex(),
      "merge.incomingHeaderBackground": scheme.ui.button.bg
        .brighten(0.2)
        .alpha(0.4)
        .hex(),
      "merge.incomingContentBackground": scheme.ui.button.bg
        .brighten(0.2)
        .alpha(0.25)
        .hex(),
      "merge.border": transparent,

      // Panel
      // @link https://code.visualstudio.com/api/references/theme-color#panel-colors
      "panel.background": scheme.common.bg.hex(),
      "panel.border": transparent,
      "panelTitle.activeBorder": transparent,
      "panelTitle.activeForeground": scheme.common.fg.hex(),
      "panelTitle.inactiveForeground": scheme.common.ui.brighten(0.2).hex(),

      // Status Bar colors
      // @link https://code.visualstudio.com/api/references/theme-color#status-bar-colors
      "statusBar.background": scheme.common.bg.hex(),
      "statusBar.foreground": scheme.common.ui.brighten(0.2).hex(),
      "statusBar.border": transparent,
      "statusBar.debuggingBackground": scheme.syntax.constant.hex(),
      "statusBar.debuggingForeground": scheme.common.fg.hex(),
      "statusBar.debuggingBorder": transparent,
      "statusBar.noFolderForeground": scheme.common.ui.brighten(0.2).hex(),
      "statusBar.noFolderBackground": scheme.common.bg.hex(),
      "statusBar.noFolderBorder": transparent,
      "statusBarItem.activeBackground": transparent,
      "statusBarItem.hoverBackground": transparent,
      "statusBarItem.prominentForeground": scheme.common.fg.hex(),
      "statusBarItem.prominentBackground": transparent,
      "statusBarItem.prominentHoverBackground": transparent,

      // Title bar colors
      // @link https://code.visualstudio.com/api/references/theme-color#title-bar-colors
      "titleBar.activeBackground": scheme.common.bg.hex(),
      "titleBar.activeForeground": scheme.common.fg.hex(),
      "titleBar.inactiveBackground": scheme.common.bg.hex(),
      "titleBar.inactiveForeground": scheme.common.ui.brighten(0.2).hex(),
      "titleBar.border": transparent,

      // Menu bar colors
      // @link https://code.visualstudio.com/api/references/theme-color#menu-bar-colors
      "menubar.selectionForeground": scheme.common.fg.hex(),
      "menubar.selectionBorder": scheme.ui.popover.border?.hex() || transparent,
      "menu.foreground": scheme.common.ui.brighten(0.2).hex(),
      "menu.background": scheme.ui.popover.bg.hex(),
      "menu.border": scheme.ui.popover.border?.hex() || transparent,
      "menu.selectionForeground": scheme.common.fg.hex(),
      "menu.selectionBorder": scheme.ui.popover.border?.hex() || transparent,
      "menu.separatorBackground": transparent,

      // Notification colors
      // @link https://code.visualstudio.com/api/references/theme-color#notification-colors
      "notificationCenter.border":
        scheme.ui.popover.border?.hex() || transparent,
      "notificationCenterHeader.foreground": scheme.common.ui
        .brighten(0.2)
        .hex(),
      "notificationCenterHeader.background": scheme.ui.popover.bg.hex(),
      "notificationToast.border": transparent,
      "notifications.foreground": scheme.common.fg.hex(),
      "notifications.background": scheme.ui.popover.bg.hex(),
      "notifications.border": scheme.ui.popover.border?.hex() || transparent,
      "notificationLink.foreground": scheme.common.accent.hex(),

      // Extensions
      // @link https://code.visualstudio.com/api/references/theme-color#extensions-colors
      "extensionButton.prominentForeground": scheme.common.bg.fade(0.5).hex(),
      "extensionButton.prominentBackground": scheme.common.accent.hex(),
      "extensionButton.prominentHoverBackground": scheme.common.accent
        .darken(0.1)
        .hex(),
      "extensionBadge.remoteBackground": badgeBackground.hex(),
      "extensionBadge.remoteForeground": badgeForeground.hex(),

      // Quick picker colors
      // @link https://code.visualstudio.com/api/references/theme-color#quick-picker-colors
      "pickerGroup.border": scheme.ui.popover.border?.hex() || transparent,
      "pickerGroup.foreground": scheme.common.ui.fade(0.5).hex(),
      "quickInput.background": scheme.ui.popover.bg.hex(),
      "quickInput.foreground": scheme.common.ui.brighten(0.2).hex(),
      // 'quickInputTitle.background': '',

      // Integrated terminal colors
      // @link https://code.visualstudio.com/api/references/theme-color#integrated-terminal-colors
      "terminal.background": scheme.common.bg.hex(),
      "terminal.border": transparent,
      "terminal.foreground": scheme.common.ui.brighten(0.2).hex(),
      "terminal.ansiBlack": scheme.chalk.black.hex(),
      "terminal.ansiRed": scheme.chalk.red.hex(),
      "terminal.ansiGreen": scheme.chalk.green.hex(),
      "terminal.ansiYellow": scheme.chalk.yellow.hex(),
      "terminal.ansiBlue": scheme.chalk.blue.hex(),
      "terminal.ansiMagenta": scheme.chalk.magenta.hex(),
      "terminal.ansiCyan": scheme.chalk.cyan.hex(),
      "terminal.ansiWhite": scheme.chalk.white.hex(),
      "terminal.ansiBrightBlack": scheme.chalk.black[brightenIfDark(type)](
        0.2
      ).hex(),
      "terminal.ansiBrightRed": scheme.chalk.red.brighten(0.3).hex(),
      "terminal.ansiBrightGreen": scheme.chalk.green.brighten(0.3).hex(),
      "terminal.ansiBrightYellow": scheme.chalk.yellow.brighten(0.3).hex(),
      "terminal.ansiBrightBlue": scheme.chalk.blue.brighten(0.3).hex(),
      "terminal.ansiBrightMagenta": scheme.chalk.magenta.brighten(0.3).hex(),
      "terminal.ansiBrightCyan": scheme.chalk.cyan.brighten(0.3).hex(),
      "terminal.ansiBrightWhite": scheme.chalk.white[brightenIfDark(type)](
        0.2
      ).hex(),
      "terminal.selectionBackground": selectionBackground.hex(),
      "terminalCursor.background": transparent,
      "terminalCursor.foreground": scheme.common.accent.hex(),

      // Debug colors
      // @link https://code.visualstudio.com/api/references/theme-color#debug-colors
      "debugToolBar.background": scheme.ui.panel.bg.hex(),
      "debugToolBar.border": scheme.ui.panel.border?.hex() || transparent,
      // 'editor.stackFrameHighlightBackground': '',
      // 'editor.focusedStackFrameHighlightBackground': '',
      // 'debugView.exceptionLabelForeground': '',
      // 'debugView.exceptionLabelBackground': '',
      // 'debugView.stateLabelForeground': '',
      // 'debugView.stateLabelBackground': '',
      // 'debugView.valueChangedHighlight': '',
      "debugTokenExpression.name": scheme.common.ui.hex(),
      "debugTokenExpression.value": scheme.syntax.entity.hex(),
      "debugTokenExpression.string": scheme.syntax.string.hex(),
      "debugTokenExpression.boolean": scheme.syntax.boolean.hex(),
      "debugTokenExpression.number": scheme.syntax.number.hex(),
      "debugTokenExpression.error": scheme.syntax.error.hex(),

      // Welcome page
      // @link https://code.visualstudio.com/api/references/theme-color#welcome-page-colors
      // 'welcomePage.background': '',
      // 'welcomePage.buttonBackground': '',
      // 'welcomePage.buttonHoverBackground': '',
      // 'walkThrough.embeddedEditorBackground': '',

      // Source Control
      // @link https://code.visualstudio.com/api/references/theme-color#source-control-colors
      // 'scm.providerBorder': '',

      // Git
      // @link https://code.visualstudio.com/api/references/theme-color#git-colors
      "gitDecoration.addedResourceForeground": scheme.common.ui
        .brighten(0.2)
        .hex(),
      "gitDecoration.modifiedResourceForeground": scheme.common.ui
        .brighten(0.2)
        .hex(),
      "gitDecoration.deletedResourceForeground": scheme.common.ui
        .brighten(0.2)
        .hex(),
      "gitDecoration.untrackedResourceForeground": scheme.common.ui
        .brighten(0.2)
        .hex(),
      "gitDecoration.ignoredResourceForeground": scheme.common.ui
        .fade(0.2)
        .hex(),
      "gitDecoration.conflictingResourceForeground": scheme.common.ui
        .brighten(0.2)
        .hex(),
      "gitDecoration.submoduleResourceForeground": scheme.common.ui
        .brighten(0.2)
        .hex(),

      // Settings Editor colors
      // @link https://code.visualstudio.com/api/references/theme-color#settings-editor-colors
      // 'settings.headerForeground': '',
      // 'settings.modifiedItemIndicator': '',
      // 'settings.dropdownBackground': '',
      // 'settings.dropdownForeground': '',
      // 'settings.dropdownBorder': '',
      // 'settings.dropdownListBorder': '',
      "settings.checkboxBackground": scheme.ui.popover.bg.hex(),
      "settings.checkboxForeground": scheme.common.ui.brighten(0.2).hex(),
      "settings.checkboxBorder": scheme.ui.popover.border?.hex() || transparent,
      // 'settings.textInputBackground': '',
      // 'settings.textInputForeground': '',
      // 'settings.textInputBorder': '',
      // 'settings.numberInputBackground': '',
      // 'settings.numberInputForeground': '',
      // 'settings.numberInputBorder': '',

      // Breadcrumbs
      // @link https://code.visualstudio.com/api/references/theme-color#breadcrumbs-colors
      "breadcrumb.foreground": scheme.common.ui.brighten(0.2).hex(),
      "breadcrumb.background": scheme.common.bg.hex(),
      "breadcrumb.focusForeground": scheme.common.fg.hex(),
      "breadcrumb.activeSelectionForeground": scheme.common.ui
        .brighten(0.2)
        .hex(),
      // 'breadcrumbPicker.background': '',

      // Snippets
      // @link https://code.visualstudio.com/api/references/theme-color#snippets-colors
      // 'editor.snippetTabstopHighlightBackground': '',
      // 'editor.snippetTabstopHighlightBorder': '',
      // 'editor.snippetFinalTabstopHighlightBackground': '',
      // 'editor.snippetFinalTabstopHighlightBorder': '',

      // Symbol Icons
      // @link https://code.visualstudio.com/api/references/theme-color#symbol-icons-colors
      "symbolIcon.arrayForeground": scheme.syntax.punctuation.hex(),
      "symbolIcon.booleanForeground": scheme.syntax.boolean.hex(),
      "symbolIcon.classForeground": scheme.syntax.class.hex(),
      "symbolIcon.colorForeground": scheme.syntax.special.hex(),
      "symbolIcon.constantForeground": scheme.syntax.constant.hex(),
      "symbolIcon.constructorForeground": scheme.syntax.func.hex(),
      "symbolIcon.enumeratorForeground": syntaxEnum.hex(),
      "symbolIcon.enumeratorMemberForeground": syntaxEnumMember.hex(),
      "symbolIcon.eventForeground": scheme.syntax.variable.hex(),
      "symbolIcon.fieldForeground": scheme.syntax.entity.hex(),
      "symbolIcon.fileForeground": scheme.syntax.special.hex(),
      "symbolIcon.folderForeground": scheme.syntax.special.hex(),
      "symbolIcon.functionForeground": scheme.syntax.func.hex(),
      "symbolIcon.interfaceForeground": syntaxInterface.hex(),
      "symbolIcon.keyForeground": syntaxObjectKey.hex(),
      "symbolIcon.keywordForeground": scheme.syntax.keyword.hex(),
      "symbolIcon.methodForeground": scheme.syntax.func.hex(),
      "symbolIcon.moduleForeground": syntaxKeywordControl.hex(),
      "symbolIcon.namespaceForeground": syntaxNamespace.hex(),
      "symbolIcon.nullForeground": syntaxNull.hex(),
      "symbolIcon.numberForeground": scheme.syntax.number.hex(),
      "symbolIcon.objectForeground": scheme.common.ui.hex(),
      "symbolIcon.operatorForeground": scheme.syntax.operator.hex(),
      "symbolIcon.packageForeground": syntaxKeywordControl.hex(),
      "symbolIcon.propertyForeground": syntaxObjectKey.hex(),
      "symbolIcon.referenceForeground": syntaxReference.hex(),
      "symbolIcon.snippetForeground": scheme.syntax.entity.hex(),
      "symbolIcon.stringForeground": scheme.syntax.string.hex(),
      "symbolIcon.structForeground": scheme.syntax.special.hex(),
      "symbolIcon.textForeground": scheme.common.fg.hex(),
      "symbolIcon.typeParameterForeground": syntaxTypeParam.hex(),
      "symbolIcon.unitForeground": scheme.syntax.keyword.hex(),
      "symbolIcon.variableForeground": scheme.syntax.variable.hex(),

      // Debug Icons
      // @link https://code.visualstudio.com/api/references/theme-color#debug-icons-colors
      "debugIcon.breakpointForeground": scheme.common.accent.hex(),
      "debugIcon.breakpointDisabledForeground": scheme.ui.state.error.hex(),
      // 'debugIcon.breakpointUnverifiedForeground': '',
      // 'debugIcon.breakpointCurrentStackframeForeground': '',
      // 'debugIcon.breakpointStackframeForeground': '',
      "debugIcon.startForeground": scheme.ui.state.success.hex(),
      "debugIcon.pauseForeground": scheme.ui.state.success
        .mix(scheme.ui.state.info, 0.5)
        .hex(),
      "debugIcon.stopForeground": scheme.ui.state.error.hex(),
      "debugIcon.disconnectForeground": scheme.ui.state.error
        .mix(scheme.ui.state.warning, 0.5)
        .hex(),
      "debugIcon.restartForeground": scheme.ui.state.info.hex(),
      "debugIcon.stepOverForeground": scheme.ui.state.info.hex(),
      "debugIcon.stepIntoForeground": scheme.ui.state.info.hex(),
      "debugIcon.stepOutForeground": scheme.ui.state.info.hex(),
      "debugIcon.continueForeground": scheme.ui.state.success.hex(),
      "debugIcon.stepBackForeground": scheme.ui.state.success
        .mix(scheme.ui.state.info, 0.5)
        .hex(),
      "debugConsole.infoForeground": scheme.ui.state.info.hex(),
      "debugConsole.warningForeground": scheme.ui.state.warning.hex(),
      "debugConsole.errorForeground": scheme.ui.state.error.hex(),
      // 'debugConsole.sourceForeground': '',
      // 'debugConsoleInputIcon.foreground': '',

      // Notebook
      // @link https://code.visualstudio.com/api/references/theme-color#notebook-colors
      // 'notebook.cellBorderColor': '',
      // 'notebook.focusedEditorBorder': '',
      // 'notebookStatusSuccessIcon.foreground': '',
      // 'notebookStatusErrorIcon.foreground': '',
      // 'notebookStatusRunningIcon.foreground': '',
      // 'notebook.outputContainerBackgroundColor': '',
      // 'notebook.cellToolbarSeperator': '',
      // 'notebook.focusedCellBackground': '',
      // 'notebook.cellHoverBackground': '',
      // 'notebook.focusedCellBorder': '',
      // 'notebook.focusedCellShadow': '',
      // 'notebook.cellStatusBarItemHoverBackground': '',
      // 'notebook.cellInsertionIndicator': '',
      // 'notebookScrollbarSlider.background': '',
      // 'notebookScrollbarSlider.hoverBackground': '',
      // 'notebookScrollbarSlider.activeBackground': '',
    },

    semanticHighlighting: false,
    // I'm sorry but this looks like garbage and I can't figure out how to make
    // it not look like garbage. I may consider supporting a variant with
    // `semanticHighlighting` turned on if I can get it to not suck one day.
    // https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#semantic-token-scope-map
    // semanticTokenColors: {type: scheme.syntax.type.hex(), namespace:
    // scheme.syntax.type.brighten(0.2).hex(), class:
    // scheme.syntax.entity.hex(), 'class.defaultLibrary':
    // scheme.syntax.entity.hex(), interface:
    // scheme.syntax.type.brighten(0.15).hex(), enum:
    // scheme.syntax.type.brighten(0.15).hex(), 'type.defaultLibrary':
    // scheme.syntax.entity.hex(), function: scheme.syntax.func.hex(),
    // 'function.defaultLibrary': scheme.syntax.func.hex(), member:
    // scheme.syntax.func.hex(), macro: scheme.syntax.markup.hex(), variable:
    // scheme.syntax.variable.hex(), 'variable.readonly':
    // scheme.syntax.constant.hex(), 'variable.readonly.defaultLibrary':
    // scheme.syntax.constant.hex(), parameter:
    // scheme.syntax.variable.brighten(0.4).hex(), property:
    // scheme.syntax.variable.hex(), 'property.readonly':
    // scheme.syntax.constant.hex(), enumMember:
    // scheme.syntax.variable.brighten(0.15).hex(), event:
    // scheme.syntax.variable.hex(),
    // },

    tokenColors: [
      {
        name: "Globals",
        settings: {
          background: scheme.common.bg.hex(),
          foreground: scheme.common.fg.hex(),
        },
      },
      {
        name: "Diffs",
        scope: [
          "meta.diff.header",
          "meta.diff.header.git",
          "meta.diff.header.from-file",
          "meta.diff.header.to-file",
        ],
        settings: {
          foreground: scheme.vcs.modified.hex(),
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Changed",
        scope: ["markup.changed"],
        settings: {
          foreground: scheme.vcs.modified.hex(),
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Deleted",
        scope: ["markup.deleted"],
        settings: {
          foreground: scheme.vcs.removed.hex(),
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Inserted",
        scope: ["markup.inserted"],
        settings: {
          foreground: scheme.vcs.added.hex(),
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Markup Strike",
        scope: ["markup.strike"],
        settings: {
          foreground: scheme.syntax.special.hex(),
        },
      },
      {
        name: "Markup Table",
        scope: ["markup.table"],
        settings: {
          foreground: scheme.syntax.tag.hex(),
        },
      },
      {
        name: "Comments",
        scope: ["comment", "punctuation.definition.comment"],
        settings: {
          foreground: scheme.syntax.comment.hex(),
        },
      },
      {
        name: "Strings",
        scope: [
          "string",
          "string.quoted",
          "string.quoted.single.js",
          "string.quoted.single.ts",
          "invalid.illegal.bad-ampersand.html",
          "string.quoted.double.html invalid.illegal.bad-ampersand.html",
          "string.quoted.single.html invalid.illegal.bad-ampersand.html",
        ],
        settings: {
          foreground: scheme.syntax.string.hex(),
        },
      },
      {
        name: "Text",
        scope: [
          "text",
          "text.html.basic",
          "source",
          "meta.tag.jsx",
          "meta.tag.tsx",
          "meta.jsx.children",
          "meta.tsx.children",
          "meta.jsx.children.js",
          "meta.tsx.children.js",
          "meta.jsx.children.tsx",
          "meta.tsx.children.tsx",
        ],
        settings: {
          foreground: scheme.common.fg.hex(),
        },
      },
      {
        name: "Numbers",
        scope: ["constant.numeric", "constant.character.numeric"],
        settings: {
          foreground: scheme.syntax.number.hex(),
        },
      },
      {
        name: "Units",
        scope: [
          "constant.length.units",
          "constant.percentage.units",
          "constant.angle.units",
          "meta.at-rule.keyword.other.unit.media",
          "keyword.other.unit.css",
          "keyword.other.unit.sass",
          "keyword.other.unit.scss",
        ],
        settings: {
          foreground: scheme.syntax.keyword.hex(),
        },
      },
      {
        name: "Boolean",
        scope: [
          "constant.language.boolean",
          "meta.tag.any.html.string.quoted.double.embedded.line.php.source.constant.language.inline",
          "meta.embedded.line.php.source.constant.language",
        ],
        settings: {
          foreground: scheme.syntax.boolean.hex(),
        },
      },
      {
        name: "Null",
        scope: ["constant.language.null"],
        settings: {
          foreground: syntaxNull.hex(),
        },
      },
      {
        name: "Undefined",
        scope: ["constant.language.undefined"],
        settings: {
          foreground: syntaxUndefined.hex(),
        },
      },
      {
        name: "NaN",
        scope: ["constant.language.nan"],
        settings: {
          foreground: syntaxNaN.hex(),
        },
      },
      {
        name: "Regular Expressions",
        scope: ["string.regexp", "string.regexp keyword.other"],
        settings: {
          foreground: scheme.syntax.regexp.hex(),
        },
      },
      {
        name: "Regular Expression Quantifier",
        scope: "keyword.operator.quantifier.regexp",
        settings: {
          foreground: scheme.syntax.entity.brighten(0.2).hex(),
        },
      },
      {
        name: "Regular Expression Brackets",
        scope: "punctuation.definition.character-class.regexp",
        settings: {
          foreground: scheme.syntax.markup.brighten(0.15).hex(),
        },
      },
      {
        name: "Regular Expression Group",
        scope: "punctuation.definition.group.regexp",
        settings: {
          foreground: scheme.syntax.error.brighten(0.2).hex(),
        },
      },
      {
        name: "Regular Expression Group Nocapture",
        scope: "punctuation.definition.group.no-capture.regexp",
        settings: {
          foreground: scheme.syntax.constant.brighten(0.15).hex(),
        },
      },
      {
        name: "Regular Expression Anchor",
        scope: "keyword.control.anchor.regexp",
        settings: {
          foreground: scheme.syntax.special.brighten(0.15).hex(),
        },
      },
      {
        name: "Constants",
        scope: [
          "constant",
          "constant.language",
          "punctuation.definition.constant",
          "constant.language.python",
          "variable.other.constant.property",
          "constant.other",
          "support.constant",
        ],
        settings: {
          foreground: scheme.syntax.constant.hex(),
        },
      },
      {
        name: "Constant Character Escape",
        scope: ["constant.character", "constant.character.escape"],
        settings: {
          foreground: scheme.syntax.regexp.brighten(0.2).hex(),
        },
      },
      {
        name: "Support Constant Math",
        scope: "support.constant.math",
        settings: {
          foreground: scheme.common.fg.hex(),
        },
      },
      {
        name: "Entity name",
        scope: ["entity.name"],
        settings: {
          foreground: scheme.syntax.entity.hex(),
        },
      },
      {
        name: "Classes",
        scope: [
          "support.type",
          "support.class",
          "support.class.php",
          "entity.name.class",
          "entity.name.type.class",
          "entity.name.type.instance",
          "meta.class",
          "meta.class entity.name.type.class",
          "meta.class entity.name.type.class.tsx",
          "source.go storage.type",
          "new.expr.ts entity.name.type.ts",
        ],
        settings: {
          foreground: scheme.syntax.class.hex(),
        },
      },
      {
        name: "Delimiters",
        scope: ["none"],
        settings: {
          foreground: scheme.common.fg.hex(),
        },
      },
      {
        name: "Separator",
        scope: "meta.separator",
        settings: {
          foreground: scheme.syntax.comment.hex(),
        },
      },
      {
        name: "Punctuation",
        scope: [
          "block.brace.array.literal.square",
          "block.punctuation",
          "meta.delimiter",
          "meta.delimiter.comma",
          "meta.function meta.delimiter.comma",
          "meta.function punctuation.separator.comma",
          "punctuation",
          "punctuation.definition",
          "punctuation.decorator.objectliteral.object.member.accessor",
          "punctuation.section",
          "punctuation.section.function",
          "punctuation.separator",
          "punctuation.support.type.property-name",
          "punctuation.terminator",
          "punctuation.accessor",
          "string.template punctuation.definition.string",

          // Language-specific overrides
          "keyword.operator.css",
          "meta.at-rule.media.scss",
          "meta.function.closure.php",
          "meta.function-call.php punctuation",
          "meta.structure.dictionary.json support.type.property-name.json punctuation.support.type.property-name.begin.json",
          "meta.structure.dictionary.json support.type.property-name.json punctuation.support.type.property-name.end.json",
          "meta.structure.dictionary.value.json string.quoted.double.json punctuation.definition.string.begin.json",
          "meta.structure.dictionary.value.json string.quoted.double.json punctuation.definition.string.end.json",
          "meta.type.annotation.ts",
          "punctuation.accessor.js",
          "punctuation.accessor.ts",
          "punctuation.definition.string.begin.js",
          "punctuation.definition.string.begin.ts",
          "punctuation.definition.string.end.js",
          "punctuation.definition.string.end.ts",
          "punctuation.support.type.property-name.begin.json",
          "punctuation.support.type.property-name.end.json",
          "source.css.scss",
          "string.quoted.double.html punctuation.definition.string.begin.html",
          "string.quoted.double.html punctuation.definition.string.end.html",
          "text.html.php meta.embedded.block.php source.php",
          "text.html.php meta.embedded.line.php source.php",
          "text.html.php meta.tag.block.any.html",
        ],
        settings: {
          foreground: scheme.syntax.punctuation.hex(),
        },
      },
      {
        name: "Curly braces",
        scope: ["meta.brace.curly"],
        settings: {
          foreground: scheme.common.fg.alpha(0.9).hex(),
        },
      },
      {
        name: "Round braces",
        scope: ["meta.brace.round"],
        settings: {
          foreground: scheme.common.fg.alpha(0.8).hex(),
        },
      },
      {
        name: "Square braces",
        scope: ["meta.brace.square", "brace.array.literal.square"],
        settings: {
          foreground: scheme.common.fg.brighten(0.15).alpha(0.9).hex(),
        },
      },
      {
        name: "Logical Operator",
        scope: [
          "keyword.operator",
          "keyword.operator.comparison",
          "keyword.operator.logical",
          "keyword.operator.ternary",
        ],
        settings: {
          foreground: scheme.common.ui.brighten(0.3).hex(),
        },
      },
      {
        name: "Decorators/annotation",
        scope: [
          "meta.function.decorator",
          "meta.decorator variable.other",
          "meta.decorator punctuation.decorator",
          "storage.type.annotation",

          // Language-specific overrides
          "punctuation.decorator.ts",
          "punctuation.decorator.tsx",
          "meta.function.decorator support.type.python",
          "entity.name.function.decorator.python",
          "entity.name.function.decorator.python punctuation.definition",
        ],
        settings: {
          foreground: scheme.syntax.special.hex(),
        },
      },
      {
        name: "Invalid",
        scope: ["invalid"],
        settings: {
          foreground: scheme.syntax.error.hex(),
        },
      },
      {
        name: "Italics",
        scope: "italic",
        settings: {
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Bold",
        scope: "bold",
        settings: {
          fontStyle: "bold",
        },
      },
      {
        name: "Bold italic",
        scope: ["bold italic", "italic bold"],
        settings: {
          fontStyle: italics ? "bold italic" : "bold",
        },
      },
      {
        name: "Function keyword",
        scope: ["storage.type.function"],
        settings: {
          foreground: scheme.chalk.orange.hex(),
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Function names",
        scope: [
          "meta.function",
          "meta.require",
          "support.function.any-method",
          "entity.name.function",

          // Language-specific overrides
          "entity.name.function.ts",
          "entity.name.function.tsx",
          "entity.name.function.attribute.rust",
          "meta.var.expr entity.name.function.ts",
          "meta.var.expr entity.name.function.tsx",
          "source.ruby variable.other.readwrite",
        ],
        settings: {
          foreground: scheme.syntax.func.hex(),
        },
      },
      {
        name: "Macros",
        scope: ["support.macro"],
        settings: {
          foreground: scheme.syntax.markup.hex(),
        },
      },
      {
        name: "Function call",
        scope: [
          "variable.function",
          "variable.annotation",
          "entity.name.function.tagged-template",
          "meta.function-call.generic",
          "meta.function-call entity.name.function",
          "meta.method-call entity.name.function",

          // Language-specific overrides
          "meta.function-call entity.name.function.ts",
          "meta.function-call entity.name.function.tsx",
          "meta.function-call.php support.function",
          "meta.function-call.python meta.function-call.generic.python",
          "meta.function-call.python support.function.builtin.python",
          "meta.function-call.generic.python",
          "meta.method-call entity.name.function.ts",
          "meta.method-call entity.name.function.tsx",
          "source.js support.function",
          "source.ts support.function",
          "source.tsx support.function",
          "string.quasi.js entity.name.tag.js",
          "support.function.css",
          "support.function.go",
          "variable.language.super",
        ],
        settings: {
          foreground: scheme.syntax.func.brighten(0.2).hex(),
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Doctypes",
        scope: [
          "meta.tag.sgml.doctype",
          "meta.tag.metadata.doctype",
          "entity.name.tag.doctype",
        ],
        settings: {
          foreground: scheme.syntax.markup.darken(0.15).hex(),
        },
      },
      {
        name: "Meta Tag",
        scope: [
          "meta.tag",
          "punctuation.definition.tag",
          "punctuation.definition.tag.end",
          "punctuation.definition.tag.begin",

          // Language-specific overrides
          "punctuation.definition.tag.begin.html source.js",
          "punctuation.definition.tag.end.html source.js",
        ],
        settings: {
          foreground: scheme.common.ui.brighten(0.2).hex(),
        },
      },
      {
        name: "Keywords",
        scope: ["keyword"],
        settings: {
          foreground: scheme.syntax.keyword.hex(),
        },
      },
      {
        name: "Keyword `new`",
        scope: ["keyword.operator.new", "keyword.other.new"],
        settings: {
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Output",
        scope: ["support.function.construct.output"],
        settings: {
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Keyword control",
        scope: [
          "keyword.control",
          "keyword.control.import",
          "keyword.control.export",
          "keyword.control.flow",
          "keyword.control.from",
          "storage.type.extends",
          "storage.type.function.arrow",
          "storage.type.function.arrow.js",
          "storage.type.function.arrow.jsx",
          "storage.type.function.arrow.ts",
          "storage.type.function.arrow.tsx",
        ],
        settings: {
          foreground: syntaxKeywordControl.hex(),
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Storage",
        scope: [
          "storage",
          "meta.var.expr",
          "meta.class meta.method.declaration meta.var.expr storage.type.js",
          "storage.type.property.js",
          "storage.type.property.jsx",
          "storage.type.property.ts",
          "storage.type.property.tsx",
        ],
        settings: {
          foreground: scheme.syntax.storage.hex(),
        },
      },
      {
        name: "Storage type",
        scope: [
          "storage.type",

          // Language-specific overrides
          "source.java storage.type",
          "source.haskell storage.type",
          "source.c storage.type",
        ],
        settings: {
          foreground: scheme.chalk.orange[brightenIfDark(type)](0.3)
            .desaturate(0.5)
            .fade(0.1)
            .hex(),
        },
      },
      {
        name: "Storage modifier",
        scope: ["storage.modifier"],
        settings: {
          foreground: scheme.syntax.markup.fade(0.2).hex(),
        },
      },
      {
        name: "Primitive storage types",
        scope: [
          "storage.type.primitive",

          // Language-specific overrides
          "source.java storage.type.primitive",
        ],
        settings: {
          foreground: scheme.syntax.tag.hex(),
        },
      },
      {
        name: "Variables",
        scope: [
          "entity.name.variable",
          "punctuation.definition.variable.php",
          "source.python variable.language.special",
          "support.variable",
          "variable",
          "variable.member",
          "variable.language",
          "variable.language.this.php",
          "variable.language.this.php punctuation.definition.variable",
          "variable.other",
          "variable.other.event",
          "variable.other.php",
          "variable.other.global",
          "variable.other.global.php",
          "variable.other.global.php punctuation.definition.variable",
          "variable.other.property",
          "variable.other.property.php",
          "variable.other.readwrite",
          "variable.other.readwrite.alias",
          "variable.other.readwrite.alias",
          "variable.other.readwrite.alias",
          "variable.other.readwrite.alias.ts",
          "variable.other.readwrite.alias.tsx",
          "variable.other.readwrite.ts",
          "variable.other.readwrite.tsx",
          "variable.other.ts",
          "variable.other.tsx",
          "variable.parameter.url.sass",
          "variable.parameter.url.scss",
          "variable.sass",
          "variable.scss",
          "variable.ts",
          "variable.tsx",
        ],
        settings: {
          foreground: scheme.syntax.variable.hex(),
        },
      },
      {
        name: "Invalid",
        scope: "invalid.illegal",
        settings: {
          foreground: scheme.common.fg.alpha(0.8).hex(),
        },
      },
      {
        name: "Invalid Deprecated",
        scope: "invalid.deprecated",
        settings: {
          foreground: scheme.common.fg.alpha(0.8).hex(),
        },
      },
      {
        name: "Object",
        scope: [
          "support.type.object",
          "support.variable.object.process.js",
          "support.variable.object.process.jsx",
          "support.variable.object.process.ts",
          "support.variable.object.process.tsx",
          "variable.other.object.js",
          "variable.other.object.jsx",
          "variable.other.object.ts",
          "variable.other.object.tsx",
        ],
        settings: {
          foreground: scheme.syntax.special[brightenIfDark(type)](0.5)
            .desaturate(1)
            .hex(),
        },
      },
      {
        name: "DOM Object",
        scope: ["support.type.object.dom"],
        settings: {
          foreground: scheme.syntax.entity.hex(),
        },
      },
      {
        name: "Object keys",
        scope: [
          "meta.object-literal.key",
          "meta.object-literal.key",
          "meta.object.member",
          "meta.object.member.object-literal.key",
          "constant.other.object.key",

          // Language-specific overrides
          "constant.other.object.key.js",
          "constant.other.object.key.js string.quoted.single.js",
          "constant.other.object.key.js string.quoted.double.js",
          "constant.other.object.key.js string.unquoted.js",
          "meta.object-literal.key.js entity.name.function.js",
          "meta.object-literal.key.ts string.quoted.double.ts",
          "meta.object-literal.key.tsx string.quoted.double.tsx",
        ],
        settings: {
          foreground: syntaxObjectKey.hex(),
        },
      },
      {
        name: "This",
        scope: [
          "variable.language.this",

          // Language-specific overrides
          "variable.language.this.ts",
          "variable.language.this.tsx",
          "variable.language.special.self.python",
        ],
        settings: {
          foreground: scheme.syntax.special[brightenIfDark(type)](0.3)
            .desaturate(1)
            .hex(),
        },
      },
      {
        name: "Variable parameter",
        scope: ["variable.parameter", "meta.parameter"],
        settings: {
          foreground: scheme.syntax.variable.brighten(0.4).hex(),
        },
      },
      {
        name: "Variable parameter function",
        scope: ["variable.parameter.function"],
        settings: {
          foreground: scheme.syntax.variable.hex(),
        },
      },
      {
        name: "Function storage block",
        scope: "function.storage.type.block",
        settings: {
          foreground: scheme.syntax.tag.brighten(0.05).hex(),
        },
      },
      {
        name: "Types",
        scope: ["entity.name.type"],
        settings: {
          foreground: scheme.syntax.type.hex(),
        },
      },
      {
        name: "Type params",
        scope: ["meta.type.parameters entity.name.type"],
        settings: {
          foreground: syntaxTypeParam.hex(),
        },
      },
      {
        name: "Type inherited class",
        scope: ["entity.other.inherited-class"],
        settings: {
          foreground: scheme.syntax.type.alpha(0.75).hex(),
        },
      },
      {
        name: "Interfaces",
        scope: ["entity.name.type.interface"],
        settings: {
          foreground: syntaxInterface.hex(),
        },
      },
      {
        name: "Enums",
        scope: ["entity.name.type.enum"],
        settings: {
          foreground: syntaxEnum.hex(),
        },
      },
      {
        name: "Enum members",
        scope: ["variable.other.enummember"],
        settings: {
          foreground: syntaxEnumMember.hex(),
        },
      },
      {
        name: "Namespaces",
        scope: [
          "entity.name.namespace",
          "entity.name.type.namespace",
          "meta.namespace",
          "meta.namespace.declaration.ts",
          "support.other.namespace",
        ],
        settings: {
          foreground: syntaxNamespace.hex(),
        },
      },
      {
        name: "Info token",
        scope: "token.info-token",
        settings: {
          foreground: scheme.common.accent.hex(),
        },
      },
      {
        name: "Warning token",
        scope: "token.warn-token",
        settings: {
          foreground: scheme.syntax.entity.hex(),
        },
      },
      {
        name: "Error token",
        scope: "token.error-token",
        settings: {
          foreground: scheme.syntax.error.hex(),
        },
      },
      {
        name: "Debug token",
        scope: "token.debug-token",
        settings: {
          foreground: scheme.syntax.constant.hex(),
        },
      },

      // Code documentation
      {
        name: "Entity names in code documentations",
        scope: [
          "entity.name.type.instance.jsdoc",
          "entity.name.type.instance.phpdoc",
          "entity.name.type.instance.sassdoc",
          "meta.other.type.phpdoc",
          "meta.other.type.phpdoc support.class.php",
          "meta.other.type.phpdoc keyword.other.type.php",
        ],
        settings: {
          foreground: scheme.syntax.entity[darkenIfDark(type)](0.2).hex(),
        },
      },
      {
        name: "Other Variables in Code Documentations",
        scope: [
          "variable.other.jsdoc",
          "variable.other.phpdoc",
          "variable.other.sassdoc",
          "comment.block.documentation punctuation.definition",
          "comment.block.documentation storage.type",
        ],
        settings: {
          foreground: scheme.syntax.variable[darkenIfDark(type)](0.2)
            .fade(0.3)
            .hex(),
        },
      },

      // CSS
      {
        name: "CSS",
        scope: "source.css",
        settings: {
          foreground: scheme.common.fg[brightenIfDark(type)](0.15).hex(),
        },
      },
      {
        name: "CSS class selector",
        scope: [
          "entity.other.attribute-name.class.css",
          "entity.other.attribute-name.parent-selector-suffix.scss",
          "meta.selector",
        ],
        settings: {
          foreground: scheme.syntax.cssClass.hex(),
        },
      },
      {
        name: "CSS Class Selector punctuation",
        scope: [
          "entity.punctuation.other.attribute-name.class.css.definition",
          "entity.scss.meta.property-list.punctuation.other.attribute-name.class.css.definition",
          "punctuation.definition.entity.css",
          "meta.selector.css",
        ],
        settings: {
          foreground: scheme.syntax.special.brighten(0.2).hex(),
        },
      },
      {
        name: "CSS Tag Selector",
        scope: ["entity.name.tag.css", "entity.name.tag.scss"],
        settings: {
          foreground: scheme.syntax.cssTag.hex(),
        },
      },
      {
        name: "CSS parent operator",
        scope: ["source.css keyword.operator.parent"],
        settings: {
          foreground: scheme.syntax.special.brighten(0.1).hex(),
        },
      },
      {
        name: "CSS ID selector",
        scope: [
          "entity.other.attribute-name.id.css",
          "entity.other.attribute-name.id.css punctuation.definition.entity.css",
        ],
        settings: {
          foreground: scheme.syntax.cssId.hex(),
        },
      },
      {
        name: "CSS property name",
        scope: [
          "entity.name.tag.custom.sass",
          "entity.name.tag.custom.scss",
          "meta.property-list.css meta.property-name.css",
          "meta.property-list.scss meta.property-name.sass",
          "meta.property-list.scss meta.property-name.scss",
          "support.type.property-name.css",
          "support.type.property-name.sass",
          "support.type.property-name.scss",
        ],
        settings: {
          foreground: scheme.syntax.cssProperties.hex(),
        },
      },
      {
        name: "CSS Vendored Property Name",
        scope: "support.type.vendored.property-name.css",
        settings: {
          foreground: scheme.syntax.regexp[brightenIfDark(type)](0.2).hex(),
        },
      },
      {
        name: "CSS property value",
        scope: [
          "meta.property-group support.constant.property-value.css",
          "meta.property-list.css meta.property-value.css",
          "meta.property-value support.constant.property-value.css",
          "meta.property-group support.constant.property-value.scss",
          "meta.property-group support.constant.property-value.sass",
          "meta.property-value support.constant.property-value.scss",
          "meta.property-value support.constant.property-value.sass",
          "variable.parameter.misc.css",
          "parameter.less.data-uri comment markup.raw",
          "source.less meta.property-value.css",
          "meta.property-value.scss",
          "support.constant.property-value.css",
        ],
        settings: {
          foreground: scheme.common.fg[darkenIfDark(type)](0.25).hex(),
        },
      },
      {
        name: "CSS Vendor Prefixed Property Value",
        scope: "support.constant.vendored.property-value.css",
        settings: {
          foreground: scheme.syntax.entity.hex(),
        },
      },
      {
        name: "CSS colors",
        scope: [
          "constant.numeric.color.hex-value",
          "constant.other.color",
          "constant.other.color.rgb-value punctuation.definition.constant",
          "meta.property-value constant",
          "punctuation.definition.constant",
          "support.constant.color",
        ],
        settings: {
          foreground: scheme.common.fg[darkenIfDark(type)](0.25).hex(),
        },
      },
      {
        name: "CSS Font Names",
        scope:
          "support.constant.font-name.scss, support.constant.font-name.css",
        settings: {
          foreground: scheme.common.fg[darkenIfDark(type)](0.25).hex(),
        },
      },
      {
        name: "CSS constructor",
        scope: [
          "meta.constructor.argument.css",
          "meta.constructor.argument.sass",
          "meta.constructor.argument.scss",
        ],
        settings: {
          foreground: scheme.syntax.special[darkenIfDark(type)](0.3).hex(),
        },
      },
      {
        name: "CSS Placeholder",
        scope: [
          "entity.other.attribute-name.placeholder.css",
          "entity.other.attribute-name.placeholder.sass",
          "entity.other.attribute-name.placeholder.scss",
        ],
        settings: {
          foreground: scheme.syntax.markup.hex(),
        },
      },
      {
        name: "CSS @rule",
        scope: [
          "keyword.control.at-rule",
          "keyword.control.at-rule punctuation.definition",
          "meta.at-rule.return",
          "meta.at-rule.if",
          "source.css keyword.control.return",
          "source.css keyword.control.content",
          "source.css keyword.control.each",
          "source.css keyword.control.if",
          "source.css keyword.control.else",
          "source.css keyword.control.warn",
          "source.css keyword.control.debug",
          "meta.preprocessor.at-rule keyword.control.at-rule",
          "meta.preprocessor.at-rule keyword.control.at-rule punctuation.definition",
          "source.css keyword.control.else punctuation.definition",
          "source.css keyword.control.return punctuation.definition",
          "source.css keyword.control.if punctuation.definition",
          "source.css keyword.control.content punctuation.definition",
          "source.css keyword.control.each punctuation.definition",
          "source.css keyword.control.warn punctuation.definition",
          "source.css keyword.control.debug punctuation.definition",
        ],
        settings: {
          foreground: scheme.syntax.error[brightenIfDark(type)](1)
            .desaturate(0.6)
            .hex(),
        },
      },
      {
        name: "CSS @rule",
        scope: ["meta.at-rule.return variable.parameter.url.scss"],
        settings: {
          foreground: scheme.common.fg[brightenIfDark(type)](0.5).hex(),
        },
      },
      {
        name: "CSS important",
        scope: ["keyword.other.important", "token.literal.sass"],
        settings: {
          fontStyle: "bold",
          foreground: scheme.syntax.error[brightenIfDark(type)](0.2).hex(),
        },
      },
      {
        name: "CSS pseudo",
        scope: [
          "entity.other.attribute-name.pseudo-class.css",
          "entity.other.attribute-name.pseudo-element.css",
          "entity.property-list.other.attribute-name.pseudo-class.css",
          "entity.property-list.other.attribute-name.pseudo-element.css",
          "entity.other.attribute-name.pseudo-class.css punctuation.definition.entity.css",
          "entity.other.attribute-name.pseudo-element.css punctuation.definition.entity.css",
          "entity.property-list.other.attribute-name.pseudo-class.css punctuation.definition.entity.css",
          "entity.property-list.other.attribute-name.pseudo-element.css punctuation.definition.entity.css",
        ],
        settings: {
          foreground: scheme.syntax.special.hex(),
        },
      },
      {
        name: "CSS attribute name",
        scope: [
          "entity.other.attribute-name.attribute",
          "entity.other.attribute-name.css",
        ],
        settings: {
          foreground: scheme.syntax.error.desaturate(1).hex(),
        },
      },
      {
        name: "CSS at-media attribute",
        scope: [
          "support.type.property-name.media",
          "meta.at-rule.include.scss",
          "meta.at-rule.include.scss support.constant.math.scss",
          "source.css support.constant.media.css support.constant",
        ],
        settings: {
          foreground: scheme.syntax.regexp.hex(),
        },
      },

      // SASS
      {
        name: "SASS at-import string",
        scope: "scss.meta.at-rule.import.string.quoted.single",
        settings: {
          foreground: scheme.syntax.special[darkenIfDark(type)](0.15).hex(),
        },
      },
      {
        name: "SASS @mixin + @function name",
        scope: [
          "source.css meta.at-rule.function support.function",
          "source.css meta.at-rule.mixin entity.name.function",
          "source.css meta.at-rule.include entity.name.function",
          "source.css support.function.misc",
        ],
        settings: {
          foreground: scheme.syntax.markup.hex(),
        },
      },
      {
        name: "SASS Interpolation",
        scope: [
          "variable.interpolation.sass",
          "variable.interpolation.scss",
          "support.function.interpolation.sass",
          "support.function.interpolation.scss",
          "punctuation.definition.interpolation.begin.bracket.curly.sass",
          "punctuation.definition.interpolation.begin.bracket.curly.scss",
          "punctuation.definition.interpolation.end.bracket.curly.sass",
          "punctuation.definition.interpolation.end.bracket.curly.scss",
        ],
        settings: {
          foreground: scheme.syntax.special[brightenIfDark(type)](0.1).hex(),
        },
      },
      {
        name: "SASS tag reference ampersand",
        scope: "entity.name.tag.reference.scss",
        settings: {
          foreground: syntaxReference.hex(),
        },
      },
      {
        name: "SASS map key",
        scope: "meta.definition.variable.map.scss support.type.map.key.scss",
        settings: {
          foreground: scheme.syntax.regexp[darkenIfDark(type)](0.15).hex(),
        },
      },
      {
        name: "SASS Placeholder %",
        scope: [
          "entity.other.attribute-name.placeholder.css punctuation.definition.entity.css",
          "entity.other.attribute-name.placeholder.scss punctuation.definition.entity.sass",
          "entity.other.attribute-name.placeholder.scss punctuation.definition.entity.scss",
        ],
        settings: {
          foreground: scheme.syntax.markup[darkenIfDark(type)](0.15).hex(),
        },
      },

      // HTML
      {
        name: "HTML Tag Names",
        scope: [
          "entity.name.tag",
          "meta.tag.other.html",
          "meta.tag.other.js",
          "meta.tag.other.tsx",
          "meta.tag.sgml",
          "entity.name.tag",
          "entity.name.tag.open.jsx",
          "entity.name.tag.close.jsx",
          "entity.name.tag.open.tsx",
          "entity.name.tag.close.tsx",
          "meta.tag.js",
          "meta.tag.tsx",
          "meta.tag.html",
          "keyword.control.html.elements",
        ],
        settings: {
          foreground: scheme.syntax.tag.hex(),
        },
      },
      {
        name: "HTML Tag Attribute Name",
        scope: [
          "entity.other.attribute-name",

          // Language-specific overrides
          "entity.other.attribute-name.js",
          "entity.other.attribute-name.html",
          "entity.other.attribute-name.id.html",
          "meta.tag.any.html entity.other.attribute-name.html",
          "meta.tag.block.any.html entity.other.attribute-name.html",
          "meta.tag.inline.any.html entity.other.attribute-name.html",
          "meta.tag.structure.any.html entity.other.attribute-name.html",
          "meta.tag.other.html entity.other.attribute-name.html",
          "source.js.embedded.html entity.other.attribute-name.html",
          "source.ts entity.other.attribute-name",
          "source.tsx entity.other.attribute-name",
          "entity.other.attribute-name.jsx",
          "entity.other.attribute-name.tsx",
        ],
        settings: {
          foreground: scheme.common.fg[brightenIfDark(type)](0.15).hex(),
        },
      },
      {
        name: "HTML Tag Attribute Values",
        scope: [
          "string.quoted.double.html",
          "meta.template string.quoted.double",
          "string.quoted.double.html invalid.illegal.bad-ampersand.html",
        ],
        settings: {
          foreground: scheme.syntax.string.hex(),
        },
      },

      // Markdown
      {
        name: "Markdown Headings",
        scope: "entity.name.section.markdown",
        settings: {
          fontStyle: "bold",
          foreground: scheme.syntax.constant.brighten(0.2).hex(),
        },
      },
      {
        name: "Markdown Headings punctuation",
        scope: "punctuation.definition.heading.markdown",
        settings: {
          fontStyle: "",
          foreground: scheme.syntax.constant.hex(),
        },
      },
      {
        name: "Markdown bold",
        scope: "markup.bold",
        settings: {
          fontStyle: "bold",
          foreground: scheme.syntax.func.hex(),
        },
      },
      {
        name: "Markdown bold punctuation",
        scope: "punctuation.definition.bold.markdown",
        settings: {
          fontStyle: "bold",
          foreground: scheme.syntax.func.darken(0.2).hex(),
        },
      },
      {
        name: "Markdown paragraphs",
        scope: "meta.paragraph.markdown",
        settings: {
          fontStyle: "",
          foreground: scheme.common.fg.hex(),
        },
      },
      {
        name: "Markdown italic",
        scope: "markup.italic",
        settings: {
          fontStyle: italics ? "italic" : undefined,
          foreground: scheme.syntax.special.darken(0.1).hex(),
        },
      },
      {
        name: "Markdown italic punctuation",
        scope: "punctuation.definition.italic.markdown",
        settings: {
          fontStyle: italics ? "italic" : "",
          foreground: scheme.syntax.special.darken(0.25).hex(),
        },
      },
      {
        name: "Markdown bold italic",
        scope: ["markup.italic markup.bold", "markup.bold markup.italic"],
        settings: {
          fontStyle: italics ? "bold italic" : "bold",
          foreground: scheme.syntax.special.hex(),
        },
      },
      {
        name: "Markdown bold italic punctuation",
        scope: [
          "punctuation.definition.bold.markdown punctuation.definition.italic.markdown",
          "punctuation.definition.italic.markdown punctuation.definition.bold.markdown",
        ],
        settings: {
          fontStyle: italics ? "bold italic" : "bold",
          foreground: scheme.syntax.special.darken(0.25).hex(),
        },
      },
      {
        name: "Markdown code",
        scope: ["markup.raw"],
        settings: {
          background: scheme.common.fg.alpha(0.02).hex(),
        },
      },
      {
        name: "Markdown code inline",
        scope: ["markup.raw.inline"],
        settings: {
          background: scheme.common.fg.alpha(0.06).hex(),
        },
      },
      {
        name: "Markdown code block",
        scope: [
          "markup.fenced_code.block.markdown punctuation.definition.markdown",
          "punctuation.definition.markdown",
          "punctuation.definition.raw.markdown",
        ],
        settings: {
          foreground: scheme.syntax.comment.hex(),
        },
      },
      {
        name: "Markpdown raw inline",
        scope: [
          "markup.inline.raw.markdown",
          "text.html.markdown markup.fenced_code.block.markdown",
          "text.html.markdown markup.inline.raw",
          "markup.inline.raw.string.markdown",
        ],
        settings: {
          foreground: scheme.syntax.operator.hex(),
        },
      },
      {
        name: "Markdown quotes",
        scope: "markup.quote",
        settings: {
          foreground: scheme.syntax.regexp.hex(),
          fontStyle: italics ? "italic" : undefined,
        },
      },
      {
        name: "Markdown line break",
        scope: ["text.html.markdown meta.dummy.line-break"],
        settings: {
          background: scheme.syntax.comment.hex(),
          foreground: scheme.syntax.comment.hex(),
        },
      },
      {
        name: "Markdown link text",
        scope: ["markup.underline.link", "string.other.link"],
        settings: {
          foreground: scheme.common.accent.darken(0.2).hex(),
        },
      },
      {
        name: "Markdown link URL",
        scope: [
          "meta.link",
          "meta.paragraph.inline.link.underline.detected-link",
          "markup.underline.link.image.markdown",
        ],
        settings: {
          foreground: scheme.common.accent.hex(),
        },
      },
      {
        name: "Markdown lists",
        scope: "markup.list meta.paragraph.markdown",
        settings: {
          foreground: scheme.common.fg.hex(),
        },
      },
      {
        name: "Markdown list bullets",
        scope: [
          "markup.list punctuation.definition.list.begin",
          "beginning.punctuation.definition.list.markdown",
        ],
        settings: {
          foreground: scheme.common.ui.hex(),
        },
      },

      // JavaScript
      {
        name: "JavaScript support variable object process",
        scope: "support.variable.object.process.js",
        settings: {
          foreground: scheme.syntax.regexp[brightenIfDark(type)](0.3).hex(),
        },
      },
      {
        name: "JavaScript Method Declaration e.g. `constructor`",
        scope: "meta.method.declaration storage.type.js",
        settings: {
          foreground: scheme.syntax.func.hex(),
        },
      },
      {
        name: "JavaScript meta template expression",
        scope: [
          "meta.template.expression.js punctuation.definition.template-expression",
          "punctuation.definition.template-expression.begin.ts",
          "punctuation.definition.template-expression.begin.tsx",
          "punctuation.definition.template-expression.end.ts",
          "punctuation.definition.template-expression.end.tsx",
          "punctuation.quasi.element.begin.js",
          "punctuation.quasi.element.end.js",
        ],
        settings: {
          foreground: scheme.syntax.special.brighten(0.1).hex(),
        },
      },

      {
        name: "TypeScript return",
        scope: [
          "support.type.class.declaration.method.return.primitive.ts",
          "support.type.class.declaration.method.return.primitive.tsx",
          "type.annotation.support.class.declaration.method.parameters.primitive.ts",
          "type.annotation.support.class.declaration.method.parameters.primitive.tsx",
        ],
        settings: {
          foreground: scheme.chalk.cyan.hex(),
        },
      },
      {
        name: "TypeScript support type primitive",
        scope: ["support.type.primitive.ts", "support.type.primitive.tsx"],
        settings: {
          foreground: scheme.syntax.entity.fade(0.5).hex(),
        },
      },
      {
        name: "TypeScript method",
        scope: [
          "block.variable.other.class.declaration.property.method.ts",
          "block.variable.other.class.declaration.property.method.tsx",
          "block.variable.other.object.array.literal.class.declaration.method.var.expr.ts  block.variable.class.declaration.method.parameter.arrow.ts",
          "block.variable.other.object.array.literal.class.declaration.method.var.expr.tsx  block.variable.class.declaration.method.parameter.arrow.tsx",
          "block.variable.other.object.class.declaration.method.ts",
          "block.variable.other.object.class.declaration.method.tsx",
        ],
        settings: {
          foreground: scheme.syntax.variable.brighten(0.15).hex(),
        },
      },
      {
        name: "TypeScript method declaration e.g. `constructor`",
        scope: [
          "meta.method.declaration storage.type.ts",
          "meta.method.declaration storage.type.tsx",
        ],
        settings: {
          foreground: scheme.syntax.func.hex(),
        },
      },

      // JSON
      {
        name: "JSON property constant",
        scope: "constant.language.json",
        settings: {
          foreground: scheme.syntax.entity.brighten(0.15).fade(0.15).hex(),
        },
      },
      {
        name: "JSON property value",
        scope: [
          "meta.structure.dictionary.value.json",
          "string.quoted.double.json",
          "meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.array.json meta.structure.dictionary.json support.type.property-name.json",
        ],
        settings: {
          foreground: scheme.syntax.special
            .fade(0.3)
            [brightenIfDark(type)](0.5)
            .desaturate(0.8)
            .hex(),
        },
      },
      {
        name: "JSON property name",
        scope: [
          "support.type.property-name.json",
          "meta.structure.array.json meta.structure.dictionary.json support.type.property-name.json",
          "meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.array.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.array.json meta.structure.dictionary.json support.type.property-name.json",
        ],
        settings: {
          foreground: syntaxObjectKey.hex(),
        },
      },

      // PHP
      {
        name: "PHP delimiters",
        scope: [
          "punctuation.section.embedded.begin.php",
          "punctuation.section.embedded.end.php",
          "punctuation.section.embedded.begin.metatag.php",
          "punctuation.section.embedded.end.metatag.php",
          "text.html.php meta.embedded.line.php punctuation.section.embedded.end.metatag.php source.php",
          "text.html.php meta.embedded.block.php punctuation.section.embedded.end.metatag.php source.php",
          "text.html.php meta.embedded.block.php punctuation.section.embedded.end.php source.php",
          "text.html.php meta.embedded.line.php punctuation.section.embedded.end.php source.php",
        ],
        settings: {
          foreground: scheme.syntax.error.darken(0.15).hex(),
        },
      },
      {
        name: "PHP Control Keywords",
        scope: "keyword.control.php",
        settings: {
          foreground: scheme.syntax.tag.fade(0.1).hex(),
        },
      },
      {
        name: "PHP Echo",
        scope: "support.function.construct.output.php",
        settings: {
          foreground: scheme.syntax.tag.fade(0.1).hex(),
        },
      },

      // Misc
      {
        name: "Search results numbers",
        scope: ["constant.numeric.line-number.find-in-files - match"],
        settings: {
          foreground: scheme.syntax.comment.hex(),
        },
      },
      {
        name: "Search results match numbers",
        scope: ["constant.numeric.line-number.match"],
        settings: {
          foreground: scheme.syntax.keyword.hex(),
        },
      },
      {
        name: "Search results lines",
        scope: ["entity.name.filename.find-in-files"],
        settings: {
          foreground: scheme.syntax.string.hex(),
        },
      },
      {
        name: "Error messages",
        scope: ["message.error"],
        settings: {
          foreground: scheme.syntax.error.hex(),
        },
      },

      // Normalize font styles
      {
        name: "normalize font style of certain components",
        scope: [
          "meta.property-list.css meta.property-value.css variable.other.less",
          "meta.property-list.scss variable.scss",
          "meta.property-list.sass variable.sass",
          "meta.brace",
          "keyword.operator.operator",
          "keyword.operator.or.regexp",
          "keyword.operator.expression.in",
          "keyword.operator.relational",
          "keyword.operator.assignment",
          "keyword.operator.comparison",
          "keyword.operator.type",
          "keyword.operator",
          "keyword",
          "punctuation.definintion.string",
          "punctuation",
          "variable.other.readwrite.js",
          "source.css",
          "string.quoted",
        ],
        settings: {
          fontStyle: "",
        },
      },
    ],
  };
}

export default template;

function wrapExisting(str: string, pair: [string, string]) {
  return str ? pair[0] + str + pair[1] : str;
}

function joinExisting(arr: string[], separator?: string) {
  return arr.filter(Boolean).join(separator);
}

function darkenIfDark(type: "dark" | "light") {
  return type === "dark" ? "darken" : "brighten";
}

function brightenIfDark(type: "dark" | "light") {
  return type === "dark" ? "brighten" : "darken";
}

function preferredColor(
  baseColor: Color,
  firstChoice: Color,
  ...fallbacks: Color[]
) {
  return _preferredColor(baseColor, firstChoice, WCAG_RATIO_AA, ...fallbacks);
}

function preferredColorContrast(
  baseColor: Color,
  firstChoice: Color,
  ...fallbacks: Color[]
) {
  return _preferredColor(baseColor, firstChoice, WCAG_RATIO_AAA, ...fallbacks);
}

function _preferredColor(
  baseColor: Color,
  firstChoice: Color,
  ratio: number,
  ...fallbacks: Color[]
) {
  if (baseColor.contrastCheck(firstChoice, ratio)) {
    return firstChoice;
  }
  for (let color of fallbacks) {
    if (baseColor.contrastCheck(color, ratio)) {
      return color;
    }
  }
  // This warning is helpful but not always to be trusted, since alpha settings
  // may impact actual visual contrast. Enable as needed and verify manually.
  // warn('No appropriately high contrast color found. You may want to pass more fallback options to be sure content is readable!');
  return firstChoice;
}

function warn(warning?: any, ...optionalParams: any[]) {
  console.warn(warning, ...optionalParams);
  console.trace();
}
