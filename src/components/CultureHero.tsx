"use client";

// The homepage: an empty page, the text filling in, and under it the torus, which grows as the text is written.
// Text and torus form one group, centred in the window.
// The torus can be turned by dragging, and shown alone across the whole screen.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "permalab-ui/elements";
import { FillingText } from "./FillingText";
import { TorusFlow } from "./TorusFlow";

/* Draft wording, to be corrected by the founder. */
const TITLE = "What it means to create a culture";
const LINES = [
  "A culture is what a group does without having to decide it each time.",
  "It begins when people say what matters to them, and notice where their time really goes.",
  "What each person brings pours in from above, and keeps circling inside it.",
  "The more it receives, the more it grows, and the further it is felt.",
];

export function CultureHero() {
  const [written, setWritten] = useState(0);
  const [full, setFull] = useState(false);
  const section = useRef<HTMLElement>(null);
  const torusSpace = useRef<HTMLDivElement>(null);

  // leaving the browser's full screen (the Esc key, for example) also leaves the full view
  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFull(false); };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFull = () => {
    if (full) {
      if (document.fullscreenElement) void document.exitFullscreen();
      setFull(false);
      return;
    }
    setFull(true);
    // where the browser cannot give an element the whole screen (an iPhone), the view still fills the window
    section.current?.requestFullscreen?.().catch(() => {});
  };

  return (
    <section ref={section} className="culture-hero" data-full={full}>
      <TorusFlow energy={written} full={full} space={torusSpace} label="A torus that grows as a stream pours into its centre from above and circles inside it, sending out waves that become stronger and closer together." />
      <div className="culture-text">
        <FillingText title={TITLE} lines={LINES} onProgress={setWritten}>
          <div className="row mt-8">
            <Link href="/services" className="btn primary">See the services</Link>
            <Link href="/download" className="btn">About the app</Link>
          </div>
        </FillingText>
      </div>
      <div ref={torusSpace} className="culture-torus-space" />
      <div className="culture-controls">
        <span>Drag to turn it</span>
        <Button onClick={toggleFull}>{full ? "Exit full screen" : "Full screen"}</Button>
      </div>
    </section>
  );
}
