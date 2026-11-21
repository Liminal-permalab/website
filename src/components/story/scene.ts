// The homepage's moving picture, drawn for one moment in time and one position of the scroll. No page, no events:
// CultureStory.tsx owns those and calls drawScene on every frame.
//
// The picture is one tall world, and scrolling travels down through it. Depths are counted in window-heights, so
// section n of the page shows the world from depth n to depth n + 1:
//   0  the statement
//   1  information moves chaotically
//   2  it receives a direction, and begins to come down
//   3  it passes through a first torus (shared values and practices), made of seven coloured sections: it takes
//      a colour as it moves through them
//   4  it arrives in seven tori, one per colour
//   5  it passes through the mythological torus, with the archetypes on it
//   6  it comes together in the last torus, the memory, which sends rings of expansion out in the seven colours
//   7  the closing statement
// The information falls through all of this all the time; the scroll only decides which depth is in view.
//
// Every point of information follows ONE unbroken path for its whole life, at one steady speed, like energy
// through a circuit: down from above, in through the opening of a torus, once around the body of the torus, out
// below, straight on to the next torus, and so to the end. The path is a single smooth curve (cubic Hermite
// segments with matching tangents), so there is no corner, stop or jump anywhere along it. In the first torus the
// path also goes once round the whole ring.
//
// The tori are drawn as in the village app (Mosaic Village 3D, interfaces/default/torus.js): fine coloured
// wireframes, wide flat rings with a thin tube, seen almost from the side, with named points on the ring.

export const KINDS = [
  { name: "Feelings", colour: "#e8a3a3" },
  { name: "Thoughts", colour: "#e8d27a" },
  { name: "Sensations", colour: "#7fb6f0" },
  { name: "Observations", colour: "#4fd1a5" },
  { name: "Insights", colour: "#9a8fe0" },
  { name: "Memories", colour: "#f08fb5" },
  { name: "Ideas", colour: "#b5d86a" },
] as const;

export const ARCHETYPES = [
  { name: "King", colour: "#e2c27a" },
  { name: "Queen", colour: "#d9cfe8" },
  { name: "Warrior", colour: "#d4876c" },
  { name: "Magician", colour: "#c49be0" },
  { name: "Lover", colour: "#f2a7c3" },
] as const;

const MYTHIC = "#8a5cc8"; // the mythological torus

const TAU = Math.PI * 2;
const SECTION = TAU / KINDS.length; // how much of the first torus's ring each colour takes
const RING = 1; // distance from the centre of a torus to the centre of its tube
const TUBE = 0.25; // radius of the tube: a thin tube on a wide ring, as in the village app
const LOOP = TUBE * 0.85; // radius of the circle a point makes around the tube, inside the body
const AXIS = 1.7; // how far above and below a torus's opening a point's path starts and ends
const RINGS = 14; // rings of expansion sent out by the memory at one time, two of each colour
const REACH = 6; // how far the rings travel, in torus radii
const SPEED = 0.09; // how fast information moves along its path at its usual speed, in window-heights per second

// the world, top to bottom, in window-heights
const START = -0.15; // where information first appears
const CALM_FROM = 1.3; // above this it moves chaotically, with no direction at all
const CALM_TO = 2.0; // below this it only falls, all one way
const FIRST = 3.5; // the first torus
const SIX = 4.5; // the row of seven tori
const MYTH = 5.5; // the mythological torus
const MEMORY = 6.5; // the last torus

export type View = { yaw: number; tilt: number };
export type Ink = { text: string; muted: string; font: string; bg: string };

type Point = { x: number; y: number; depth: number; scale: number };
type Project = (x: number, y: number, z: number) => Point;

/** The waypoints of one path. `gate` is -1 for the sky (then a is a share of the width and b a depth in the world),
 *  or the torus the waypoint belongs to (0 first, 1 the point's own of seven, 2 mythological, 3 memory), then a, b
 *  and c are a place in that torus's own space. */
type Recipe = { gate: Int8Array; a: Float64Array; b: Float64Array; c: Float64Array; speed: Float64Array };

export type Particle = {
  wander: readonly [number, number, number, number];
  phase: readonly [number, number, number, number];
  /** Where along its path it is at time zero, as a share of the path. */
  offset: number;
  /** Which of the kinds it becomes. */
  kind: number;
  recipe: Recipe;
  /** The length of the path up to each waypoint, measured once for the window's size, so that speed stays steady. */
  nominal: Float64Array;
  nominalFor: number;
};

const random = (from: number, to: number) => from + Math.random() * (to - from);
const mix = (from: number, to: number, t: number) => from + (to - from) * t;
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
/** 0 before `from`, 1 after `to`, easing in and out between them. */
const between = (value: number, from: number, to: number) => {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
};
const fraction = (value: number) => value - Math.floor(value);

// ── the path ──
const STEPS = [10, 8, 8, 8] as const; // points around the tube, in each of the four tori
const SKY = 6; // waypoints in the sky
const POINTS = SKY + STEPS.reduce((total, steps) => total + steps + 3, 0); // the waypoints along a whole path
const FIRST_LOOP = [SKY + 1, SKY + 1 + STEPS[0]] as const; // the waypoints that make the turn through the first torus

function buildRecipe(column: number, aside: number, azimuth: number, depthSide: number): Recipe {
  const recipe: Recipe = { gate: new Int8Array(POINTS), a: new Float64Array(POINTS), b: new Float64Array(POINTS), c: new Float64Array(POINTS), speed: new Float64Array(POINTS) };
  let i = 0;
  /** `speed` is how fast the information moves there, compared with its usual speed. It changes smoothly from
   *  waypoint to waypoint, the way work is done in a process: it slows down as it comes up to a stage, so that a
   *  queue forms; it moves slowly while it is inside, being worked on; and it leaves quicker and evenly spaced. */
  const put = (gate: number, a: number, b: number, c: number, speed: number) => { recipe.gate[i] = gate; recipe.a[i] = a; recipe.b[i] = b; recipe.c[i] = c; recipe.speed[i] = speed; i++; };
  // in the sky: from far above, drawn gently in towards the middle, and moving faster and faster
  for (let k = 0; k < SKY; k++) {
    const t = k / (SKY - 1);
    put(-1, mix(column, 0.5, 0.5 * t * t), mix(START, CALM_TO + 0.3, t), 0, mix(0.45, 0.9, Math.pow(t, 1.2)));
  }
  STEPS.forEach((steps, gate) => {
    // in the memory they all come to the same place; elsewhere each has its own place in the stream
    const sx = gate === 3 ? 0 : aside * 0.3;
    const sz = gate === 3 ? 0 : depthSide * 0.3;
    put(gate, sx, AXIS, sz, 0.55); // above the opening: the queue
    for (let j = 0; j <= steps; j++) {
      // once all the way round the tube: down by the inner wall, out underneath, up the outside, back over the top
      const phi = Math.PI + (j / steps) * TAU;
      // in the first torus the turn is made while also going once round the whole ring
      const around = azimuth + (gate === 0 ? (j / steps) * TAU : 0);
      const r = RING + LOOP * Math.cos(phi);
      put(gate, r * Math.cos(around), LOOP * Math.sin(phi), r * Math.sin(around), gate === 0 ? 0.7 : gate === 3 ? 0.35 : 0.45); // inside: being worked on
    }
    put(gate, sx, -AXIS, sz, gate === 3 ? 0.4 : 0.95); // below the opening: released, on its way to the next
  });
  return recipe;
}
/** The path of a point in the middle of its stream, used to draw the ways between the tori. */
const LANE = buildRecipe(0.5, 0, 0, 0);

export const createParticles = (count: number): Particle[] =>
  Array.from({ length: count }, (_, i) => {
    const phase = [random(0, TAU), random(0, TAU), random(0, TAU), random(0, TAU)] as const;
    return {
      wander: [random(0.12, 0.35), random(0.12, 0.35), random(0.12, 0.35), random(0.12, 0.35)],
      phase,
      offset: Math.random(),
      kind: i % KINDS.length,
      recipe: buildRecipe(Math.random(), random(-1, 1), phase[0], Math.sin(phase[2])),
      nominal: new Float64Array(POINTS),
      nominalFor: -1,
    };
  });

/** A torus's own space (y is its axis, the ring has radius 1) to the screen, at the given turn and tilt. */
const projector = (cx: number, cy: number, unit: number, view: View): Project => {
  const cosYaw = Math.cos(view.yaw), sinYaw = Math.sin(view.yaw), cosTilt = Math.cos(view.tilt), sinTilt = Math.sin(view.tilt);
  return (x, y, z) => {
    const sx = x * cosYaw + z * sinYaw;
    const sz = -x * sinYaw + z * cosYaw;
    const depth = y * sinTilt + sz * cosTilt;
    const scale = unit * (7 / (7 + depth));
    return { x: cx + sx * scale, y: cy - (y * cosTilt - sz * sinTilt) * scale, depth, scale };
  };
};

/**
 * One torus as a fine wireframe, with only a breath of colour on its surface. Given a list of colours, the ring is
 * divided into that many equal sections, each in its own colour; otherwise it is one colour.
 */
function drawTorus(context: CanvasRenderingContext2D, project: Project, colour: string | readonly string[], around: number, tube: number, glow: number | Float64Array = 0) {
  const corners: Point[][] = [];
  for (let i = 0; i <= around; i++) {
    const a = (i / around) * TAU;
    const row: Point[] = [];
    for (let j = 0; j <= tube; j++) {
      const b = (j / tube) * TAU;
      const r = RING + TUBE * Math.cos(b);
      row.push(project(r * Math.cos(a), TUBE * Math.sin(b), r * Math.sin(a)));
    }
    corners.push(row);
  }
  const faces: { depth: number; points: Point[]; colour: string; glow: number }[] = [];
  for (let i = 0; i < around; i++) {
    const own = typeof colour === "string" ? colour : (colour[Math.floor((i / around) * colour.length)] ?? "#ffffff");
    for (let j = 0; j < tube; j++) {
      const a = corners[i]?.[j], b = corners[i + 1]?.[j], c = corners[i + 1]?.[j + 1], d = corners[i]?.[j + 1];
      if (a && b && c && d) faces.push({ depth: (a.depth + b.depth + c.depth + d.depth) / 4, points: [a, b, c, d], colour: own, glow: typeof glow === "number" ? glow : (glow[i] ?? 0) });
    }
  }
  faces.sort((a, b) => b.depth - a.depth);
  context.lineWidth = 0.7;
  const parts = typeof colour === "string" ? 1 : 1.9; // coloured sections need a little more colour to read
  for (const face of faces) {
    const near = clamp(0.5 - face.depth / 2.6, 0, 1); // 1 = closest to the viewer
    context.fillStyle = face.colour;
    context.strokeStyle = face.colour;
    context.beginPath();
    face.points.forEach((p, k) => (k === 0 ? context.moveTo(p.x, p.y) : context.lineTo(p.x, p.y)));
    context.closePath();
    // a torus brightens while information is passing through it
    context.globalAlpha = Math.min(0.5, (0.03 + 0.05 * near) * parts * (1 + 2.2 * face.glow));
    context.fill();
    context.globalAlpha = Math.min(0.9, (0.16 + 0.3 * near) * (parts > 1 ? 1.25 : 1) * (1 + 0.9 * face.glow));
    context.stroke();
  }
}

type Gate = { project: Project };
type Gates = { first: Gate; six: Gate[]; myth: Gate; memory: Gate };
type Spot = { x: number; y: number };

/** How much information is passing through each torus (the first one face by face), smoothed from frame to frame so
 *  that the tori light up where the information goes through them and fade behind it. */
const GLOW = { first: new Float64Array(KINDS.length * 10), six: new Float64Array(KINDS.length), myth: 0, memory: 0 };
/** Which torus (0 to 3) a waypoint belongs to, and which part of its path it is, or -1 in the sky. */
const torusOf = (index: number) => {
  let from = SKY;
  for (let g = 0; g < STEPS.length; g++) {
    const size = (STEPS[g] ?? 0) + 3;
    if (index < from + size) return index >= from ? g : -1;
    from += size;
  }
  return STEPS.length - 1;
};

export function drawScene(context: CanvasRenderingContext2D, width: number, height: number, time: number, scroll: number, view: View, ink: Ink, particles: readonly Particle[]) {
  /** A depth of the world to a height on the screen. */
  const onScreen = (depth: number) => (depth - scroll) * height;
  const inView = (depth: number, margin: number) => { const y = onScreen(depth); return y > -margin && y < height + margin; };
  const narrow = width < 700;
  const flat = Math.sin(view.tilt); // how much a circle lying in a torus is squashed on screen
  const cx = width / 2;

  // the tori the information passes through
  const first = { x: cx, depth: FIRST, unit: Math.min(width * 0.26, 250) };
  const rows = narrow ? 2 : 1;
  const perRow = Math.ceil(KINDS.length / rows);
  const gap = Math.min(width / (perRow + 0.3), 200);
  const row = (k: number) => Math.floor(k / perRow);
  const six = KINDS.map((kind, k) => {
    const inRow = row(k) === rows - 1 ? KINDS.length - perRow * (rows - 1) : perRow;
    return {
      ...kind,
      x: cx + ((k % perRow) - (inRow - 1) / 2) * gap,
      // the words of each step are in the middle of the window, so the row of seven sits below them
      depth: SIX + (rows === 1 ? 0.2 : 0.26 + (row(k) - 0.5) * 150 / height),
      unit: gap * 0.36,
    };
  });
  // the deeper, the bigger: the memory, which holds everything, is the largest
  const myth = { x: cx, depth: MYTH, unit: Math.min(width * 0.25, 270) };
  const memory = { x: cx, depth: MEMORY, unit: Math.min(width * 0.31, 360) };

  const makeGates = (at: View, yOf: (depth: number) => number): Gates => {
    const gate = (place: { x: number; depth: number; unit: number }): Gate => ({ project: projector(place.x, yOf(place.depth), place.unit, at) });
    return { first: gate(first), six: six.map(gate), myth: gate(myth), memory: gate(memory) };
  };
  const gates = makeGates(view, onScreen);

  /** The waypoints of a path, as they are on screen now; and the curve through them. */
  const makePath = (set: Gates, yOf: (depth: number) => number) => {
    const px = new Float64Array(POINTS), py = new Float64Array(POINTS), stamp = new Int32Array(POINTS);
    let recipe = LANE;
    let kind = 0;
    let mark = 0;
    const load = (i: number) => {
      if (stamp[i] === mark) return;
      stamp[i] = mark;
      const g = recipe.gate[i] ?? -1;
      if (g < 0) { px[i] = (recipe.a[i] ?? 0) * width; py[i] = yOf(recipe.b[i] ?? 0); return; }
      const gate = g === 0 ? set.first : g === 1 ? (set.six[kind] ?? set.first) : g === 2 ? set.myth : set.memory;
      const p = gate.project(recipe.a[i] ?? 0, recipe.b[i] ?? 0, recipe.c[i] ?? 0);
      px[i] = p.x;
      py[i] = p.y;
    };
    const X = (i: number) => { const k = clamp(i, 0, POINTS - 1); load(k); return px[k] ?? 0; };
    const Y = (i: number) => { const k = clamp(i, 0, POINTS - 1); load(k); return py[k] ?? 0; };
    const chord = (i: number, j: number) => Math.max(1e-3, Math.hypot(X(j) - X(i), Y(j) - Y(i)));
    /** The direction the path is going at a waypoint, with a length of about one: the same for the segment before and after. */
    const tangent = (i: number): [number, number] => {
      const before = Math.max(0, i - 1), after = Math.min(POINTS - 1, i + 1);
      const length = chord(before, i) + chord(i, after);
      return [(X(after) - X(before)) / length, (Y(after) - Y(before)) / length];
    };
    return {
      begin(next: Recipe, nextKind: number) { recipe = next; kind = nextKind; mark++; },
      X,
      Y,
      /** The curve between waypoint j and the next, at u from 0 to 1. It leaves and arrives in the direction of the path. */
      curve(j: number, u: number, out: Spot) {
        const next = Math.min(POINTS - 1, j + 1);
        const length = chord(j, next);
        const [tx0, ty0] = tangent(j);
        const [tx1, ty1] = tangent(next);
        const u2 = u * u, u3 = u2 * u;
        const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
        out.x = h00 * X(j) + h10 * length * tx0 + h01 * X(next) + h11 * length * tx1;
        out.y = h00 * Y(j) + h10 * length * ty0 + h01 * Y(next) + h11 * length * ty1;
      },
    };
  };
  const path = makePath(gates, onScreen);

  context.clearRect(0, 0, width, height);

  // the memory sends out rings of expansion, one after another, each in the colour of one kind of information.
  // They appear as the memory comes into view and go on after it.
  const sending = between(scroll, 5.3, 5.95);
  if (sending > 0.01) {
    const edge = RING + TUBE;
    for (let n = 0; n < RINGS; n++) {
      const age = fraction(time * 0.03 + n / RINGS);
      const reach = edge + age * REACH;
      const fadeIn = between(age, 0, 0.06);
      context.strokeStyle = KINDS[n % KINDS.length]?.colour ?? ink.text;
      context.lineWidth = mix(3, 1.2, age);
      context.globalAlpha = Math.min(1, sending * fadeIn * 1.1 * Math.pow(1 - age, 0.8));
      context.beginPath();
      for (let step = 0; step <= 96; step++) {
        const a = (step / 96) * TAU;
        const p = gates.memory.project(reach * Math.cos(a), 0, reach * Math.sin(a));
        if (step === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
      }
      context.stroke();
      // ordered points travel round each ring: what was scattered at the start leaves in order, in seven colours
      context.fillStyle = context.strokeStyle;
      const dots = 14;
      for (let d = 0; d < dots; d++) {
        const a = (d / dots) * TAU + time * (n % 2 ? -0.04 : 0.04);
        const p = gates.memory.project(reach * Math.cos(a), 0, reach * Math.sin(a));
        context.beginPath();
        context.arc(p.x, p.y, mix(2.8, 1.2, age), 0, TAU);
        context.fill();
      }
    }
  }

  // step 2: lines of attention draw the information together, from across the whole width down into the first torus
  const directing = between(scroll, 1.0, 1.9) * (1 - between(scroll, 2.9, 3.6));
  if (directing > 0.01) {
    const target = gates.first.project(0, AXIS, 0);
    context.strokeStyle = ink.text;
    context.lineWidth = 1;
    context.globalAlpha = 0.2 * directing;
    for (let n = 0; n < 15; n++) {
      const x0 = (width * (n + 0.5)) / 15;
      context.beginPath();
      context.moveTo(x0, onScreen(1.15));
      context.quadraticCurveTo(mix(x0, target.x, 0.15), onScreen(2.6), target.x, target.y);
      context.stroke();
    }
  }

  // the ways between the tori, drawn along the very curve the information follows: from the first torus down to
  // each of the seven, from each of those on into the mythological one, and from there into the memory
  const spot: Spot = { x: 0, y: 0 };
  const draw = (j: number) => {
    context.beginPath();
    for (let step = 0; step <= 28; step++) {
      path.curve(j, step / 28, spot);
      if (step === 0) context.moveTo(spot.x, spot.y); else context.lineTo(spot.x, spot.y);
    }
    context.stroke();
  };
  const FROM_FIRST = FIRST_LOOP[1] + 1; // the last waypoint of the first torus, and so on
  const FROM_OWN = FROM_FIRST + STEPS[1] + 3;
  const FROM_MYTH = FROM_OWN + STEPS[2] + 3;
  context.lineWidth = 1.2;
  KINDS.forEach((kind, k) => {
    path.begin(LANE, k);
    context.strokeStyle = kind.colour;
    context.globalAlpha = 0.4;
    draw(FROM_FIRST);
    draw(FROM_OWN);
  });
  path.begin(LANE, 0);
  context.strokeStyle = ink.text;
  context.globalAlpha = 0.3;
  draw(FROM_MYTH);

  // the tori that are in view
  context.font = `600 ${narrow ? 12 : 13}px ${ink.font}`;
  context.textAlign = "center";
  // the first torus is made of seven coloured sections, ten faces to each, so that the information takes a colour as
  // it goes through them
  context.lineJoin = "round";
  /** A name with a halo of the page's colour, so it can sit on a torus's wireframe. */
  const name = (text: string, x: number, y: number, colour: string, alpha: number) => {
    context.globalAlpha = alpha;
    context.lineWidth = 4;
    context.strokeStyle = ink.bg;
    context.strokeText(text, x, y);
    context.fillStyle = colour;
    context.fillText(text, x, y);
  };
  if (inView(first.depth, first.unit * 1.5)) {
    drawTorus(context, gates.first.project, KINDS.map((kind) => kind.colour), KINDS.length * 10, 14, GLOW.first);
    // the names of its seven sections, on the ring, and the name of the torus under it
    context.textBaseline = "middle";
    KINDS.forEach((kind, k) => {
      const a = (k + 0.5) * SECTION;
      const p = gates.first.project(RING * Math.cos(a), 0, RING * Math.sin(a));
      name(kind.name, p.x, p.y, kind.colour, p.depth > 0 ? 0.55 : 1);
    });
    context.textBaseline = "top";
    name("Shared values and practices", first.x, Math.min(height - 22, onScreen(first.depth) + first.unit * ((RING + TUBE) * flat + TUBE) + 12), ink.text, 1);
  }
  six.forEach((place, k) => {
    const gate = gates.six[k];
    if (!gate || !inView(place.depth, place.unit * 2)) return;
    const y = onScreen(place.depth);
    drawTorus(context, gate.project, place.colour, 36, 10, GLOW.six[k] ?? 0);
    context.globalAlpha = 1;
    context.textBaseline = "top";
    context.fillStyle = place.colour;
    context.fillText(place.name, place.x, y + place.unit * ((RING + TUBE) * flat + TUBE) + 10);
  });
  if (inView(myth.depth, myth.unit * 1.5)) {
    const y = onScreen(myth.depth);
    drawTorus(context, gates.myth.project, MYTHIC, 72, 14, GLOW.myth);
    context.textBaseline = "top";
    name("The mythological realm", myth.x, Math.min(height - 22, y + myth.unit * ((RING + TUBE) * flat + TUBE) + 12), ink.text, 1);
    // the archetypes: named points on the ring, turning with it
    context.textBaseline = "bottom";
    ARCHETYPES.forEach((archetype, k) => {
      const turn = (k / ARCHETYPES.length) * TAU + view.yaw;
      const px = myth.x + myth.unit * RING * Math.cos(turn);
      const py = y + myth.unit * RING * Math.sin(turn) * flat;
      const far = Math.sin(turn) < 0; // on the far side of the ring
      context.globalAlpha = far ? 0.5 : 1;
      context.fillStyle = archetype.colour;
      context.beginPath();
      context.arc(px, py, far ? 4 : 5.5, 0, TAU);
      context.fill();
      context.fillStyle = ink.text;
      context.fillText(archetype.name, px, py - 10);
    });
  }
  if (inView(memory.depth, memory.unit * 1.5)) {
    drawTorus(context, gates.memory.project, ink.text, 56, 12, GLOW.memory);
    context.globalAlpha = 1;
    context.textBaseline = "top";
    context.fillStyle = ink.text;
    context.fillText("Memory", memory.x, onScreen(memory.depth) + memory.unit * ((RING + TUBE) * flat + TUBE) + 10);
  }

  // the length of each path, measured with the window at rest (the first view, scroll at the top), so that a
  // point's speed does not change when the page is scrolled or the donuts are turned. Measured again only when the
  // window changes size.
  const windowKey = width * 100003 + height;
  let rest: ReturnType<typeof makePath> | null = null;
  const measure = (p: Particle) => {
    rest ??= makePath(makeGates({ yaw: 0, tilt: 1.2 }, (depth) => depth * height), (depth) => depth * height);
    rest.begin(p.recipe, p.kind);
    p.nominal[0] = 0;
    for (let i = 0; i < POINTS - 1; i++) p.nominal[i + 1] = (p.nominal[i] ?? 0) + Math.max(0.5, Math.hypot(rest.X(i + 1) - rest.X(i), rest.Y(i + 1) - rest.Y(i))) / Math.max(0.1, 0.5 * ((p.recipe.speed[i] ?? 1) + (p.recipe.speed[i + 1] ?? 1)));
    p.nominalFor = windowKey;
  };
  /** The waypoint a distance along a path falls after. */
  const segmentAt = (nominal: Float64Array, distance: number) => {
    let low = 0, high = POINTS - 2;
    while (low < high) {
      const middle = (low + high + 1) >> 1;
      if ((nominal[middle] ?? 0) <= distance) low = middle; else high = middle - 1;
    }
    return low;
  };

  // each point of information, with a short tail behind it that follows the path and shows which way it goes
  const present = mix(0.45, 1, between(scroll, 0, 0.7)); // quieter behind the statement
  const speed = height * SPEED;
  const TAIL = [0]; // just a ball: no tail behind it
  const counts = { six: new Float64Array(KINDS.length), myth: 0, memory: 0 };
  for (let i = 0; i < GLOW.first.length; i++) GLOW.first[i] = (GLOW.first[i] ?? 0) * 0.93;
  for (const p of particles) {
    if (p.nominalFor !== windowKey) measure(p);
    const total = p.nominal[POINTS - 1] ?? 1;
    const along = (((time * speed + p.offset * total) % total) + total) % total;
    const colour = KINDS[p.kind]?.colour ?? ink.text;
    path.begin(p.recipe, p.kind);
    // it is taken into the memory at the end of its path
    const kept = 1 - between(along, total * 0.94, total);
    TAIL.forEach((behind, k) => {
      const at = along - behind;
      if (at < 0) return;
      const j = segmentAt(p.nominal, at);
      const from = p.nominal[j] ?? 0;
      const u = clamp((at - from) / Math.max(1e-3, (p.nominal[j + 1] ?? from + 1) - from), 0, 1);
      path.curve(j, u, spot);
      if (k === TAIL.length - 1) {
        // the head of the point lights up the torus it is in: the first one where it is, the others as a whole
        const g = torusOf(j);
        if (g === 0 && j + u >= FIRST_LOOP[0] && j + u <= FIRST_LOOP[1]) {
          const a = p.phase[0] + ((j + u - FIRST_LOOP[0]) / STEPS[0]) * TAU;
          const face = Math.floor(fraction(a / TAU) * GLOW.first.length);
          for (const near of [-1, 0, 1]) {
            const at = (face + near + GLOW.first.length) % GLOW.first.length;
            GLOW.first[at] = Math.min(1, (GLOW.first[at] ?? 0) + (near === 0 ? 0.22 : 0.09));
          }
        } else if (g === 1) counts.six[p.kind] = (counts.six[p.kind] ?? 0) + 1;
        else if (g === 2) counts.myth++;
        else if (g === 3) counts.memory++;
      }
      // in the sky it wanders every which way; coming down it settles, and from there it only follows its path
      const restless = 1 - between(spot.y / height + scroll, CALM_FROM, CALM_TO);
      const x = spot.x + restless * width * 0.13 * (Math.sin(time * p.wander[0] + p.phase[0]) + 0.6 * Math.sin(time * p.wander[1] * 1.7 + p.phase[1]));
      const y = spot.y + restless * height * 0.11 * (Math.cos(time * p.wander[2] + p.phase[2]) + 0.6 * Math.sin(time * p.wander[3] * 1.3 + p.phase[3]));
      if (y < -12 || y > height + 12) return;
      // it goes once round the ring of the first torus, and takes the colour of its own kind as it passes through
      // that section
      const index = j + u;
      let coloured = 1;
      if (index < FIRST_LOOP[0]) coloured = 0;
      else if (index < FIRST_LOOP[1]) {
        const swept = ((index - FIRST_LOOP[0]) / STEPS[0]) * TAU;
        const rel = (p.phase[0] - p.kind * SECTION + TAU * 8) % TAU;
        const reaches = rel < SECTION ? 0 : TAU - rel; // how far it has to go before it is in its own section
        coloured = between(swept, reaches, reaches + SECTION * 0.5);
      }
      const strength = present * kept * 0.92;
      const size = narrow ? 2.7 : 3.3; // every ball the same little size
      if (coloured < 1) {
        context.globalAlpha = strength * (1 - coloured);
        context.fillStyle = ink.text;
        context.beginPath();
        context.arc(x, y, size, 0, TAU);
        context.fill();
      }
      if (coloured > 0) {
        context.globalAlpha = strength * coloured;
        context.fillStyle = colour;
        context.beginPath();
        context.arc(x, y, size, 0, TAU);
        context.fill();
      }
    });
  }
  context.globalAlpha = 1;

  // the other tori swell and fade with how much is passing through them
  const all = particles.length;
  for (let k = 0; k < KINDS.length; k++) GLOW.six[k] = (GLOW.six[k] ?? 0) + (Math.min(1, (counts.six[k] ?? 0) / (all * 0.004)) - (GLOW.six[k] ?? 0)) * 0.1;
  GLOW.myth += (Math.min(1, counts.myth / (all * 0.05)) - GLOW.myth) * 0.1;
  GLOW.memory += (Math.min(1, counts.memory / (all * 0.04)) - GLOW.memory) * 0.1;
}
