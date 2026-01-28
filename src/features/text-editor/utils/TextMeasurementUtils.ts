import { FontFamilyCodeIcon, FontFamilyNormalIcon } from "@shared/components/icons";
import { FontFamilyHeadingIcon } from "@shared/components/icons";
import { FreedrawIcon } from "@shared/components/icons";
// Avoid Node's built-in "constants" module by using a relative import
import { FONT_FAMILY, FONT_FAMILY_FALLBACKS } from "@config/constants";
import { FontMetadata } from "@assets/fonts/FontMetadata";

export const getLineHeightInPx = (fontSize: number, lineHeight: number) => {
  return fontSize * lineHeight;
};

export const getVerticalOffset = (
  fontFamily: number,
  fontSize: number,
  lineHeightPx: number
) => {
  const { unitsPerEm, ascender, descender } =
    FONT_METADATA[FONT_FAMILY.Virgil].metrics;

  const fontSizeEm = fontSize / unitsPerEm;
  const lineGap =
    (lineHeightPx - fontSizeEm * ascender + fontSizeEm * descender) / 2;

  const verticalOffset = fontSizeEm * ascender + lineGap;
  return verticalOffset;
};

export const FONT_METADATA: Record<number, FontMetadata> = {
  [FONT_FAMILY.Excalifont]: {
    metrics: {
      unitsPerEm: 1000,
      ascender: 886,
      descender: -374,
      lineHeight: 1.25,
    },
    icon: FreedrawIcon,
  },
  [FONT_FAMILY.Nunito]: {
    metrics: {
      unitsPerEm: 1000,
      ascender: 1011,
      descender: -353,
      lineHeight: 1.35,
    },
    icon: FontFamilyNormalIcon,
  },
  [FONT_FAMILY["Lilita One"]]: {
    metrics: {
      unitsPerEm: 1000,
      ascender: 923,
      descender: -220,
      lineHeight: 1.15,
    },
    icon: FontFamilyHeadingIcon,
  },
  [FONT_FAMILY["Comic Shanns"]]: {
    metrics: {
      unitsPerEm: 1000,
      ascender: 750,
      descender: -250,
      lineHeight: 1.25,
    },
    icon: FontFamilyCodeIcon,
  },
  [FONT_FAMILY.Virgil]: {
    metrics: {
      unitsPerEm: 1000,
      ascender: 886,
      descender: -374,
      lineHeight: 1.25,
    },
    icon: FreedrawIcon,
    deprecated: true,
  },
  [FONT_FAMILY.Helvetica]: {
    metrics: {
      unitsPerEm: 2048,
      ascender: 1577,
      descender: -471,
      lineHeight: 1.15,
    },
    icon: FontFamilyNormalIcon,
    deprecated: true,
    local: true,
  },
  [FONT_FAMILY.Cascadia]: {
    metrics: {
      unitsPerEm: 2048,
      ascender: 1900,
      descender: -480,
      lineHeight: 1.2,
    },
    icon: FontFamilyCodeIcon,
    deprecated: true,
  },
  [FONT_FAMILY["Liberation Sans"]]: {
    metrics: {
      unitsPerEm: 2048,
      ascender: 1854,
      descender: -434,
      lineHeight: 1.15,
    },
    serverSide: true,
  },
  [FONT_FAMILY_FALLBACKS.Xiaolai]: {
    metrics: {
      unitsPerEm: 1000,
      ascender: 880,
      descender: -144,
      lineHeight: 1.15,
    },
    fallback: true,
  },
  [FONT_FAMILY_FALLBACKS["Segoe UI Emoji"]]: {
    metrics: {
      // reusing Excalifont metrics
      unitsPerEm: 1000,
      ascender: 886,
      descender: -374,
      lineHeight: 1.25,
    },
    local: true,
    fallback: true,
  },
};

export const normalizeEOL = (str: string) => {
  return str.replace(/\r?\n|\r/g, "\n");
};
export const normalizeText = (text: string) => {
  return (
    normalizeEOL(text)
      // replace tabs with spaces so they render and measure correctly
      .replace(/\t/g, "        ")
  );
};

const splitIntoLines = (text: string) => {
  return normalizeText(text).split("\n");
};

export const getTextHeight = (
  text: string,
  fontSize: number,
  lineHeight: number
) => {
  const lineCount = splitIntoLines(text).length;
  return getLineHeightInPx(fontSize, lineHeight) * lineCount;
};

export const getTextWidth = (text: string, font: string) => {
  const lines = splitIntoLines(text);
  let width = 0;
  lines.forEach((line) => {
    width = Math.max(width, getLineWidth(line, font));
  });

  return width;
};

export const measureText = (text: string, font: string, lineHeight: number) => {
  const _text = text
    .split("\n")
    // replace empty lines with single space because leading/trailing empty
    // lines would be stripped from computation
    .map((x) => x || " ")
    .join("\n");
  const fontSize = parseFloat(font);
  const height = getTextHeight(_text, fontSize, lineHeight);
  const width = getTextWidth(_text, font);
  return { width, height };
};
export const getLineWidth = (text: string, font: string) => {
  const textMetricsProvider = new CanvasTextMetricsProvider();

  return textMetricsProvider.getLineWidth(text, font);
};

export interface TextMetricsProvider {
  getLineWidth(text: string, fontString: string): number;
}

class CanvasTextMetricsProvider implements TextMetricsProvider {
  private canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement("canvas");
  }

  /**
   * We need to use the advance width as that's the closest thing to the browser wrapping algo, hence using it for:
   * - text wrapping
   * - wysiwyg editor (+padding)
   *
   * > The advance width is the distance between the glyph's initial pen position and the next glyph's initial pen position.
   */
  public getLineWidth(text: string, fontString: string): number {
    const context = this.canvas.getContext("2d")!;
    context.font = fontString;
    const metrics = context.measureText(text);
    const advanceWidth = metrics.width;

    // since in test env the canvas measureText algo
    // doesn't measure text and instead just returns number of
    // characters hence we assume that each letteris 10px
    if (isTestEnv()) {
      return advanceWidth * 10;
    }

    return advanceWidth;
  }
}
export const isTestEnv = () => import.meta.env.MODE === "test";
