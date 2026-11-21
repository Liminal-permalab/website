"use client";

// A culture forming, drawn as a torus (the figure the app uses for a village). Three things happen, and all three
// grow with `energy` (0 = just begun, 1 = fully formed):
//   1. a source pours in from the top: one stream comes straight down the axis and into the hole;
//   2. it turns inside: what has entered circles through the torus the way energy moves in one, down through the
//      centre, out underneath, up around the outside and in again at the top, and the torus grows from it;
//   3. it gives off waves: rings that travel outwards, closer together, stronger and more rippled as it grows.
// The visitor can turn it by dragging (or with the arrow keys). Drawn on a plain canvas with its own small 3D
// projection, free on the page: no frame, no 3D library.
import { useEffect, useRef, type RefObject } from "react";

const RING = 1; // distance from the centre of the torus to the centre of its tube
const TUBE = 0.42; // radius of the tube
const REACH = 5.2; // how far the waves travel before they have faded
const TOP = 4.1; // how far above the torus the source is first seen
const TAU = Math.PI * 2;
const TRAIL = [0, 0.05, 0.1, 0.15] as const; // each moving point is drawn with a short tail behind it

type Arriving = { angle: number; offset: number; speed: number; spread: number };
type Inside = { around: number; drift: number; start: number; pace: number; depth: number };
type Leaving = { around: number; birth: number; life: number; lift: number; turn: number };
type Dot = { x: number; y: number; depth: number; size: number; colour: string; alpha: number };

const random = (from: number, to: number) => from + Math.random() * (to - from);
const mix = (from: number, to: number, t: number) => from + (to - from) * t;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export function TorusFlow({ energy, full = false, space, label }: { energy: number; /** Fill the whole window, torus in the middle. */ full?: boolean; /** The empty area of the page kept free for the torus: it is drawn in the middle of it. */ space: RefObject<HTMLElement | null>; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(energy);
  const fullRef = useRef(full);
  useEffect(() => { target.current = energy; }, [energy]);
  useEffect(() => { fullRef.current = full; }, [full]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const arriving: Arriving[] = Array.from({ length: 150 }, () => ({ angle: random(0, TAU), offset: Math.random(), speed: random(0.1, 0.14), spread: Math.random() }));
    const inside: Inside[] = Array.from({ length: 340 }, () => ({ around: random(0, TAU), drift: random(0.03, 0.09), start: random(0, TAU), pace: random(0.7, 1.2), depth: random(0.3, 1.04) }));
    const leaving: Leaving[] = Array.from({ length: 70 }, () => ({ around: random(0, TAU), birth: random(0, 14), life: random(9, 15), lift: random(-0.5, 0.5), turn: random(0.25, 0.6) }));

    let width = 0;
    let height = 0;
    let ink = "#e4e4e4"; // what arrives, and the waves
    let body = "#b6d8e5"; // the torus itself
    let kept = "#b8e8d4"; // what moves inside it
    let level = still ? 1 : 0; // the energy actually drawn, following `energy` smoothly
    let wave = 0; // how far the waves have travelled, counted up frame by frame so their pace can change smoothly
    let last = 0;
    // how the visitor has turned it
    let yaw = 0;
    let tilt = 0.8;
    let yawSpeed = 0;
    let tiltSpeed = 0;
    let held: { x: number; y: number } | null = null;
    // where the page keeps room for the torus, measured from the canvas's own corner
    let room = { middle: 0, height: 0 };
    const findRoom = () => {
      const area = space.current?.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      if (area) room = { middle: area.top + area.height / 2 - own.top, height: area.height };
    };

    const readColours = () => {
      const style = getComputedStyle(canvas);
      ink = style.color;
      body = style.getPropertyValue("--collective").trim() || body;
      kept = style.getPropertyValue("--personal").trim() || kept;
    };
    const fit = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      findRoom();
    };

    const draw = (time: number, step: number) => {
      level += ((still ? 1 : target.current) - level) * Math.min(1, step * 1.2);
      wave += step * mix(0.22, 0.6, level);
      if (!held) {
        // let go: it keeps turning for a moment, then settles back into its own slow turn
        yaw += yawSpeed * step + step * 0.06;
        tilt = clamp(tilt + tiltSpeed * step, -1.5, 1.5);
        yawSpeed *= Math.max(0, 1 - step * 2.5);
        tiltSpeed *= Math.max(0, 1 - step * 2.5);
      }
      const grow = mix(0.5, 1.15, level); // the torus itself gets larger
      const whole = fullRef.current;
      // normally the torus fills the room the page keeps for it under the text; in the full view, without text,
      // it sits in the middle of the screen and is sized to fit it
      const unit = whole ? Math.min(width, height) / 4.4 : Math.min(room.height / 3.3, width / 3.6);
      const cx = width / 2;
      const cy = whole ? height / 2 : room.middle;

      /** A point in the torus's own space (y is its axis) to a point on the canvas. */
      const project = (x: number, y: number, z: number) => {
        const sx = x * Math.cos(yaw) + z * Math.sin(yaw);
        const sz = -x * Math.sin(yaw) + z * Math.cos(yaw);
        const ty = y * Math.cos(tilt) - sz * Math.sin(tilt);
        const depth = y * Math.sin(tilt) + sz * Math.cos(tilt);
        const scale = unit * (6 / (6 + depth));
        return { x: cx + sx * scale, y: cy - ty * scale, depth, scale };
      };

      context.clearRect(0, 0, width, height);

      // 3. the waves it gives off: they start at the outer edge and travel out. With more energy they follow each
      //    other more closely, are drawn stronger, and ripple more: a higher, more intense frequency.
      context.strokeStyle = ink;
      const edge = (RING + TUBE) * grow;
      const gap = mix(1.5, 0.3, level);
      const ripples = Math.round(mix(3, 14, level));
      for (let d = wave % gap; d < REACH; d += gap) {
        const fade = 1 - d / REACH;
        const rise = mix(0.01, 0.07, level) * fade;
        context.globalAlpha = mix(0.05, 0.3, level) * fade * fade;
        context.lineWidth = mix(0.8, 1.5, level);
        context.beginPath();
        for (let j = 0; j <= 96; j++) {
          const around = (j / 96) * TAU;
          const p = project((edge + d) * Math.cos(around), rise * Math.sin(ripples * around - wave * 9), (edge + d) * Math.sin(around));
          if (j === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
        }
        context.stroke();
      }

      // the body of the torus, as the app draws a village: a translucent surface with its mesh showing, so the
      // donut reads clearly. Its faces are painted from the back to the front.
      const AROUND = 56;
      const TUBE_STEPS = 18;
      const corners: { x: number; y: number; depth: number }[][] = [];
      for (let i = 0; i <= AROUND; i++) {
        const around = (i / AROUND) * TAU;
        const row: { x: number; y: number; depth: number }[] = [];
        for (let j = 0; j <= TUBE_STEPS; j++) {
          const a = (j / TUBE_STEPS) * TAU;
          const r = (RING + TUBE * Math.cos(a)) * grow;
          row.push(project(r * Math.cos(around), TUBE * grow * Math.sin(a), r * Math.sin(around)));
        }
        corners.push(row);
      }
      const faces: { depth: number; points: { x: number; y: number }[] }[] = [];
      for (let i = 0; i < AROUND; i++) {
        for (let j = 0; j < TUBE_STEPS; j++) {
          const a = corners[i]?.[j], b = corners[i + 1]?.[j], c = corners[i + 1]?.[j + 1], d = corners[i]?.[j + 1];
          if (a && b && c && d) faces.push({ depth: (a.depth + b.depth + c.depth + d.depth) / 4, points: [a, b, c, d] });
        }
      }
      faces.sort((a, b) => b.depth - a.depth);
      const span = 1.5 * grow;
      context.fillStyle = body;
      context.strokeStyle = body;
      context.lineWidth = 0.8;
      for (const face of faces) {
        const near = clamp(0.5 - face.depth / (2 * span), 0, 1); // 1 = closest to the viewer
        context.beginPath();
        face.points.forEach((p, k) => (k === 0 ? context.moveTo(p.x, p.y) : context.lineTo(p.x, p.y)));
        context.closePath();
        context.globalAlpha = 0.08 + 0.12 * near;
        context.fill();
        context.globalAlpha = 0.12 + 0.2 * near;
        context.stroke();
      }

      // 1. the source: from high above, straight down the axis, narrowing as it falls, then through the hole,
      //    where it is drawn out to the inner wall and taken into the circulation. `along` runs from 0 to 1.
      const sourcePoint = (a: Arriving, along: number) => {
        const falling = Math.min(1, along / 0.72);
        const entering = Math.max(0, (along - 0.72) / 0.28);
        const angle = a.angle + along * 3.2;
        const radius = entering > 0
          ? mix(0.04, (RING - TUBE * 0.9) * grow, Math.pow(entering, 0.8))
          : 0.04 + a.spread * 0.36 * Math.pow(1 - falling, 1.5);
        const y = entering > 0 ? mix(TUBE * grow * 0.9, -TUBE * grow * 0.3, entering) : mix(TOP, TUBE * grow * 0.9, Math.pow(falling, 1.2));
        return project(radius * Math.cos(angle), y, radius * Math.sin(angle));
      };
      // the axis itself, drawn faintly and brighter towards the torus, so the way in is visible between the points
      context.strokeStyle = ink;
      context.lineWidth = 1.2;
      for (let k = 0; k < 30; k++) {
        const from = project(0, mix(TOP, 0, k / 30), 0);
        const to = project(0, mix(TOP, 0, (k + 1) / 30), 0);
        context.globalAlpha = 0.02 + 0.2 * (k / 30);
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      }

      const dots: Dot[] = [];
      for (const a of arriving) {
        TRAIL.forEach((back, k) => {
          const along = (((time * a.speed + a.offset - back * a.speed * 3) % 1) + 1) % 1;
          const p = sourcePoint(a, along);
          // it appears softly at the top, and is taken in at the end
          const shown = Math.min(1, along * 5) * Math.min(1, (1 - along) * 9);
          dots.push({ x: p.x, y: p.y, depth: p.depth, size: p.scale * mix(0.014, 0.026, along) * (1 - k * 0.18), colour: ink, alpha: 0.95 * shown * (1 - k * 0.27) });
        });
      }
      // 2. turning inside: every point circles through the torus in the same sense, down through the centre, out
      //    underneath, up around the outside and in again at the top, while drifting slowly around the ring
      const moving = Math.round(inside.length * mix(0.15, 1, level));
      for (let i = 0; i < moving; i++) {
        const m = inside[i];
        if (!m) break;
        TRAIL.forEach((back, k) => {
          const t = time - back * 1.6;
          const turn = m.start + t * m.pace * mix(0.6, 1.25, level);
          const around = m.around + t * m.drift;
          const r = RING * grow + m.depth * TUBE * grow * Math.cos(turn);
          const p = project(r * Math.cos(around), m.depth * TUBE * grow * Math.sin(turn), r * Math.sin(around));
          dots.push({ x: p.x, y: p.y, depth: p.depth, size: p.scale * 0.022 * (1 - k * 0.18), colour: kept, alpha: 0.95 * (1 - k * 0.27) });
        });
      }
      // what leaves with the waves: a few points that circle outwards from the edge, slowing and fading
      const outward = Math.round(leaving.length * level);
      for (let i = 0; i < outward; i++) {
        const e = leaving[i];
        if (!e) break;
        const age = ((time + e.birth) % e.life) / e.life;
        const distance = edge + age * age * 2.4;
        const around = e.around + time * e.turn * (1.6 - age);
        const p = project(distance * Math.cos(around), e.lift * age * Math.sin(around * 2 + e.birth), distance * Math.sin(around));
        dots.push({ x: p.x, y: p.y, depth: p.depth, size: p.scale * (0.018 - age * 0.007), colour: kept, alpha: 0.6 * Math.sin(Math.PI * Math.min(1, age * 1.15)) });
      }

      dots.sort((a, b) => b.depth - a.depth);
      for (const dot of dots) {
        context.globalAlpha = dot.alpha * (0.55 + 0.45 * (1 - (dot.depth + 3) / 6));
        context.fillStyle = dot.colour;
        context.beginPath();
        context.arc(dot.x, dot.y, Math.max(0.6, dot.size), 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    let frame = 0;
    let visible = true;
    const loop = (now: number) => {
      const time = now / 1000;
      draw(time, last ? Math.min(0.05, time - last) : 0);
      last = time;
      if (visible && !document.hidden && (!still || held)) frame = requestAnimationFrame(loop);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      last = 0;
      frame = requestAnimationFrame(loop);
    };

    // turning it: drag with the mouse or a finger, or use the arrow keys
    const turn = (dx: number, dy: number) => {
      yaw += dx;
      tilt = clamp(tilt + dy, -1.5, 1.5);
      yawSpeed = dx * 40;
      tiltSpeed = dy * 40;
    };
    const press = (event: PointerEvent) => {
      held = { x: event.clientX, y: event.clientY };
      yawSpeed = tiltSpeed = 0;
      canvas.setPointerCapture(event.pointerId);
      canvas.dataset.held = "true";
      restart();
    };
    const move = (event: PointerEvent) => {
      if (!held) return;
      turn((event.clientX - held.x) * 0.008, (event.clientY - held.y) * 0.006);
      held = { x: event.clientX, y: event.clientY };
    };
    const release = () => {
      held = null;
      delete canvas.dataset.held;
    };
    const key = (event: KeyboardEvent) => {
      const by: Record<string, [number, number]> = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] };
      const step = by[event.key];
      if (!step) return;
      event.preventDefault();
      turn(step[0], step[1]);
      restart();
    };

    readColours();
    fit();
    restart();

    canvas.addEventListener("pointerdown", press);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    canvas.addEventListener("keydown", key);
    const resize = new ResizeObserver(() => { fit(); restart(); });
    resize.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? true; restart(); });
    seen.observe(canvas);
    // the colours follow the light or dark theme
    const theme = new MutationObserver(() => { readColours(); restart(); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", restart);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", press);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", release);
      canvas.removeEventListener("keydown", key);
      resize.disconnect();
      seen.disconnect();
      theme.disconnect();
      document.removeEventListener("visibilitychange", restart);
    };
  }, [space]);

  return <canvas ref={canvasRef} role="img" tabIndex={0} aria-label={`${label} Drag it, or use the arrow keys, to turn it.`} className="torus-flow" />;
}
