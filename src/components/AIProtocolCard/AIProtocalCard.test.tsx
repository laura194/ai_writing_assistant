import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, beforeEach, expect } from "vitest";

// --- axios mock (shared) ---
const AXIOS_GET = vi.fn();
vi.mock("axios", () => ({
  default: {
    get: (...args: any[]) => AXIOS_GET(...args),
  },
}));

// --- react-router-dom mock with setter for projectId ---
vi.mock("react-router-dom", async () => {
  let _projectId: string | undefined = undefined;
  return {
    useParams: () => (_projectId ? { projectId: _projectId } : ({} as any)),
    __setProjectId: (p: string | undefined) => {
      _projectId = p;
    },
  };
});

import AIProtocolCard from "./AIProtocolCard";

describe("AIProtocolCard", () => {
  // helper to set projectId in the mock
  const setProjectId = async (p: string | undefined) => {
    // dynamic import of mocked module to access setter
    const routerMock = await import("react-router-dom");
    (routerMock as any).__setProjectId(p);
  };

  beforeEach(async () => {
    AXIOS_GET.mockReset();
    vi.clearAllMocks();
    // reset projectId to undefined by default
    await setProjectId(undefined);
  });

  it("shows error when projectId is missing", async () => {
    await setProjectId(undefined);
    render(<AIProtocolCard />);

    await waitFor(() => {
      expect(screen.getByText(/Project ID is required\./i)).toBeInTheDocument();
    });
  });

  it("fetches protocols and shows 'No entries' when API returns empty array", async () => {
    await setProjectId("proj-1");
    AXIOS_GET.mockResolvedValueOnce({ data: [] });

    render(<AIProtocolCard />);

    // Loading shown initially
    expect(screen.getByText(/Loading Protocols\.\.\./i)).toBeInTheDocument();

    // Wait for fetch to finish and "No entries" message to appear
    await waitFor(() => {
      expect(
        screen.getByText(
          /No entries have been created in the AI protocol yet\./i
        )
      ).toBeInTheDocument();
    });

    // axios called with expected URL & params
    expect(AXIOS_GET).toHaveBeenCalledTimes(1);
    const [url, opts] = AXIOS_GET.mock.calls[0];
    expect(url).toBe("/api/ai/aiProtocol");
    expect(opts).toMatchObject({ params: { projectId: "proj-1" } });
  });

  it("renders table rows for protocols and truncates long fields; shows formatted dates and N/A when missing", async () => {
    await setProjectId("proj-2");

    const longName = "A".repeat(120);
    const usage = "Replace: Something small";
    const affected = "Some big affected section";
    const remarks = "These are the remarks for the protocol entry";
    const createdAtISO = new Date("2023-01-10T12:34:00Z").toISOString();

    const protocols = [
      {
        _id: "1",
        aiName: longName,
        usageForm: usage,
        affectedParts: affected,
        remarks,
        createdAt: createdAtISO,
        updatedAt: createdAtISO,
      },
      {
        _id: "2",
        aiName: "Short Name",
        usageForm: "Some usage",
        affectedParts: "Parts",
        remarks: "No dates here",
        createdAt: undefined,
        updatedAt: undefined,
      },
    ];

    AXIOS_GET.mockResolvedValueOnce({ data: protocols });

    render(<AIProtocolCard />);

    await waitFor(() => {
      // truncated long name
      const truncated = longName.slice(0, 100) + "...";
      expect(screen.getByText(truncated)).toBeInTheDocument();

      // other fields present
      expect(screen.getByText(/Replace: Something small/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Some big affected section/i)
      ).toBeInTheDocument();

      // createdAt formatting: check substring contains month or year
      const anyDateNode = screen.getAllByText((content) =>
        /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|2023/.test(content)
      );
      expect(anyDateNode.length).toBeGreaterThan(0);

      // rows with missing dates show N/A
      expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("filters protocols based on input (search works across fields)", async () => {
    await setProjectId("proj-3");

    const protocols = [
      {
        _id: "a",
        aiName: "ModelX",
        usageForm: "Replace: Alpha",
        affectedParts: "File A",
        remarks: "First entry",
        createdAt: new Date("2023-02-01T10:00:00Z").toISOString(),
        updatedAt: new Date("2023-02-01T11:00:00Z").toISOString(),
      },
      {
        _id: "b",
        aiName: "OtherModel",
        usageForm: "Append: Beta",
        affectedParts: "File B",
        remarks: "Second entry",
        createdAt: new Date("2023-03-05T09:00:00Z").toISOString(),
        updatedAt: new Date("2023-03-05T09:10:00Z").toISOString(),
      },
    ];

    AXIOS_GET.mockResolvedValueOnce({ data: protocols });

    const user = userEvent.setup();
    render(<AIProtocolCard />);

    // Wait until both rows are present
    await waitFor(() => {
      expect(screen.getByText("ModelX")).toBeInTheDocument();
      expect(screen.getByText("OtherModel")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(
      /Filter the protocol by typing a keyword/i
    );

    // filter by aiName "ModelX"
    await user.type(input, "ModelX");
    await waitFor(() => {
      expect(screen.getByText("ModelX")).toBeInTheDocument();
      expect(screen.queryByText("OtherModel")).not.toBeInTheDocument();
    });

    // Clear and search by date substring (e.g., "Mar" for March)
    await user.clear(input);
    await user.type(input, "Mar");
    await waitFor(() => {
      expect(screen.getByText("OtherModel")).toBeInTheDocument();
      expect(screen.queryByText("ModelX")).not.toBeInTheDocument();
    });
  });

  it("shows error message when axios.get throws", async () => {
    await setProjectId("proj-4");

    AXIOS_GET.mockRejectedValueOnce(new Error("Network failed"));

    render(<AIProtocolCard />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error while fetching protocols\./i)
      ).toBeInTheDocument();
    });
  });

  // ===== Additional mutation-sensitive tests =====

  it("does NOT add ellipsis for exactly 100-char aiName", async () => {
    await setProjectId("proj-100");

    const name100 = "B".repeat(100); // exactly 100 chars
    AXIOS_GET.mockResolvedValueOnce({
      data: [
        {
          _id: "100",
          aiName: name100,
          usageForm: "Usage",
          affectedParts: "Parts",
          remarks: "Remarks",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    render(<AIProtocolCard />);

    // wait and assert the exact 100-char string (no "...")
    await waitFor(() => {
      expect(screen.getByText(name100)).toBeInTheDocument();
      expect(screen.queryByText(name100 + "...")).not.toBeInTheDocument();
    });
  });

  it("adds ellipsis for aiName longer than 100 chars", async () => {
    await setProjectId("proj-101");

    const name101 = "C".repeat(101); // 101 chars -> should be truncated + "..."
    AXIOS_GET.mockResolvedValueOnce({
      data: [
        {
          _id: "101",
          aiName: name101,
          usageForm: "Usage",
          affectedParts: "Parts",
          remarks: "Remarks",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    render(<AIProtocolCard />);

    const expectedTruncated = name101.slice(0, 100) + "...";
    await waitFor(() => {
      expect(screen.getByText(expectedTruncated)).toBeInTheDocument();
      // also assert original full name is NOT shown (strict)
      expect(screen.queryByText(name101)).not.toBeInTheDocument();
    });
  });

  it("renders exactly the same number of table rows as protocols returned", async () => {
    await setProjectId("proj-rows");

    const protocols = [
      {
        _id: "r1",
        aiName: "A1",
        usageForm: "U1",
        affectedParts: "P1",
        remarks: "R1",
        createdAt: undefined,
        updatedAt: undefined,
      },
      {
        _id: "r2",
        aiName: "A2",
        usageForm: "U2",
        affectedParts: "P2",
        remarks: "R2",
        createdAt: undefined,
        updatedAt: undefined,
      },
      {
        _id: "r3",
        aiName: "A3",
        usageForm: "U3",
        affectedParts: "P3",
        remarks: "R3",
        createdAt: undefined,
        updatedAt: undefined,
      },
    ];

    AXIOS_GET.mockResolvedValueOnce({ data: protocols });

    const { container } = render(<AIProtocolCard />);

    await waitFor(() => {
      // count <tbody> rows only
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(protocols.length);
      // sanity check: each aiName present
      expect(screen.getByText("A1")).toBeInTheDocument();
      expect(screen.getByText("A2")).toBeInTheDocument();
      expect(screen.getByText("A3")).toBeInTheDocument();
    });
  });

  it("filters by month substring found in createdAt (date formatting is used in search)", async () => {
    await setProjectId("proj-date-filter");

    const createdAtISO = new Date("2023-03-15T09:00:00Z").toISOString();
    const protocols = [
      {
        _id: "d1",
        aiName: "DateModel",
        usageForm: "Use",
        affectedParts: "Parts",
        remarks: "Has date",
        createdAt: createdAtISO,
        updatedAt: createdAtISO,
      },
      {
        _id: "d2",
        aiName: "OtherModel",
        usageForm: "Use2",
        affectedParts: "Parts2",
        remarks: "No match",
        createdAt: new Date("2023-01-01T00:00:00Z").toISOString(),
        updatedAt: new Date("2023-01-01T00:00:00Z").toISOString(),
      },
    ];

    AXIOS_GET.mockResolvedValueOnce({ data: protocols });

    const user = userEvent.setup();
    render(<AIProtocolCard />);

    // Wait until rows are there
    await waitFor(() => {
      expect(screen.getByText("DateModel")).toBeInTheDocument();
      expect(screen.getByText("OtherModel")).toBeInTheDocument();
    });

    // Determine month short name from the createdAt date in en-US
    const monthShort = new Date(createdAtISO)
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase(); // e.g., "Mar"

    const input = screen.getByPlaceholderText(
      /Filter the protocol by typing a keyword/i
    );
    await user.type(input, monthShort);

    // After filtering, DateModel should be visible, OtherModel filtered out
    await waitFor(() => {
      expect(screen.getByText("DateModel")).toBeInTheDocument();
      expect(screen.queryByText("OtherModel")).not.toBeInTheDocument();
    });
  });

  it("clearing the filter restores all rows", async () => {
    await setProjectId("proj-clear-filter");

    const protocols = [
      {
        _id: "c1",
        aiName: "Alpha",
        usageForm: "U1",
        affectedParts: "P1",
        remarks: "R1",
        createdAt: undefined,
        updatedAt: undefined,
      },
      {
        _id: "c2",
        aiName: "Beta",
        usageForm: "U2",
        affectedParts: "P2",
        remarks: "R2",
        createdAt: undefined,
        updatedAt: undefined,
      },
    ];

    AXIOS_GET.mockResolvedValueOnce({ data: protocols });

    const user = userEvent.setup();
    render(<AIProtocolCard />);

    // Wait for both rows
    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.getByText("Beta")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(
      /Filter the protocol by typing a keyword/i
    );
    await user.type(input, "Alpha");

    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    });

    // clear filter
    await user.clear(input);
    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeInTheDocument();
      expect(screen.getByText("Beta")).toBeInTheDocument();
    });
  });
});
