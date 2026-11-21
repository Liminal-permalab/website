import type { Metadata } from "next";
import { Card } from "permalab-ui/elements";
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
    </div>
  );
}
