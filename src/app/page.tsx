import Link from "next/link";
import { ValuesMap } from "@/components/ValuesMap";
import { Card, ScopeBadge } from "permalab-ui/elements";

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

export default function Home() {
  return (
    <div className="flex flex-col gap-20">
      <section className="grid items-center gap-x-12 gap-y-8 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:pt-10">
        <div>
          <h1 className="hero-title">Build a culture of your own.</h1>
          <p className="lead mt-6 max-w-[34rem]">
            Permalab helps people and groups see what they value, how they relate and what they hold in common,
            with AI that runs on their own devices.
          </p>
          <div className="row mt-8">
            <Link href="/services" className="btn primary">
              See the services
            </Link>
            <Link href="/download" className="btn">
              About the app
            </Link>
          </div>
        </div>
        <ValuesMap />
      </section>

      <section>
        <h2 className="section-title max-w-[20ch]">Three spaces, each with its own map.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {SPACES.map((space) => (
            <Card key={space.scope}>
              <div className="stack">
                <div className="row">
                  <ScopeBadge scope={space.scope} />
                </div>
                <p className="read">{space.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
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

      <section>
        <h2 className="section-title max-w-[18ch]">Start with a conversation, or with the app.</h2>
        <p className="read mt-4 max-w-[38rem]">
          We work with groups in person and set up the tools with them. Members also get the Permalab app for
          desktop.
        </p>
        <div className="row mt-7">
          <Link href="/services" className="btn primary">
            See the services
          </Link>
          <Link href="/sign-in" className="btn">
            Sign in or join
          </Link>
        </div>
      </section>
    </div>
  );
}
