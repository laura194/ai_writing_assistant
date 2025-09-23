import { render, screen } from "../../../test/renderWithProviders";
import { vi } from "vitest";
import SignInPage from "./SignInPage";

vi.mock("@clerk/clerk-react", () => ({
  SignIn: (p: any) => <div data-testid="sign-in" {...p} />,
}));
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => (props: any) => <div {...props} /> }),
}));
vi.mock("../../assets/images/sign-in-animate.svg?react", () => ({
  default: () => <svg data-testid="signin-anim" />,
}));

describe("SignInPage", () => {
  test("renders headings, animation and SignIn component", () => {
    render(<SignInPage />);

    expect(screen.getByText(/Welcome Back!/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In to Continue/i)).toBeInTheDocument();

    expect(screen.getByTestId("signin-anim")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in")).toBeInTheDocument();

    // Ensure appearance props are passed
    const sign = screen.getByTestId("sign-in");
    expect(sign.getAttribute("path")).toBe("/signIn");
  });
});
