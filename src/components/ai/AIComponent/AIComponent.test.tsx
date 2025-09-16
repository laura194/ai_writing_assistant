import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AIComponent from "./AIComponent";
import { vi } from "vitest";
import { ThemeProvider } from "../../../providers/ThemeProvider";

// --- Mocks ---
vi.mock("framer-motion", async () => {
  const ReactPkg = await import("react");
  return {
    motion: {
      button: (props: any) => {
        const ref = ReactPkg.useRef<HTMLButtonElement>(null);
        ReactPkg.useEffect(() => {
          (ref.current as any).mockedProps = props;
        }, [props]);
        return ReactPkg.createElement("button", { ...props, ref });
      },
      div: (props: any) => {
        const { layoutId, children, ...rest } = props || {};
        const attrs = layoutId ? { "data-layout-id": layoutId } : {};
        return ReactPkg.createElement("div", { ...attrs, ...rest }, children);
      },
    },
  };
});

vi.mock("../../../utils/AIHandler", () => ({
  fetchAIResponse: vi.fn(async (txt: string) => ({
    text: `AI Response for: ${txt}`,
    modelVersion: "mock-v1",
  })),
  createAIProtocolEntry: vi.fn(),
}));

// --- Helper ---
function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("AIComponent Unit Tests", () => {
  const mockOnClose = vi.fn();
  const mockOnReplace = vi.fn();
  const mockOnAppend = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders only when open", () => {
    const { rerender } = renderWithTheme(
      <AIComponent
        selectedText="Hello"
        nodeName="File1"
        isOpen={false}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );
    expect(screen.queryByText("AI Assistant")).not.toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <AIComponent
          selectedText="Hello"
          nodeName="File1"
          isOpen={true}
          onClose={mockOnClose}
          onReplace={mockOnReplace}
          onAppend={mockOnAppend}
        />
      </ThemeProvider>
    );
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
  });

  test("closes on X button click", async () => {
    renderWithTheme(
      <AIComponent
        selectedText="Hello"
        nodeName="File1"
        isOpen={true}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );
    await user.click(screen.getByRole("button", { name: "" })); // X button
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("suggestion menu toggles and selects suggestion", async () => {
    renderWithTheme(
      <AIComponent
        selectedText="Hello"
        nodeName="File1"
        isOpen={true}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );

    const toggleBtn = screen.getByTitle("Show suggestions");
    await user.click(toggleBtn);

    const suggestionText = "Make this passage more concise.";
    // suggestion button present
    expect(screen.getByText(suggestionText)).toBeInTheDocument();

    // click suggestion -> should populate textarea and close menu
    await user.click(screen.getByText(suggestionText));

    // MENU should be gone (use testid, not queryByText)
    expect(screen.queryByTestId("suggestions-menu")).not.toBeInTheDocument();

    // textarea should now contain the suggestion text
    expect(
      screen.getByPlaceholderText(/Note: This AI has no memory/i)
    ).toHaveValue(suggestionText);
  });

  test("fetches AI response with first prompt", async () => {
    const { fetchAIResponse } = await import("../../../utils/AIHandler");

    renderWithTheme(
      <AIComponent
        selectedText="Hello"
        nodeName="File1"
        isOpen={true}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Note: This AI has no memory/i
    );
    await user.type(textarea, "First Prompt");

    await user.click(screen.getByTitle("Ask AI"));

    const expected = `Hello First Prompt`;
    await waitFor(() => {
      expect(fetchAIResponse).toHaveBeenCalledWith(expected);
      expect(screen.getByText(/AI Response for:/)).toBeInTheDocument();
    });
  });

  test("handles follow-up after first response", async () => {
    const { fetchAIResponse } = await import("../../../utils/AIHandler");

    renderWithTheme(
      <AIComponent
        selectedText="Start"
        nodeName="File1"
        isOpen={true}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );

    // First Prompt
    let textarea = screen.getByPlaceholderText(/Note: This AI has no memory/i);
    await user.type(textarea, "Prompt1");
    await user.click(screen.getByTitle("Ask AI"));

    // wait for the response to appear (component will update and remount textarea)
    await waitFor(() => screen.getByText(/AI Response for:/));

    // Re-query the textarea AFTER the update so we have the current DOM node
    textarea = screen.getByPlaceholderText(/Note: This AI has no memory/i);

    // Focus/clear/type to simulate follow-up prompt
    await user.click(textarea);
    await user.clear(textarea);
    await user.type(textarea, "Prompt2");
    await user.click(screen.getByTitle("Ask AI"));

    await waitFor(() =>
      expect(fetchAIResponse).toHaveBeenLastCalledWith(
        expect.stringContaining("Prompt2")
      )
    );
  });

  test("replace and append buttons work", async () => {
    const { createAIProtocolEntry } = await import("../../../utils/AIHandler");

    renderWithTheme(
      <AIComponent
        selectedText="Original"
        nodeName="Node1"
        isOpen={true}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Note: This AI has no memory/i
    );
    await user.type(textarea, "Test Prompt");
    await user.click(screen.getByTitle("Ask AI"));

    await waitFor(() => screen.getByText(/AI Response for:/));

    const replaceBtn = screen.getByTitle("Replace with this text");
    const appendBtn = screen.getByTitle("Append this text");

    await user.click(replaceBtn);
    expect(mockOnReplace).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(createAIProtocolEntry).toHaveBeenCalledTimes(1);

    await user.click(appendBtn);
    expect(mockOnAppend).toHaveBeenCalledTimes(1);
  });

  test("does nothing when no prompt entered", async () => {
    const { fetchAIResponse } = await import("../../../utils/AIHandler");

    renderWithTheme(
      <AIComponent
        selectedText="Text"
        nodeName="Node1"
        isOpen={true}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );

    await user.click(screen.getByTitle("Ask AI"));
    await waitFor(() => expect(fetchAIResponse).not.toHaveBeenCalled());
  });

  test("applies dark boxShadow when theme is dark", async () => {
    const themeModule = await import("../../../providers/ThemeProvider");

    const fakeTheme = {
      theme: "dark",
      setTheme: () => {},
      toggleTheme: () => {},
    };
    vi.spyOn(themeModule, "useTheme").mockReturnValue(fakeTheme as any);

    try {
      renderWithTheme(
        <AIComponent
          selectedText="Hello"
          nodeName="File1"
          isOpen={true}
          onClose={mockOnClose}
          onReplace={mockOnReplace}
          onAppend={mockOnAppend}
        />
      );

      const el = document.querySelector(
        '[style*="0 0 20px rgba(120,69,239,0.55)"]'
      );
      expect(el).toBeTruthy();
    } finally {
      (themeModule.useTheme as any).mockRestore?.();
      vi.restoreAllMocks();
    }
  });

  test("createAIProtocolEntry uses fallback values when fields are missing", async () => {
    const aiModule = await import("../../../utils/AIHandler");

    const fetchSpy = vi
      .spyOn(aiModule, "fetchAIResponse")
      .mockResolvedValueOnce({ text: "", modelVersion: "" } as any);

    const createSpy = vi.spyOn(aiModule, "createAIProtocolEntry");

    renderWithTheme(
      <AIComponent
        selectedText="" // empty selectedText ok
        nodeName={""} // forces fallback to "Unknown file"
        isOpen={true}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Note: This AI has no memory/i
    );
    await user.type(textarea, "SomePrompt");
    await user.click(screen.getByTitle("Ask AI"));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const replaceBtn = await screen.findByTitle("Replace with this text");
    await user.click(replaceBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
      const lastCallArg =
        createSpy.mock.calls[createSpy.mock.calls.length - 1][0];

      expect(lastCallArg.aiName).toBe("Unknown AI");
      expect(lastCallArg.usageForm).toEqual(
        expect.stringContaining("Replace: SomePrompt")
      );
      expect(lastCallArg.affectedParts).toBe("Unknown file");
      expect(lastCallArg.remarks).toBe("No remarks");
      expect(lastCallArg.projectId).toBe("unknown-project");
    });

    fetchSpy.mockRestore();
    createSpy.mockRestore();
  });

  test("handleFollowUp returns early when additionalPrompt is empty (no extra fetch)", async () => {
    const aiModule = await import("../../../utils/AIHandler");
    const fetchSpy = vi.spyOn(aiModule, "fetchAIResponse");
    // initial fetch behaviour already mocked globally; we just want to count calls

    renderWithTheme(
      <AIComponent
        selectedText="Start"
        nodeName="File1"
        isOpen={true}
        onClose={mockOnClose}
        onReplace={mockOnReplace}
        onAppend={mockOnAppend}
      />
    );

    // send first prompt -> populate history
    let textarea = screen.getByPlaceholderText(/Note: This AI has no memory/i);
    await userEvent.type(textarea, "Prompt1");
    await userEvent.click(screen.getByTitle("Ask AI"));
    await waitFor(() => screen.getByText(/AI Response for:/));
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // At this point additionalPrompt is cleared by the component (""), so clicking Ask AI again
    // should invoke handleFollowUp but early-return because additionalPrompt.trim() === ""
    // Re-query textarea to ensure latest node (component may have remounted it)
    textarea = screen.getByPlaceholderText(/Note: This AI has no memory/i);

    // Do NOT type anything into textarea (leave additionalPrompt empty)
    await userEvent.click(screen.getByTitle("Ask AI")); // triggers handleFollowUp path
    // Wait a tick and assert no new fetch happened
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1); // still only the initial call
    });

    fetchSpy.mockRestore();
  });

  test("replace button has correct whileHover props for light theme", async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <AIComponent
        selectedText="Hello"
        nodeName="File1"
        isOpen={true}
        onClose={vi.fn()}
        onReplace={vi.fn()}
        onAppend={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Note: This AI has no memory/i
    );
    await user.type(textarea, "Shadow test");
    await user.click(screen.getByTitle("Ask AI"));
    await screen.findByText(/AI Response for:/);

    const replaceBtn = screen.getByTitle("Replace with this text");

    // Zugriff auf die gemockten Props
    expect((replaceBtn as any).mockedProps.whileHover).toEqual(
      expect.objectContaining({
        scale: 1.1,
        boxShadow: "0 0 12px rgba(120,69,239,0.6)",
      })
    );
  });

  test("replace button has correct whileHover props for dark theme", async () => {
    const user = userEvent.setup();
    const themeModule = await import("../../../providers/ThemeProvider");
    vi.spyOn(themeModule, "useTheme").mockReturnValue({
      theme: "dark",
      setTheme: () => {},
      toggleTheme: () => {},
    } as any);

    renderWithTheme(
      <AIComponent
        selectedText="Hello"
        nodeName="File1"
        isOpen={true}
        onClose={vi.fn()}
        onReplace={vi.fn()}
        onAppend={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Note: This AI has no memory/i
    );
    await user.type(textarea, "Shadow test");
    await user.click(screen.getByTitle("Ask AI"));
    await screen.findByText(/AI Response for:/);

    const replaceBtn = screen.getByTitle("Replace with this text");

    expect((replaceBtn as any).mockedProps.whileHover).toEqual(
      expect.objectContaining({
        scale: 1.1,
        boxShadow: "0 0 16px rgba(120,69,239,0.3)",
      })
    );
  });
});
