import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ContributionCard from "./ContributionCard";
import { ProjectService } from "../../utils/ProjectService";
import { Project } from "../../utils/types";

// Mock Project
const mockProject: Project = {
  id: "1",
  name: "Test Project",
  projectStructure: [],
  isPublic: true,
  titleCommunityPage: "Community Title",
  category: "Computer Science",
  typeOfDocument: "Bachelor Thesis",
  tags: [],
  username: "TestUser",
  authorName: "TestUser",
};

vi.spyOn(ProjectService, "getProjectById").mockResolvedValue(mockProject);
vi.spyOn(ProjectService, "updateProject").mockResolvedValue({});

const renderWithRouter = (projectId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <Routes>
        <Route path="/projects/:projectId" element={<ContributionCard />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ContributionCard", () => {
  test("renders loading initially", () => {
    renderWithRouter("1");
    expect(screen.getByText(/Loading project/i)).toBeInTheDocument();
  });

  test("renders project fields after load", async () => {
    renderWithRouter("1");

    // Warte, bis das Community Title Input sichtbar ist
    const titleInput =
      await screen.findByPlaceholderText(/Community Page Title/i);
    expect(titleInput).toBeInTheDocument();

    expect(screen.getByDisplayValue("Community Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Computer Science")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bachelor Thesis")).toBeInTheDocument();
  });

  test("add and remove tags", async () => {
    const user = userEvent.setup();
    renderWithRouter("1");

    // Warte auf das Tag-Input
    const input = await screen.findByPlaceholderText("Add Tag");
    await user.type(input, "newTag");

    const addBtn = screen.getByText("Add");
    await user.click(addBtn);

    // Prüfe, ob Tag hinzugefügt wurde
    expect(screen.getByText("newTag")).toBeInTheDocument();

    // Entferne Tag
    const removeButtons = screen.getAllByText("✕", { selector: "button" });
    await user.click(removeButtons[0]);
    expect(screen.queryByText("newTag")).not.toBeInTheDocument();
  });

  test("save button calls updateProject", async () => {
    const user = userEvent.setup();
    renderWithRouter("1");

    const titleInput =
      await screen.findByPlaceholderText(/Community Page Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");

    const saveButton = screen.getByText(/Update Project/i);
    await user.click(saveButton);

    await waitFor(() => {
      expect(ProjectService.updateProject).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          titleCommunityPage: "Updated Title",
        }),
      );
    });
  });

  test("toggles visibility between public and private", async () => {
    renderWithRouter("1");
    await screen.findByPlaceholderText(/Community Page Title/i);

    // Finde das Public/Private Label
    const publicState = screen
      .getAllByText("Public")
      .find((node) => node.className.includes("font-medium"))!;
    const label = publicState.closest("label")!;
    const toggleDiv = label.querySelector(".w-16") as HTMLElement;

    // Sollte "Public" starten
    expect(publicState).toHaveTextContent("Public");

    // Toggle klicken
    toggleDiv.click();

    // Jetzt warten, bis sich der Text auf "Private" geändert hat!
    await waitFor(() => {
      const privateState = screen
        .getAllByText("Private")
        .find((node) => node.className.includes("font-medium"));
      expect(privateState).toBeTruthy();
      expect(privateState).toHaveTextContent("Private");
    });
  });

  test("save button is enabled when changes are valid", async () => {
    const user = userEvent.setup();
    renderWithRouter("1");
    const titleInput =
      await screen.findByPlaceholderText(/Community Page Title/i);

    await user.clear(titleInput);
    await user.type(titleInput, "Changed Title");
    const saveButton = screen.getByText(/Update Project/i);
    expect(saveButton.closest("div")).not.toHaveClass("opacity-40");
  });

  test("anonymous checkbox updates authorName", async () => {
    const user = userEvent.setup();
    renderWithRouter("1");

    const checkbox = await screen.findByLabelText(/Post as Anonymous/i);
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    // Save and check call
    const saveButton = screen.getByText(/Update Project/i);
    await user.click(saveButton);
    await waitFor(() => {
      expect(ProjectService.updateProject).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ authorName: "Anonymous" }),
      );
    });
  });
  test("save button is disabled when no changes", async () => {
    const spyUpdate = vi.spyOn(ProjectService, "updateProject");

    renderWithRouter("1");
    const saveButton = await screen.findByText(/Update Project/i);
    let container = saveButton.parentElement;
    while (
      container &&
      !container.classList.contains("opacity-40") &&
      container !== document.body
    ) {
      container = container.parentElement;
    }
    expect(container).toHaveClass("opacity-40");

    // Versuche, ob der Button klickbar ist (keine pointer-events-none Klasse)
    const isClickable = !container?.classList.contains("pointer-events-none");
    if (isClickable) {
      saveButton.click();
    }

    // Es sollte kein Update-Aufruf stattfinden
    expect(spyUpdate).not.toHaveBeenCalled();

    spyUpdate.mockRestore();
  });

  test("does not add empty tag", async () => {
    const user = userEvent.setup();
    renderWithRouter("1");

    // Tags zählen vor Add-Versuch anhand spezifischer Klasse im Container (z.B. bg-purple-200)
    const tagsBefore = screen.queryAllByText((content, element) => {
      return (
        !!element &&
        element.classList &&
        element.classList.contains("text-purple-800")
      );
    });

    const input = await screen.findByPlaceholderText("Add Tag");
    await user.clear(input);

    const addBtn = screen.getByText("Add");
    await user.click(addBtn);

    // Tags zählen nach Add-Versuch
    const tagsAfter = screen.queryAllByText((content, element) => {
      return (
        !!element &&
        element.classList &&
        element.classList.contains("text-purple-800")
      );
    });

    expect(tagsAfter.length).toBe(tagsBefore.length);
  });
});
