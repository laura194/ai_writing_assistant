import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../../../test/renderWithProviders";

vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  const passthrough = (tag: any) => (props: any) =>
    ReactPkg.createElement(tag, props, props?.children);
  return { motion: { div: passthrough("div") } };
});

// Virtual import fix for styles and wrappers and motion utils
vi.mock("../../constants/styles/LandingPageStyles", () => ({
  LandingPageStyles: { sectionSubText: "", sectionHeadText: "" },
}));
vi.mock("../../hoc", () => ({
  __esModule: true,
  SectionWrapper: (C: any) => C,
}));
vi.mock("../../utils/motion", () => ({ slideIn: () => ({}) }));

vi.mock("./canvas/EarthCanvas", () => ({
  __esModule: true,
  default: () => <div data-testid="earth-canvas" />,
}));

const { emailSend } = vi.hoisted(() => ({ emailSend: vi.fn() }));
vi.mock("@emailjs/browser", () => ({
  __esModule: true,
  default: { send: emailSend },
  send: emailSend,
}));

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: toast,
  ...toast,
}));

import Contact from "./LandingContact";

// Provide env vars
Object.assign(import.meta, {
  env: {
    VITE_APP_EMAILJS_SERVICE_ID: "s",
    VITE_APP_EMAILJS_TEMPLATE_ID: "t",
    VITE_APP_EMAILJS_PUBLIC_KEY: "k",
  },
});

describe("LandingContact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form and earth canvas", () => {
    render(<Contact />);

    expect(screen.getByText(/Get in touch/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact\./i)).toBeInTheDocument();
    expect(screen.getByTestId("earth-canvas")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("enables submit when form valid and sends email; shows success toast and resets", async () => {
    emailSend.mockResolvedValueOnce({ status: 200 });
    render(<Contact />);

    await userEvent.type(screen.getByLabelText(/Your Name/i), "Alice");
    await userEvent.type(screen.getByLabelText(/Your Email/i), "a@example.com");
    await userEvent.type(
      screen.getByLabelText(/Your Message/i),
      "Hello there!"
    );

    const submit = screen.getByRole("button", { name: /send/i });
    expect(submit).toBeEnabled();

    await userEvent.click(submit);

    expect(emailSend).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(toast.success).toHaveBeenCalled());

    // inputs cleared
    expect(screen.getByLabelText(/Your Name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Your Email/i)).toHaveValue("");
    expect(screen.getByLabelText(/Your Message/i)).toHaveValue("");
  });

  it("shows error toast when emailjs rejects", async () => {
    emailSend.mockRejectedValueOnce(new Error("boom"));
    render(<Contact />);

    await userEvent.type(screen.getByLabelText(/Your Name/i), "Alice");
    await userEvent.type(screen.getByLabelText(/Your Email/i), "a@example.com");
    await userEvent.type(
      screen.getByLabelText(/Your Message/i),
      "Hello there!"
    );

    const submit = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submit);

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
