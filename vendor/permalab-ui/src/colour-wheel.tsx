"use client";

// The colour wheel: a disc of every hue, light in the middle and deeper at the rim, holding only colours the text
// stays readable on (colour.ts). Press or drag to pick; the arrow keys move around and in and out.
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { placeAt, wheelRgb, type WheelPlace } from "./colour";

export function ColourWheel({ place, onPick, size = 220, label = "Your colour" }: { place: WheelPlace; onPick: (place: WheelPlace) => void; size?: number; label?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const paint = el?.getContext("2d");
    if (!el || !paint) return;
    const px = Math.round(size * Math.min(2, window.devicePixelRatio || 1));
    el.width = el.height = px;
    const image = paint.createImageData(px, px);
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const at = placeAt(x + 0.5, y + 0.5, px);
        const fromRim = (1 - Math.hypot(x + 0.5 - px / 2, y + 0.5 - px / 2) / (px / 2)) * (px / 2);
        if (fromRim <= 0) continue;
        const [r, g, b] = wheelRgb(at);
        image.data.set([r, g, b, Math.round(Math.min(1, fromRim) * 255)], (y * px + x) * 4); // a soft edge
      }
    }
    paint.putImageData(image, 0, 0);
  }, [size]);

  const pick = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    onPick(placeAt(e.clientX - box.left, e.clientY - box.top, box.width));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const move: Record<string, [angle: number, distance: number]> = { ArrowRight: [10, 0], ArrowLeft: [-10, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] };
    const by = move[e.key];
    if (!by) return;
    e.preventDefault();
    onPick({ angle: (place.angle + by[0] + 360) % 360, distance: Math.min(1, Math.max(0, place.distance + by[1])) });
  };

  const reach = (Math.min(place.distance, 0.9) * size) / 2;
  const turn = (place.angle * Math.PI) / 180;
  const shade = place.distance < 0.34 ? "light" : place.distance < 0.67 ? "medium" : "deep";
  return (
    <div className="wheel" role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={360} aria-valuenow={Math.round(place.angle)}
      aria-valuetext={`Hue ${Math.round(place.angle)} of 360, ${shade}`} style={{ width: size, height: size }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); pick(e); }} onPointerMove={(e) => { if (e.buttons & 1) pick(e); }} onKeyDown={onKey}>
      <canvas ref={canvas} />
      <span className="wheel-mark" style={{ left: size / 2 + Math.cos(turn) * reach, top: size / 2 + Math.sin(turn) * reach }} />
    </div>
  );
}
