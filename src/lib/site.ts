/** Facts about the site that appear in more than one place. */
export const site = {
  name: "Permalab",
  description:
    "Permalab helps people and groups build a culture of their own, with AI that runs on their own devices.",
  /** Leave empty until there is an address to publish: the contact buttons stay hidden while it is. */
  contactEmail: "",
  nav: [
    { href: "/services", label: "Services" },
    { href: "/download", label: "The app" },
  ],
} as const;
