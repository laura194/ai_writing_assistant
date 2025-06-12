import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white/30 backdrop-blur-md shadow-lg border border-white/20 rounded-2xl p-6">
        <SignIn
          appearance={{
            elements: {
              // Layout
              headerTitle:
                "text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
              headerSubtitle: "text-base text-gray-600 italic mb-6",

              rootBox: "w-full flex flex-col items- justify-center px-6 py-8",
              scrollBox:
                "overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-transparent",

              // Form
              form: "space-y-4",
              formField: "space-y-1",
              formFieldLabel: "text-sm font-medium text-gray-700",
              formFieldInput:
                "w-full px-3 py-2 border border-gray-300 rounded-lg transition duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
              formFieldError: "text-sm text-red-500 mt-1",
              formFieldInputShowPasswordButton: "text-sm text-blue-600",

              // Buttons
              formButtonPrimary:
                "w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300",
              formButtonReset: "text-sm text-gray-500 hover:text-gray-700",
              formButtonLoading: "opacity-50 cursor-not-allowed",
              backButton: "text-sm text-gray-500 hover:text-gray-700",
              closeButton:
                "absolute top-4 right-4 text-gray-400 hover:text-gray-600",

              // Social Login Buttons
              socialButtonsBlockButton:
                "w-full flex items-center justify-center border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 text-sm font-medium text-gray-700",
              socialButtonsBlockButtonArrow: "ml-2",
              socialButtonsBlockButtonText: "ml-2",

              // Divider
              dividerRow: "flex items-center my-4",
              dividerLine: "flex-grow h-px bg-gray-200",
              dividerText: "text-gray-500 text-xs uppercase px-2",

              // Footer
              footer: "text-center text-sm text-gray-600 mt-6",
              footerAction: "text-sm text-center text-gray-600",
              footerActionLink: "text-blue-600 hover:underline",

              // Error/Success Messages
              alert:
                "bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm",
              alertText: "text-sm text-red-700",
              successMessage: "text-green-600 text-sm font-medium",

              // Profile (z. B. <UserProfile />)
              profileSectionTitle: "text-lg font-semibold text-gray-900 mb-2",
              profileSectionContent: "space-y-2",
              userPreviewMainIdentifier: "font-medium text-gray-900",
              userPreviewSecondaryIdentifier: "text-sm text-gray-500",

              // Avatar
              avatarBox: "w-16 h-16 rounded-full overflow-hidden",
              avatarImage: "object-cover w-full h-full",
              avatarFallback:
                "bg-gray-200 text-gray-500 flex items-center justify-center",

              // OTP (z. B. 2FA / SMS Codes)
              codeFieldInput:
                "w-12 h-12 text-center border border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-blue-500",

              // Modal Wrapper (wenn du `modal` routing nutzt)
              modalBackdrop: "fixed inset-0 bg-black bg-opacity-40 z-40",
              modalContent: "relative z-50 bg-white rounded-xl shadow-lg p-6",
            },

            variables: {
              // Colors
              colorPrimary: "#a855f7",
              colorText: "#111827",
              colorBackground: "#ffffff",
              colorInputBackground: "#ffffff",
              colorInputText: "#111827",
              colorDanger: "#dc2626",
              colorSuccess: "#16a34a",
              colorWarning: "#facc15",

              // 🔠 Schrift
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",

              // 🔳 Rahmen / Ecken
              borderRadius: "0.5rem", // Tailwind rounded-lg

              // 📱 Abstände & Layout
              spacingUnit: "1rem", // Basisabstand für Padding / Margin
            },

            // Optional: Theme-Voreinstellung überschreiben
            layout: {
              // 🔘 Social Button Stil: blockButton = große Buttons, iconButton = kompakte runde Icons
              socialButtonsVariant: "blockButton", // oder "iconButton"

              // 🔠 Positionierung der sozialen Buttons (vor oder nach klassischen Feldern)
              socialButtonsPlacement: "top", // oder "bottom"

              // ❌ Sichtbarkeit des Logos (nützlich, wenn du ein eigenes Layout hast)
              logoPlacement: "inside", // "inside" (innerhalb des Cards), "outside", oder "none"

              // 🖼 Logo selbst
              logoImageUrl: "/logo.png", // dein Logo (empfohlen: PNG/SVG mit transparenter Fläche)

              // 🔗 Hilfeseite für "Need help?" Links
              helpPageUrl: "/help", // URL deiner Hilfe-/Supportseite

              // ❌ Links zu Datenschutz/AGB ausblenden
              privacyPageUrl: "/privacy",
              termsPageUrl: "/terms",

              // 🧾 Welche Felder zuerst bei mehrschrittigen Formularen angezeigt werden
              // (eher selten benutzt – nur bei Custom SignUp)
              showOptionalFields: false,
            },

            // Optional: Base Theme (dark oder light)
            baseTheme: undefined, // oder: dark / light
          }}
          path="/signIn"
          routing="path"
        />
      </div>
    </main>
  );
}
