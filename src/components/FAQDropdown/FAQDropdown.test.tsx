import { render, screen, fireEvent } from "@testing-library/react";
import { FAQDropdown } from "./FAQDropdown";

describe("FAQDropdown component", () => {
  test("renders FAQ button and menu hidden initially", () => {
    render(<FAQDropdown />);

    const faqButton = screen.getByText("FAQ");
    expect(faqButton).toBeInTheDocument();

    const header = screen.getByText("Frequently Asked Questions");
    // Prüft, dass Dropdown verborgen ist (pointer-events-none oder opacity-0)
    expect(header.parentElement).toHaveClass("opacity-0");
    expect(header.parentElement).toHaveClass("pointer-events-none");
  });

  test("opens menu when FAQ button clicked and renders all questions", async () => {
    render(<FAQDropdown />);

    const faqButton = screen.getByText("FAQ");
    fireEvent.click(faqButton);

    const header = screen.getByText("Frequently Asked Questions");
    expect(header.parentElement).toHaveClass("opacity-100");
    expect(header.parentElement).toHaveClass("pointer-events-auto");

    const questions = [
      "What is this application?",
      "How does AI support writing?",
      "How does editing work?",
      "Which AI am I using?",
      "How are projects managed?",
      "Which export formats are supported?",
      "What is the community page?",
    ];

    questions.forEach((q) => expect(screen.getByText(q)).toBeInTheDocument());
  });

  test("toggles FAQ answer on question click", () => {
    render(<FAQDropdown />);
    fireEvent.click(screen.getByText("FAQ"));

    const questionButton = screen.getByText("What is this application?");
    expect(
      screen.queryByText(/A web app that helps students/i)
    ).not.toBeInTheDocument();

    fireEvent.click(questionButton);
    expect(
      screen.getByText(/A web app that helps students/i)
    ).toBeInTheDocument();

    fireEvent.click(questionButton);
    expect(
      screen.queryByText(/A web app that helps students/i)
    ).not.toBeInTheDocument();
  });

  test("only shows one answer at a time", () => {
    render(<FAQDropdown />);
    fireEvent.click(screen.getByText("FAQ"));

    const q1 = screen.getByText("What is this application?");
    const q2 = screen.getByText("How does AI support writing?");

    fireEvent.click(q1);
    expect(
      screen.getByText(/A web app that helps students/i)
    ).toBeInTheDocument();

    fireEvent.click(q2);
    expect(
      screen.queryByText(/A web app that helps students/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/It assists with structuring arguments/i)
    ).toBeInTheDocument();
  });

  test("FAQ button toggles the whole menu (open/close) via classes", () => {
    render(<FAQDropdown />);
    const faqButton = screen.getByText("FAQ");
    const dropdown = screen.getByText(
      "Frequently Asked Questions"
    ).parentElement;

    // Open
    fireEvent.click(faqButton);
    expect(dropdown).toHaveClass("opacity-100");
    expect(dropdown).toHaveClass("pointer-events-auto");

    // Close
    fireEvent.click(faqButton);
    expect(dropdown).toHaveClass("opacity-0");
    expect(dropdown).toHaveClass("pointer-events-none");
  });
});
