import { ReactNode } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

type Props = { children: ReactNode };

export default function ProtectedRoute({ children }: Props) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
