import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const { isSignedIn, user } = useUser();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome</h1>

        {isSignedIn ? (
          <>
            <div className="mb-4 text-gray-700">
              <p className="text-lg">Hallo, {user?.firstName} 👋</p>
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={`${user.firstName} Profilbild`}
                  className="w-16 h-16 rounded-full mx-auto mt-4"
                />
              )}
            </div>
            <Link
              to="/home"
              className="inline-block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Click here to go to the Home Page
            </Link>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <SignInButton mode="modal">
              <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        )}
      </section>
    </main>
  );
}
