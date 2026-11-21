// The colour wheel's colours. A place on the wheel is an angle (the hue, 0 to 360) and a distance from the centre
// (0 to 1: light in the middle, deeper at the rim). Every colour it gives is safe to use as the member's own colour:
// dark text stays readable on it, and it stands apart from both the off-white and the anthracite ground.
// Worked out in OKLCH, where equal steps look equal, then brought into what a screen can show.

export type WheelPlace = { angle: number; distance: number };

/** Where the wheel starts: a mint, the app's own colour. */
export const DEFAULT_PLACE: WheelPlace = { angle: 165, distance: 0.25 };

// lightness from the centre to the rim, and how strong the colour is
const LIGHTEST = 0.88;
const DEEPEST = 0.76;
const STRENGTH = 0.12;

const toScreen = (linear: number) => (linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055);

/** OKLCH to linear red, green, blue (Björn Ottosson's OKLab). Values outside 0..1 cannot be shown. */
function linearRgb(lightness: number, chroma: number, hue: number): [number, number, number] {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** The colour at a place on the wheel, as red, green and blue from 0 to 255. */
export function wheelRgb({ angle, distance }: WheelPlace): [number, number, number] {
  const d = Math.min(1, Math.max(0, distance));
  const lightness = LIGHTEST - d * (LIGHTEST - DEEPEST);
  // a colour too strong for the screen is made a little milder until it fits
  for (let chroma = STRENGTH; chroma > 0; chroma -= 0.005) {
    const rgb = linearRgb(lightness, chroma, angle);
    if (rgb.every((c) => c >= -0.0005 && c <= 1.0005)) return rgb.map((c) => Math.round(toScreen(Math.min(1, Math.max(0, c))) * 255)) as [number, number, number];
  }
  const grey = Math.round(toScreen(lightness ** 3) * 255);
  return [grey, grey, grey];
}

export const wheelColour = (place: WheelPlace): string => `#${wheelRgb(place).map((c) => c.toString(16).padStart(2, "0")).join("")}`;

/** The place on a wheel of the given size that a point (measured from the wheel's top left corner) falls on. */
export function placeAt(x: number, y: number, size: number): WheelPlace {
  const [dx, dy] = [x - size / 2, y - size / 2];
  const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
  return { angle, distance: Math.min(1, Math.hypot(dx, dy) / (size / 2)) };
}

/** How readable two colours are on top of each other (WCAG contrast, 1 to 21). */
export function contrast(a: string, b: string): number {
  const light = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [light(a), light(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
