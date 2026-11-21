"use client";

import { useState, type CSSProperties } from "react";
import { Card, EngagementBars, SCOPE_COLOUR, ScopeBadge } from "permalab-ui/elements";

type Space = "personal" | "interpersonal" | "collective";

type Value = {
  id: string;
  name: string;
  space: Space;
  /** Position of the centre, in percent of the map. */
  x: number;
  y: number;
  /** All from 0 to 1, as in the app. Importance is set by the group; the other three are measured. */
  importance: number;
  time: number;
  notes: number;
  ai: number;
};

/* An example group, not real data. Size shows importance, as in the app's own maps. */
const VALUES: Value[] = [
  { id: "conflict", name: "Honest conflict", space: "interpersonal", x: 27, y: 30, importance: 0.9, time: 0.3, notes: 0.45, ai: 0.2 },
  { id: "meals", name: "Shared meals", space: "interpersonal", x: 21, y: 67, importance: 0.7, time: 0.9, notes: 0.25, ai: 0.1 },
  { id: "land", name: "Care for land", space: "collective", x: 75, y: 29, importance: 0.8, time: 0.6, notes: 0.5, ai: 0.35 },
  { id: "welcome", name: "Welcome", space: "collective", x: 80, y: 63, importance: 0.6, time: 0.7, notes: 0.3, ai: 0.15 },
  { id: "money", name: "Open money", space: "collective", x: 57, y: 85, importance: 0.5, time: 0.2, notes: 0.35, ai: 0.4 },
  { id: "rest", name: "Rest", space: "personal", x: 51, y: 13, importance: 0.7, time: 0.25, notes: 0.15, ai: 0.1 },
  { id: "learning", name: "Learning", space: "personal", x: 35, y: 88, importance: 0.6, time: 0.55, notes: 0.7, ai: 0.6 },
];

const CENTRE = { x: 50, y: 50 };
const LINKS: [string, string][] = [
  ["conflict", "meals"],
  ["conflict", "rest"],
  ["land", "welcome"],
  ["money", "welcome"],
  ["learning", "meals"],
];

const diameter = (importance: number) => 8 + importance * 15;
const place = (x: number, y: number, size: number, colour?: string) =>
  ({ left: `${x}%`, top: `${y}%`, width: `${size}%`, height: `${size}%`, "--c": colour }) as CSSProperties;

function reading(value: Value): string {
  const gap = value.importance - value.time;
  if (gap >= 0.3) return "Named as important, but little time goes to it.";
  if (gap <= -0.2) return "Gets more time than its importance suggests.";
  return "Time and importance are close to each other.";
}

export function ValuesMap() {
  const [selectedId, setSelectedId] = useState("conflict");
  const selected = VALUES.find((v) => v.id === selectedId) ?? VALUES[0];
  const byId = (id: string) => VALUES.find((v) => v.id === id)!;

  return (
    <figure className="m-0 min-w-0">
      <Card flush>
        <div className="flat-map">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            {VALUES.map((v) => (
              <line key={v.id} x1={CENTRE.x} y1={CENTRE.y} x2={v.x} y2={v.y} stroke="var(--grey)" strokeWidth={v.id === selectedId ? 0.8 : 0.4} />
            ))}
            {LINKS.map(([a, b]) => (
              <line key={a + b} x1={byId(a).x} y1={byId(a).y} x2={byId(b).x} y2={byId(b).y} stroke="var(--grey)" strokeWidth={0.4} strokeDasharray="1.2 1.2" />
            ))}
          </svg>

          <span className="node centre" style={place(CENTRE.x, CENTRE.y, 9)} />
          {VALUES.map((v, i) => (
            <button
              key={v.id}
              type="button"
              className="node"
              aria-label={v.name}
              aria-pressed={v.id === selectedId}
              onClick={() => setSelectedId(v.id)}
              style={{ ...place(v.x, v.y, diameter(v.importance), SCOPE_COLOUR[v.space]), animationDelay: `${120 + i * 70}ms` }}
            />
          ))}

          <div className="map-labels" aria-hidden="true">
            <span className="map-label sub" style={{ left: `${CENTRE.x}%`, top: `${CENTRE.y + 8}%` }}>Your group</span>
            {VALUES.map((v) => (
              <span key={v.id} className="map-label" style={{ left: `${v.x}%`, top: `${v.y}%` }}>{v.name}</span>
            ))}
          </div>
          <span className="map-hint">Choose a value</span>
        </div>

        <div className="under stack" aria-live="polite">
          <div className="row">
            <h2>{selected.name}</h2>
            <ScopeBadge scope={selected.space} />
          </div>
          <EngagementBars values={[selected]} />
          <p>{reading(selected)}</p>
        </div>
      </Card>
      <figcaption className="mt-3 text-[13px] text-muted">
        An example map, drawn flat. In the app it is in 3D and built from what your group says and does.
      </figcaption>
    </figure>
  );
}
