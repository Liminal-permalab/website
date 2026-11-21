// The small building blocks of every screen. Each is plain: it shows what it is given and reports what was done to
// it. The page at #/ui (src/screens/UiPage.tsx) shows them all.
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import type { Scope } from "./scope";

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

export function Field({ id, label, value, placeholder, secret = false, error, onChange }: { id: string; label: string; value: string; placeholder?: string; secret?: boolean; error?: string | undefined; onChange: (value: string) => void }) {
  return (
    <label className="field" htmlFor={id}>
      {label}
      <input id={id} type={secret ? "password" : "text"} value={value} placeholder={placeholder} autoComplete="off" spellCheck={false}
        aria-invalid={error ? true : undefined} onChange={(e) => onChange(e.target.value)} />
      {error && <span className="error">{error}</span>}
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
export function ConnectionRow({ name, detail, scope, connected, colour, onToggle, onRemove }: { name: string; detail: string; scope: Scope; connected: boolean; /** Overrides the scope colour of the dot. */ colour?: string; onToggle?: () => void; onRemove?: () => void }) {
  return (
    <div className="connection" data-connected={connected}>
      <span className="dot" style={tint(colour ?? SCOPE_COLOUR[scope])} />
      <span className="what">{name}<small>{detail}{connected ? "" : " · paused"}</small></span>
      {onToggle && <Button onClick={onToggle}>{connected ? "Pause" : "Resume"}</Button>}
      {onRemove && <Button variant="danger" onClick={onRemove}>Remove</Button>}
    </div>
  );
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
