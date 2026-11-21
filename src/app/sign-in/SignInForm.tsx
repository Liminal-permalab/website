"use client";

import { useState } from "react";
import { getSupabase, useMember } from "@/lib/supabase";
import { Alert, Button, Card, Note } from "permalab-ui/elements";

type State =
  | { step: "idle" }
  | { step: "sending" }
  | { step: "sent"; email: string }
  | { step: "failed" };

export function SignInForm() {
  const member = useMember();
  const [state, setState] = useState<State>({ step: "idle" });
  const connected = member.status !== "not-connected";

  async function sendLink(formData: FormData) {
    const supabase = getSupabase();
    const email = String(formData.get("email") ?? "").trim();
    if (!supabase || !email) return;

    setState({ step: "sending" });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/download` },
    });
    setState(error ? { step: "failed" } : { step: "sent", email });
  }

  if (member.status === "signed-in") {
    return (
      <Card>
        <div className="stack">
          <p>
            You are signed in as <strong>{member.email}</strong>.
          </p>
          <div className="row">
            <Button onClick={() => getSupabase()?.auth.signOut()}>Sign out</Button>
          </div>
        </div>
      </Card>
    );
  }

  if (state.step === "sent") {
    return (
      <Card>
        <div className="stack">
          <Alert kind="success">Sign-in link sent to {state.email}</Alert>
          <p>Open it on this device. You can close this page.</p>
          <div className="row">
            <Button onClick={() => setState({ step: "idle" })}>Use a different email</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form action={sendLink} className="stack">
        <label className="field" htmlFor="email">
          Email
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.org" disabled={!connected} />
        </label>
        <div className="row">
          <Button type="submit" variant="primary" disabled={!connected || state.step === "sending"}>
            {state.step === "sending" ? "Sending…" : "Email me a sign-in link"}
          </Button>
        </div>
        {!connected && <Note>Sign-in is not switched on yet. It will work here once the member database is connected.</Note>}
        {state.step === "failed" && (
          <Alert kind="error">The link could not be sent. Check the address and try again in a minute.</Alert>
        )}
      </form>
    </Card>
  );
}
