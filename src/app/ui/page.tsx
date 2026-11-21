"use client";

// The styleguide (/ui): every element of the interface on one page, built from the same components and tokens as
// the app's own styleguide (permalab-desktop, src/screens/UiPage.tsx). The app's page also shows its 3D maps, which
// the website does not carry. Figures and names are examples.
import { useState, type CSSProperties, type ReactNode } from "react";
import { AiButtons, Alert, Button, Card, Chip, ConfirmPanel, ConnectionRow, EngagementBars, Field, Note, OptionCard, ScopeBadge, StepRail, Tabs, Tag } from "permalab-ui/elements";

const COLOURS = [["Primary", "accent"], ["Surface", "raised"], ["Border", "grey"], ["Personal", "personal"], ["Interpersonal", "interpersonal"], ["Collective", "collective"], ["Cloud", "cloud"], ["Danger", "danger"]] as const;
const TYPE = [["Display", "display", 700], ["Heading", "heading", 700], ["Medium", "medium", 600], ["Body", "body", 400], ["Small", "small", 400], ["Caption", "caption", 400]] as const;
const SPACES = [4, 8, 12, 16, 20, 28];
const RADII = [["sm", 10], ["md", 14], ["lg", 20]] as const;
const EXAMPLE_VALUES = [
  { name: "Physical health", importance: 0.9, time: 0.35, notes: 0.2, ai: 0.15 },
  { name: "Mental health", importance: 0.8, time: 0.6, notes: 0.75, ai: 0.5 },
  { name: "Food", importance: 0.55, time: 0.7, notes: 0.15, ai: 0.1 },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <Card><div className="ui-section"><h2>{title}</h2>{children}</div></Card>;
}

export default function UiPage() {
  const [choice, setChoice] = useState("a");
  const [text, setText] = useState("");
  const [chip, setChip] = useState("Selected");
  const [tab, setTab] = useState("Personal");
  const [connected, setConnected] = useState(true);
  return (
    <div className="stack" style={{ gap: "var(--space-5)" }}>
      <div className="stack">
        <h1 className="ui-title">Permalab UI Styleguide</h1>
        <p>Everything the website and the app are drawn with. The tokens and elements are the app&apos;s own, kept in the <code>permalab-ui</code> package.</p>
      </div>
      <div className="ui-grid">
        <Section title="Colour tokens">
          <div className="swatches">
            {COLOURS.map(([name, token]) => <div key={token}><i style={{ "--c": `var(--${token})` } as CSSProperties} />{name}</div>)}
            <div><i className="ring" />Focus ring</div>
          </div>
        </Section>
        <Section title="Typography scale">
          <div className="type-scale">
            {TYPE.map(([name, token, weight]) => [
              <span key={name} style={{ fontSize: `var(--text-${token})`, fontWeight: weight, lineHeight: 1.2 }}>{name}</span>,
              <span key={`${name}-size`}>{token}</span>,
            ])}
          </div>
        </Section>
        <Section title="Website headings">
          <p className="section-title" style={{ color: "var(--fg)" }}>Section title</p>
          <p className="lead">Lead text introduces a page in one or two sentences.</p>
          <p className="read">Reading text is for longer passages on the website. The app has no equivalent: its screens use Body.</p>
        </Section>
        <Section title="Spacing and radius">
          <div className="sizes">{SPACES.map((n) => <span key={n}><i style={{ width: n, height: 44 }} />{n}px</span>)}</div>
          <div className="sizes">{RADII.map(([name, r]) => <span key={name}><i style={{ width: 56, height: 56, borderRadius: r }} />{name}, {r}px</span>)}<span><i style={{ width: 84, height: 36, borderRadius: 999 }} />pill</span></div>
        </Section>
        <Section title="Elevation">
          <div className="levels">{[1, 2, 3, 4, 5].map((n) => <div key={n} style={{ boxShadow: `var(--level-${n})`, zIndex: 6 - n, position: "relative", filter: `brightness(${1 - (n - 1) * 0.05})` }}>Level {n}</div>)}</div>
        </Section>
        <Section title="Buttons">
          <div className="row"><Button variant="primary">Primary action</Button><Button>Plain</Button><Button variant="danger">Remove</Button><Button disabled>Disabled</Button></div>
          <AiButtons local cloud onLocal={() => {}} onCloud={() => {}} />
          <p>The local and cloud AI buttons sit on every screen of the app, dimmed until that AI is set up.</p>
        </Section>
        <Section title="Inputs">
          <Field id="ui-text" label="Database address" placeholder="https://db.example.org" value={text} onChange={setText} />
          <Field id="ui-secret" label="Access key" secret placeholder="Hidden while typing" value="" onChange={() => {}} />
          <Field id="ui-error" label="Folder" value="" error="Choose a folder to continue" onChange={() => {}} />
        </Section>
        <Section title="Chips, tags and scopes">
          <div className="row">{["Filter", "Selected", "Ana"].map((n) => <Chip key={n} pressed={chip === n} onToggle={() => setChip(n)}>{n}</Chip>)}</div>
          <div className="row"><Tag>example</Tag><Tag>paused</Tag></div>
          <div className="row"><ScopeBadge scope="personal" /><ScopeBadge scope="interpersonal" /><ScopeBadge scope="collective" /><ScopeBadge scope="cloud" /></div>
        </Section>
        <Section title="Tabs">
          <Tabs tabs={["Personal", "Interpersonal", "Collective"]} selected={tab} onSelect={setTab} />
          <Tabs look="line" tabs={["Personal", "Interpersonal", "Collective"]} selected={tab} onSelect={setTab} />
          <StepRail steps={[{ label: "1 Data", state: "done" }, { label: "2 Sign-in", state: "current" }, { label: "3 Membership", state: "ahead" }]} onGo={() => {}} />
        </Section>
        <Section title="Alerts">
          <Alert kind="success">Connected</Alert>
          <Alert kind="warning">This folder is paused</Alert>
          <Alert kind="error">The database could not be reached</Alert>
          <Note>A note explains a rule: a cloud AI sees one designated folder only.</Note>
        </Section>
        <Section title="Choices">
          <div className="stack" role="radiogroup" aria-label="Example choice">
            <OptionCard label="On this device only" hint="Nothing leaves this computer" checked={choice === "a"} onChoose={() => setChoice("a")} />
            <OptionCard label="A private database" hint="Your own, or one your village runs" checked={choice === "b"} onChoose={() => setChoice("b")} />
            <OptionCard label="Coral" swatch="#f3aa99" checked={choice === "c"} onChoose={() => setChoice("c")} />
          </div>
        </Section>
        <Section title="Cards and confirmation">
          <ConfirmPanel title="Open this connection?" confirmLabel="Connect" onConfirm={() => {}} onCancel={() => {}}>
            The AI will be able to search the folder Research. You can pause or remove it at any time.
          </ConfirmPanel>
        </Section>
        <Section title="Connections">
          <div>
            <ConnectionRow name="App folder" detail="Documents / Permalab" scope="personal" connected />
            <ConnectionRow name="Research folder" detail="Opt-in folder" scope="personal" connected={connected} onToggle={() => setConnected(!connected)} />
            <ConnectionRow name="Cloud AI" detail="Own key" scope="cloud" connected={false} />
          </div>
        </Section>
        <Section title="Engagement bars">
          <EngagementBars values={EXAMPLE_VALUES} />
        </Section>
      </div>
    </div>
  );
}
