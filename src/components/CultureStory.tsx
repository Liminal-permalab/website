"use client";

// The homepage, as one long page told by scrolling: a statement, then five steps, each a window tall, while one
// picture stays in place behind them and changes with the scroll (src/components/story/scene.ts). The picture is a
// descent from the sky into the ocean and down through three layers. Each section locks into place when it is
// reached, so a scroll moves exactly one step. The words of each step travel a little slower than the page.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FillingText } from "./FillingText";
import { createParticles, drawScene, KINDS, type View } from "./story/scene";

/* Draft wording, to be corrected by the founder. */
const QUESTIONS = [
  "What happens when a culture is collapsing, and we do not know in which direction to go?",
  "And what happens if we are not willing to just follow somebody, but want to become cultural creators?",
];
const STEPS = [
  { title: "Information moves chaotically", text: "A culture in transition is full of information, and does not know where to go. Everything arrives at once, in no order." },
  { title: "It receives a direction", text: "Cultural creation gives it one. Lines of attention draw the information together, and it starts to come down, and to ground." },
  { title: "It passes through shared values and practices", text: "Here it enters a shared understanding of values and practices: the rituals that give information more clarity. The donut is made of seven coloured sections. The information turns once around its body and goes once round the ring, and takes colour as it moves through the sections." },
  { title: "It arrives in seven", text: `Still falling, it arrives in seven separate places, each with its own colour: ${KINDS.map((kind) => kind.name.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}. In each it turns once around the donut, and moves on.` },
  { title: "It goes deeper still", text: "Next it passes through the mythological realm, where the archetypes are, and turns once around it. There it finds a deeper understanding of what is going on." },
  { title: "It is kept as memory", text: "Last it comes into the memory, and there everything comes together. From the memory it spreads out again in rings of expansion, in the seven colours of what was shared." },
];

const CLOSING = "Permalab is supporting you in structuring and shaping your culture, and in organising the information of your members, so that culture can find coherence again.";

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export function CultureStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Moving between sections, for the gauge and the arrow; set up below. */
  const controls = useRef<{ go: (index: number) => void; step: (move: number) => void } | null>(null);
  /** The section on screen, for the gauge and the arrow. */
  const [section, setSection] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!root || !canvas || !context) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = createParticles(window.innerWidth < 700 ? 240 : 420);
    const copies = [...root.querySelectorAll<HTMLElement>("[data-travels]")];
    const view: View = { yaw: 0, tilt: 1.2 };
    let ink = { text: "#e4e4e4", muted: "#9a9a9a", font: "sans-serif", bg: "#242427" };
    let width = 0;
    let height = 0;
    let last = 0;
    let turning = 0;
    let held: { x: number; y: number } | null = null;
    // where each section begins, measured from the top of the story
    let tops: number[] = [];
    let shown = -1; // the section last told to the gauge

    const readInk = () => {
      const style = getComputedStyle(canvas);
      ink = { text: style.color, muted: style.getPropertyValue("--muted").trim() || ink.muted, font: style.fontFamily, bg: style.getPropertyValue("--bg").trim() || ink.bg };
    };
    const fit = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      tops = [...root.querySelectorAll<HTMLElement>(".story-panel")].map((panel) => panel.offsetTop);
      tops.push(root.offsetHeight);
    };

    const draw = (time: number, step: number) => {
      // how many sections have been scrolled past: a whole number when a section's top is at the top of the window
      const passed = -root.getBoundingClientRect().top;
      let scroll = 0;
      for (let i = 0; i < tops.length - 1; i++) {
        const from = tops[i] ?? 0;
        const to = tops[i + 1] ?? from + 1;
        if (passed >= from) scroll = i + clamp((passed - from) / (to - from), 0, 1);
      }
      const now = clamp(Math.round(scroll), 0, STEPS.length + 1);
      if (now !== shown) { shown = now; setSection(now); }
      if (!held) {
        view.yaw += step * 0.04 + turning * step;
        turning *= Math.max(0, 1 - step * 2.5);
      }
      drawScene(context, width, height, still ? 20 : time, scroll, view, ink, particles);
      // the words of each step travel slower than the page
      if (!still) {
        for (const copy of copies) {
          const box = copy.parentElement?.getBoundingClientRect();
          if (box) // the offset is kept small enough that the next step's words never show before their section is reached
          copy.style.transform = `translate3d(0, ${clamp((box.top + box.height / 2 - window.innerHeight / 2) * -0.22, -90, 90).toFixed(1)}px, 0)`;
        }
      }
    };

    let frame = 0;
    const loop = (now: number) => {
      const time = now / 1000;
      draw(time, last ? Math.min(0.05, time - last) : 0);
      last = time;
      if (!document.hidden && (!still || held)) frame = requestAnimationFrame(loop);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      last = 0;
      frame = requestAnimationFrame(loop);
    };

    // the tori can be turned by dragging: sideways turns them, up and down tips them
    const press = (event: PointerEvent) => {
      held = { x: event.clientX, y: event.clientY };
      turning = 0;
      canvas.setPointerCapture(event.pointerId);
      canvas.dataset.held = "true";
      restart();
    };
    const move = (event: PointerEvent) => {
      if (!held) return;
      const dx = (event.clientX - held.x) * 0.008;
      view.yaw += dx;
      view.tilt = clamp(view.tilt + (event.clientY - held.y) * 0.006, 0.35, 1.5);
      turning = dx * 40;
      held = { x: event.clientX, y: event.clientY };
    };
    const release = () => {
      held = null;
      delete canvas.dataset.held;
    };

    // moving between the sections. The keyboard, the mouse wheel and trackpad, the gauge and the arrow all come
    // through here, and all move exactly one section at a time.
    let goal: number | null = null; // the stop being scrolled to, while a scroll is under way
    let target = 0; // where that stop is on the page
    let startedAt = 0; // when that move began
    let settle = 0;
    const stops = () => {
      const top = root.getBoundingClientRect().top + window.scrollY;
      const last = document.documentElement.scrollHeight - window.innerHeight;
      // the top of the page, the start of each section after the statement, and the foot of the page
      return [0, ...tops.slice(1, -1).map((section) => top + section), last].map((y) => clamp(y, 0, last)).filter((y, i, all) => i === 0 || y > (all[i - 1] ?? 0) + 4);
    };
    const go = (index: number) => {
      const places = stops();
      goal = clamp(index, 0, places.length - 1);
      target = places[goal] ?? 0;
      startedAt = performance.now();
      window.scrollTo({ top: target, behavior: still ? "auto" : "smooth" });
      scrolled(); // even if the page does not move (it is already there), the move is over after a moment
    };
    const stepBy = (move: number) => {
      const places = stops();
      const nearest = places.reduce((best, y, i) => (Math.abs(y - window.scrollY) < Math.abs((places[best] ?? 0) - window.scrollY) ? i : best), 0);
      go((goal ?? nearest) + move);
    };
    controls.current = { go, step: stepBy };

    const keys: Record<string, number> = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
    const press_key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      let move = keys[event.key];
      if (event.key === " ") {
        // the space bar still presses a focused button or link
        if (target && target !== document.body && target !== document.documentElement) return;
        move = event.shiftKey ? -1 : 1;
      }
      if (event.key === "Home") go(0);
      else if (event.key === "End") go(Number.MAX_SAFE_INTEGER);
      else if (move) stepBy(move);
      else return;
      event.preventDefault();
    };
    // the wheel and the trackpad: one gesture, one section. A gesture is a run of wheel movements with less than a
    // moment between them, so the long tail of a trackpad swipe does not carry on to the next section. It counts the
    // total movement, not each step: a trackpad swipe begins with tiny movements that only grow later.
    let lastWheel = 0;
    let pulled = 0; // how far the wheel has moved in this gesture
    let spent = false; // whether this gesture has already moved a section
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return; // pinch zoom, or sideways
      if (event.target instanceof Element && event.target.closest("input, textarea, select")) return;
      event.preventDefault();
      const at = performance.now();
      if (at - lastWheel > 140) { pulled = 0; spent = false; } // a new gesture
      lastWheel = at;
      if (spent || goal !== null) return;
      pulled += event.deltaY * (event.deltaMode === 1 ? 16 : 1);
      if (Math.abs(pulled) >= 12) {
        spent = true;
        stepBy(pulled > 0 ? 1 : -1);
      }
    };
    // a swipe on a touch screen: one swipe, one section (a drag of the donuts is sideways and still turns them)
    let touch: { y: number } | null = null;
    const touchBegin = (event: TouchEvent) => { touch = event.touches.length === 1 ? { y: event.touches[0]?.clientY ?? 0 } : null; };
    const touchMove = (event: TouchEvent) => { if (touch && event.cancelable) event.preventDefault(); };
    const touchEnd = (event: TouchEvent) => {
      if (!touch) return;
      const moved = touch.y - (event.changedTouches[0]?.clientY ?? touch.y);
      touch = null;
      if (Math.abs(moved) > 40 && goal === null) stepBy(moved > 0 ? 1 : -1);
    };
    // when the scrolling has stopped: after one of our own moves, the next move starts again from where the page
    // is; after any other kind of scrolling (the scrollbar, the find bar, a link), the page settles on the nearest
    // section, so it never stays between two
    function scrolled() {
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (goal !== null) {
          // one of our own moves: it is over once the page has arrived, or has had long enough. Until then the
          // page is left alone, however slowly it is moving.
          if (Math.abs(window.scrollY - target) <= 3 || performance.now() - startedAt > 3000) goal = null;
          else scrolled();
          return;
        }
        const places = stops();
        const nearest = places.reduce((best, y, i) => (Math.abs(y - window.scrollY) < Math.abs((places[best] ?? 0) - window.scrollY) ? i : best), 0);
        if (Math.abs((places[nearest] ?? 0) - window.scrollY) > 4) go(nearest);
      }, 180);
    }

    readInk();
    fit();
    restart();

    canvas.addEventListener("pointerdown", press);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    const resize = new ResizeObserver(() => { fit(); restart(); });
    resize.observe(canvas);
    const theme = new MutationObserver(() => { readInk(); restart(); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    // without motion the picture is still drawn for wherever the page has been scrolled to
    const onScroll = () => { if (still) restart(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener("keydown", press_key);
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchBegin, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend", touchEnd, { passive: true });
    document.addEventListener("visibilitychange", restart);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", press);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", release);
      resize.disconnect();
      theme.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("keydown", press_key);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchBegin);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
      controls.current = null;
      clearTimeout(settle);
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);

  return (
    <div ref={rootRef} className="story">
      <div className="story-stage">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Points of information that first move without order, then fall together, pass through a first torus of seven coloured sections, shared values and practices, and take colour from them, arrive in seven tori (${KINDS.map((kind) => kind.name).join(", ")}), pass through the mythological realm, where the archetypes are, and come together in the memory, which sends out rings of expansion in the seven colours. In each torus a point turns once around the body of the donut before moving on.`}
        />
      </div>

      <nav className="story-gauge" aria-label="Sections of the story">
        {Array.from({ length: STEPS.length + 2 }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={i === 0 ? "The question" : i <= STEPS.length ? `Step ${i}: ${STEPS[i - 1]?.title ?? ""}` : "The closing statement"}
            aria-current={i === section ? "step" : undefined}
            onClick={() => controls.current?.go(i)}
          />
        ))}
      </nav>
      {section < STEPS.length + 1 && (
        <button type="button" className="story-next" aria-label="Next section" onClick={() => controls.current?.step(1)}>
          <i className="fa-solid fa-chevron-down" aria-hidden="true" />
        </button>
      )}

      <section className="story-panel story-statement">
        <FillingText title={QUESTIONS[0] ?? ""} lines={QUESTIONS.slice(1)}>
          <p className="story-hint">Scroll, or press the down arrow, to follow it</p>
        </FillingText>
      </section>

      {STEPS.map((step, i) => (
        <section key={step.title} className="story-panel">
          <div className="story-copy" data-travels>
            <p className="story-number">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="section-title">{step.title}</h2>
            <p className="read">{step.text}</p>
          </div>
        </section>
      ))}

      <section className="story-panel story-end">
        <h2 className="story-closing">{CLOSING}</h2>
        <div className="row">
          <Link href="/services" className="btn primary">See the services</Link>
          <Link href="/download" className="btn">About the app</Link>
        </div>
      </section>
    </div>
  );
}
