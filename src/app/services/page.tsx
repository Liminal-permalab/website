import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Card } from "permalab-ui/elements";

export const metadata: Metadata = {
  title: "Services",
  description: "Culture mapping, private AI, agents for your group, and facilitation.",
};

/* Draft wording: the four services are a first proposal, to be corrected by the founder. */
const SERVICES = [
  {
    name: "Culture mapping",
    text: "A facilitated session where your group names what it values and sees where its time goes. You leave with a shared map and the two or three gaps worth working on.",
  },
  {
    name: "Private AI for your group",
    text: "We set up open-source AI on your own computers, so your group's conversations and documents never leave them. No account with an AI company is needed.",
  },
  {
    name: "Agents that know your agreements",
    text: "AI agents that follow your group's own agreements and ways of working, and take on routine parts of running a group: notes, reminders, keeping track of what was decided.",
  },
  {
    name: "Facilitation and mediation",
    text: "People, not software. When a map shows a tension, we help the group work through it: mediation, governance and the design of how you meet and decide.",
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-6 lg:pt-10">
      <h1 className="hero-title max-w-[16ch]">What we do with groups.</h1>
      <p className="lead mt-6 max-w-[38rem]">
        Every group already has a culture. We help you see yours, decide what to keep, and give you AI tools that
        work by your rules.
      </p>

      <div className="mt-12">
        <Card flush>
          {SERVICES.map((service, i) => (
            <div
              key={service.name}
              className="under grid gap-x-10 gap-y-2 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]"
              style={i === 0 ? { borderTop: 0 } : undefined}
            >
              <h2 className="section-title" style={{ fontSize: "var(--text-heading)" }}>
                {service.name}
              </h2>
              <p className="read max-w-[38rem]">{service.text}</p>
            </div>
          ))}
        </Card>
      </div>

      <div className="row mt-8">
        {site.contactEmail && (
          <a href={`mailto:${site.contactEmail}`} className="btn primary">
            Write to us
          </a>
        )}
        <Link href="/sign-in" className={site.contactEmail ? "btn" : "btn primary"}>
          Sign in or join
        </Link>
        <Link href="/download" className="btn">
          About the app
        </Link>
      </div>
    </div>
  );
}
