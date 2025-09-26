import { render, screen, fireEvent } from "@testing-library/react";
import { FAQDropdown } from "./FAQDropdown";

describe("FAQDropdown component", () => {
  test("renders FAQ button and dropdown structure", () => {
    render(<FAQDropdown />);

    // Button
    const faqButton = screen.getByText("FAQ");
    expect(faqButton).toBeInTheDocument();

    // Dropdown container (hidden initially, using peer-hover classes)
    const dropdown = screen
      .getByText("Frequently Asked Questions")
      .closest("div");
    expect(dropdown).toBeInTheDocument();
  });

  test("renders all FAQ questions", () => {
    render(<FAQDropdown />);

    const questions = [
      "What is this application?",
      "How does AI support writing?",
      "How does editing work?",
      "Which AI am I using?",
      "How are projects managed?",
      "Which export formats are supported?",
      "What is the community page?",
    ];

    questions.forEach((q) => {
      expect(screen.getByText(q)).toBeInTheDocument();
    });
  });

  test("toggles FAQ answer on question click", () => {
    render(<FAQDropdown />);

    const questionButton = screen.getByText("What is this application?");

    // Initially, answer should not be visible
    expect(
      screen.queryByText(/A web app that helps students/i),
    ).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(questionButton);
    expect(
      screen.getByText(/A web app that helps students/i),
    ).toBeInTheDocument();

    // Click again to close
    fireEvent.click(questionButton);
    expect(
      screen.queryByText(/A web app that helps students/i),
    ).not.toBeInTheDocument();
  });

  test("only shows one answer at a time", () => {
    render(<FAQDropdown />);

    const q1 = screen.getByText("What is this application?");
    const q2 = screen.getByText("How does AI support writing?");

    fireEvent.click(q1);
    expect(
      screen.getByText(/A web app that helps students/i),
    ).toBeInTheDocument();

    fireEvent.click(q2);
    // First answer should be hidden
    expect(
      screen.queryByText(/A web app that helps students/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/It assists with structuring arguments/i),
    ).toBeInTheDocument();
  });
});
