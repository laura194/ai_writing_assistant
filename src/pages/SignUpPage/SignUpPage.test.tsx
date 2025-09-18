import { render, screen } from "../../../test/renderWithProviders";
import { vi } from "vitest";
import SignUpPage from "./SignUpPage";

vi.mock("@clerk/clerk-react", () => ({
  SignUp: (p: any) => <div data-testid="sign-up" {...p} />,
}));
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => (props: any) => <div {...props} /> }),
}));
vi.mock("../../assets/images/sign-up-animate.svg?react", () => ({
  default: () => <svg data-testid="signup-anim" />,
}));

describe("SignUpPage", () => {
  test("renders headings, animation and SignUp component", () => {
    render(<SignUpPage />);

    expect(screen.getByText(/Let's Get Started!/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up To Continue/i)).toBeInTheDocument();

    expect(screen.getByTestId("signup-anim")).toBeInTheDocument();
    expect(screen.getByTestId("sign-up")).toBeInTheDocument();

    const comp = screen.getByTestId("sign-up");
    expect(comp.getAttribute("path")).toBe("/signUp");
  });
});
