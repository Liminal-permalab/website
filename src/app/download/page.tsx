import type { Metadata } from "next";
import { ValuesMap } from "@/components/ValuesMap";
import { Card, ScopeBadge } from "permalab-ui/elements";
import { DownloadPanel } from "./DownloadPanel";

export const metadata: Metadata = {
  title: "The app",
  description: "The Permalab app for desktop: your maps, your agents and a local AI on your own computer.",
};

const PARTS = [
  {
    title: "Your maps",
    text: "A map for each space: personal, interpersonal and collective. Values grow or shrink with their importance, and bars show where your time goes.",
  },
  {
    title: "Your agents",
    text: "AI agents that work with the folders you opened to them and nothing else.",
  },
  {
    title: "A local AI",
    text: "The app checks your computer and offers an open-source model that fits it. You can skip this and add it later.",
  },
];

const SPACES = [
  { scope: "personal", text: "What you value and what you give your time to. Only you see this map." },
  { scope: "interpersonal", text: "The relationships you are part of, and how each of them is doing." },
  { scope: "collective", text: "What your group holds in common, and its ties to other groups." },
] as const;

const PROMISES = [
  {
    title: "Kept on your own device",
    text: "Each person's data lives in a database on their own computer or phone, and the app keeps working offline.",
  },
  {
    title: "An AI sees only what you open to it",
    text: "Nothing is visible to any AI until you choose a folder to share with it.",
  },
  {
    title: "Private means private",
    text: "Private notes are encrypted on your device before anything is synced. Permalab cannot read them.",
  },
  {
    title: "Local AI first",
    text: "An open-source model can run on your own computer. A cloud AI is optional and uses your own key.",
  },
];

export default function DownloadPage() {
  return (
    <div className="pt-6 lg:pt-10">
      <div className="grid items-start gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div>
          <h1 className="hero-title max-w-[14ch]">The Permalab app.</h1>
          <p className="lead mt-6 max-w-[36rem]">
            One app for desktop that holds your maps, your agents and a local AI, working together on your own
            computer. It is for Permalab members.
          </p>
        </div>
        <DownloadPanel />
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {PARTS.map((part) => (
          <Card key={part.title}>
            <div className="stack">
              <h2>{part.title}</h2>
              <p>{part.text}</p>
            </div>
          </Card>
        ))}
      </div>

      <section className="mt-20 grid items-center gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
        <div>
          <h2 className="section-title max-w-[16ch]">Three spaces, each with its own map.</h2>
          <div className="mt-8 flex flex-col gap-5">
            {SPACES.map((space) => (
              <div key={space.scope} className="stack">
                <div className="row">
                  <ScopeBadge scope={space.scope} />
                </div>
                <p className="read max-w-[34rem]">{space.text}</p>
              </div>
            ))}
          </div>
        </div>
        <ValuesMap />
      </section>

      <section className="mt-20 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div>
          <h2 className="section-title">Your culture stays yours.</h2>
          <p className="read mt-4">
            A group&apos;s culture is made of things said in trust. The app is built so they stay with the people who
            said them.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {PROMISES.map((promise) => (
            <Card key={promise.title}>
              <div className="stack">
                <h2>{promise.title}</h2>
                <p>{promise.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
