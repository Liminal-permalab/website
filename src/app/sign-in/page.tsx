import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in or join",
  description: "Sign in to Permalab with a link sent to your email.",
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md pt-8 sm:pt-14">
      <h1 className="section-title">Sign in or join.</h1>
      <p className="read mt-4">
        Enter your email and we send you a link. Open it and you are signed in. There is no password. The same
        account works in the Permalab app.
      </p>
      <div className="mt-6">
        <SignInForm />
      </div>
    </div>
  );
}
