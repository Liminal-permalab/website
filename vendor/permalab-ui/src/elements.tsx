// The small building blocks of every screen. Each is plain: it shows what it is given and reports what was done to
// it. The page at #/ui (src/screens/UiPage.tsx) shows them all.
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import type { Scope } from "./scope";
import { setTheme, useTheme } from "./theme";

export const SCOPE_COLOUR: Record<Scope | "interpersonal", string> = {
  personal: "var(--personal)",
  interpersonal: "var(--interpersonal)",
  collective: "var(--collective)",
  cloud: "var(--cloud)",
};
const tint = (colour: string) => ({ "--c": colour }) as CSSProperties;

export function Card({ children, flush = false }: { children: ReactNode; flush?: boolean }) {
  return <section className={flush ? "card flush" : "card"}>{children}</section>;
}

export const Eyebrow = ({ children }: { children: ReactNode }) => <p className="eyebrow">{children}</p>;
export const Note = ({ children }: { children: ReactNode }) => <p className="note">{children}</p>;
export const Tag = ({ children }: { children: ReactNode }) => <span className="tag">{children}</span>;

export function Button({ variant = "plain", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "plain" | "primary" | "danger" }) {
  return <button type="button" {...rest} className={variant === "plain" ? "btn" : `btn ${variant}`} />;
}

/** One choice of a set where exactly one is chosen (put them inside an element with role="radiogroup"). */
export function OptionCard({ label, hint, swatch, checked, onChoose }: { label: string; hint?: string | undefined; swatch?: string | undefined; checked: boolean; onChoose: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={checked} className="option" onClick={onChoose}>
      {swatch && <span className="swatch" style={{ background: swatch }} />}
      {label}
      {hint && <small>{hint}</small>}
    </button>
  );
}

/** A text field. What it is for is written inside it and gives way to what is typed; `hint` adds an example after it. */
export function Field({ id, label, value, hint, secret = false, error, onChange }: { id: string; label: string; value: string; /** An example, shown after the label while the field is empty. */ hint?: string; secret?: boolean; error?: string | undefined; onChange: (value: string) => void }) {
  return (
    <div className="field">
      <input id={id} type={secret ? "password" : "text"} value={value} placeholder={hint ? `${label} · ${hint}` : label} aria-label={label} autoComplete="off" spellCheck={false}
        aria-invalid={error ? true : undefined} onChange={(e) => onChange(e.target.value)} />
      {error && <span className="error" role="alert">{error}</span>}
    </div>
  );
}

/** One of a short list, as a drop-down. */
export function Select({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="field" htmlFor={id}>
      {label}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

/** A setting between two ends, 0 to 1 (how important, how close). The words at the ends say what they mean. */
export function Slider({ id, label, value, low, high, onChange }: { id: string; label: string; value: number; low: string; high: string; onChange: (value: number) => void }) {
  return (
    <label className="field" htmlFor={id}>
      {label}
      <input id={id} type="range" min={0} max={100} step={5} value={Math.round(value * 100)} aria-valuetext={`${Math.round(value * 100)}%`} onChange={(e) => onChange(Number(e.target.value) / 100)} />
      <span className="ends" aria-hidden="true"><span>{low}</span><span>{high}</span></span>
    </label>
  );
}

export function Chip({ children, pressed, onToggle }: { children: ReactNode; pressed: boolean; onToggle: () => void }) {
  return <button type="button" className="chip" aria-pressed={pressed} onClick={onToggle}>{children}</button>;
}

/** Marks what something belongs to: personal, interpersonal, collective, or a cloud service. */
export function ScopeBadge({ scope }: { scope: Scope | "interpersonal" }) {
  const names = { personal: "Personal", interpersonal: "Interpersonal", collective: "Collective", cloud: "Cloud" } as const;
  return <span className="scope" style={tint(SCOPE_COLOUR[scope])}>{names[scope]}</span>;
}

/** The two buttons present on every screen, so the member always knows which AI they are addressing. */
export function AiButtons({ local, cloud, onLocal, onCloud }: { local: boolean; cloud: boolean; onLocal: () => void; onCloud: () => void }) {
  return (
    <div className="ai-buttons">
      <button type="button" style={tint("var(--personal)")} disabled={!local} onClick={onLocal} title={local ? "Talk to the AI on this device" : "No local AI set up"}>Local AI</button>
      <button type="button" style={tint("var(--cloud)")} disabled={!cloud} onClick={onCloud} title={cloud ? "Talk to the cloud AI" : "No cloud AI set up"}>Cloud AI</button>
    </div>
  );
}

/** The hamburger menu button of mosaicvillage.org's top bar: two bars that cross into an X while open. */
export function MenuButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="menu-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={onToggle}>
      <span className="menu-icon"><span /><span /></span>
    </button>
  );
}

/** The light/dark pill switch of mosaicvillage.org's top bar. */
export function ThemeToggle() {
  const dark = useTheme() === "dark";
  return (
    <button type="button" role="switch" aria-checked={dark} className="theme-switch" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setTheme(dark ? "light" : "dark")}>
      <span className="knob" />
    </button>
  );
}

export type StepState = "done" | "current" | "ahead";
export function StepRail({ steps, onGo }: { steps: readonly { label: string; state: StepState }[]; onGo: (index: number) => void }) {
  return (
    <nav className="tabs" aria-label="Setup steps">
      {steps.map((s, i) => (
        <button key={s.label} type="button" data-state={s.state} aria-current={s.state === "current" ? "step" : undefined} disabled={s.state === "ahead"} onClick={() => onGo(i)}>{s.label}</button>
      ))}
    </nav>
  );
}

/** The steps of a sequence as numbers in a row. The current one is filled; a finished one can be gone back to. */
export function StepNumbers({ steps, onGo }: { steps: readonly { name: string; state: StepState }[]; onGo?: (index: number) => void }) {
  return (
    <nav className="steps" aria-label="Steps">
      <ol>
        {steps.map((s, i) => (
          <li key={s.name}>
            <button type="button" data-state={s.state} aria-current={s.state === "current" ? "step" : undefined} aria-label={`Step ${i + 1}: ${s.name}`} title={s.name}
              disabled={s.state !== "done" || !onGo} onClick={() => onGo?.(i)}>{i + 1}</button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type ValueBars = { name: string; importance: number; time: number; notes: number; ai: number };
/** Importance next to the three measures of engagement, per value. Never blended into one score. */
export function EngagementBars({ values }: { values: readonly ValueBars[] }) {
  const bar = (n: number, colour: string) => <span className="bar" title={`${Math.round(n * 100)}%`}><i style={{ width: `${n * 100}%`, ...tint(colour) }} /></span>;
  return (
    <div className="bars">
      <span /><span className="head">Importance</span><span className="head">Time spent</span><span className="head">Notes</span><span className="head">AI talks</span>
      {values.map((v) => (
        <div key={v.name} style={{ display: "contents" }}>
          <span>{v.name}</span>{bar(v.importance, "var(--accent)")}{bar(v.time, "var(--fg)")}{bar(v.notes, "var(--fg)")}{bar(v.ai, "var(--fg)")}
        </div>
      ))}
    </div>
  );
}

/** One line of the settings list: a connected folder, database or AI, with pause and remove. */
export function ConnectionRow({ name, detail, scope, connected, paused = !connected, colour, onToggle, onRemove }: { name: string; detail: string; scope: Scope; connected: boolean; /** Not connected because the member paused it (rather than never set up). Unless said otherwise, any unconnected line counts as paused. */ paused?: boolean; /** Overrides the scope colour of the dot. */ colour?: string; onToggle?: () => void; onRemove?: () => void }) {
  return (
    <div className="connection" data-connected={connected}>
      <span className="dot" style={tint(colour ?? SCOPE_COLOUR[scope])} />
      <span className="what">{name}<small>{detail}{paused ? " · paused" : ""}</small></span>
      {onToggle && <Button onClick={onToggle}>{paused ? "Resume" : "Pause"}</Button>}
      {onRemove && <Button variant="danger" onClick={onRemove}>Remove</Button>}
    </div>
  );
}

/** Something a connection received: who it is from, when, and what was said. */
export function Message({ who, when, children }: { who: string; when: string; children: ReactNode }) {
  return <div className="message"><small>{who} · {when}</small>{children}</div>;
}

/** Asked before any connection is opened or closed. */
export function ConfirmPanel({ title, children, confirmLabel, onConfirm, onCancel }: { title: string; children: ReactNode; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="confirm" role="alertdialog" aria-label={title}>
      <h2>{title}</h2>
      <p>{children}</p>
      <div className="row"><Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button><Button onClick={onCancel}>Cancel</Button></div>
    </div>
  );
}

/** A small set of views to switch between: a raised pill in a sunken track ("pill"), or a line under the words ("line"). */
export function Tabs({ tabs, selected, onSelect, look = "pill" }: { tabs: readonly string[]; selected: string; onSelect: (tab: string) => void; look?: "pill" | "line" }) {
  return (
    <div className={look === "line" ? "tabs line" : "tabs"} role="tablist">
      {tabs.map((t) => <button key={t} type="button" role="tab" aria-selected={t === selected} onClick={() => onSelect(t)}>{t}</button>)}
    </div>
  );
}

const ALERTS = { success: ["var(--success)", "✓"], warning: ["var(--warning)", "!"], error: ["var(--danger)", "!"] } as const;
/** A message about what just happened or what needs attention. */
export function Alert({ kind, children }: { kind: keyof typeof ALERTS; children: ReactNode }) {
  const [colour, mark] = ALERTS[kind];
  return <div className="alert" role={kind === "error" ? "alert" : "status"} style={tint(colour)}><span className="icon" aria-hidden="true">{mark}</span>{children}</div>;
}

export { LeftSidebar, type SidebarItem, type SidebarFooterItem } from "./left-sidebar";
