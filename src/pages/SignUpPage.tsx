import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <SignUp path="/signUp" routing="path" />
      </div>
    </main>
  );
}
