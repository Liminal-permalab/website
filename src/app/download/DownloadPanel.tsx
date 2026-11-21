"use client";

import Link from "next/link";
import { getSupabase, useMember } from "@/lib/supabase";
import { Button, Card, Note } from "permalab-ui/elements";

/* There is no released build yet. When there is, the files must be served from the server to signed-in
   members only (for example Supabase Storage signed links): this panel only decides what to show. */
export function DownloadPanel() {
  const member = useMember();

  return (
    <Card>
      <div className="stack" aria-live="polite">
        <h2>Download</h2>
        <Note>
          The app is still being built. When the first version is ready, members download it here for Mac, Windows
          and Linux.
        </Note>
        {member.status === "signed-in" && (
          <>
            <p>
              Signed in as <strong>{member.email}</strong>. Nothing to download yet.
            </p>
            <div className="row">
              <Button onClick={() => getSupabase()?.auth.signOut()}>Sign out</Button>
            </div>
          </>
        )}
        {(member.status === "signed-out" || member.status === "not-connected") && (
          <>
            <p>Sign in to see the download as soon as it is published.</p>
            <div className="row">
              <Link href="/sign-in" className="btn primary">
                Sign in or join
              </Link>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
