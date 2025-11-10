import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ContributionCard from "./ContributionCard";
import { ProjectService } from "../../utils/ProjectService";
import { Project } from "../../utils/types";

// Mock Project
const mockProject: Project = {
  _id: "1",
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
vi.spyOn(ProjectService, "updateProject").mockResolvedValue({
  _id: "1",
  name: "Test",
  username: "alice",
  projectStructure: [],
  isPublic: true,
});

const renderWithRouter = (projectId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <Routes>
        <Route path="/projects/:projectId" element={<ContributionCard />} />
      </Routes>
    </MemoryRouter>
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
        })
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
        expect.objectContaining({ authorName: "Anonymous" })
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
    const tagsBefore = screen.queryAllByText((_, element) => {
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
    const tagsAfter = screen.queryAllByText((_, element) => {
      return (
        !!element &&
        element.classList &&
        element.classList.contains("text-purple-800")
      );
    });

    expect(tagsAfter.length).toBe(tagsBefore.length);
  });

  test("initially private -> toggle to public shows 'Publish Project' and allows publishing when valid", async () => {
    const user = userEvent.setup();

    // 1) Make getProjectById return a project that is initially private (isPublic: false)
    const privateProject: Project = {
      _id: "2",
      name: "Private Project",
      projectStructure: [],
      isPublic: false,
      titleCommunityPage: "", // empty so publishing requires filling
      category: "",
      typeOfDocument: "",
      tags: [],
      username: "bob",
      authorName: "bob",
    };
    vi.spyOn(ProjectService, "getProjectById").mockResolvedValueOnce(
      privateProject
    );

    // ensure updateProject spy exists
    const updateSpy = vi
      .spyOn(ProjectService, "updateProject")
      .mockResolvedValue({
        ...privateProject,
        isPublic: true,
      });

    renderWithRouter("2");

    // wait for component to load (there won't be Community Title input yet because private)
    await waitFor(() => {
      expect(screen.getByText(/Visibility:/i)).toBeInTheDocument();
    });

    // Toggle to public
    const label = screen.getByText("Visibility:").closest("label")!;
    const toggleDiv = label.querySelector(".w-16") as HTMLElement;
    toggleDiv.click();

    // Now the public form fields should render
    const titleInput =
      await screen.findByPlaceholderText(/Community Page Title/i);

    // Fill required fields to make form valid (category, typeOfDocument, title, tags)
    await user.type(titleInput, "Community Title for Publish");

    // --- FIX: get both comboboxes and pick explicitly ---
    const comboboxes = screen.getAllByRole("combobox") as HTMLSelectElement[];
    // defensive check (helps debugging if markup changes)
    expect(comboboxes.length).toBeGreaterThanOrEqual(2);

    const categorySelect = comboboxes[0];
    const docTypeSelect = comboboxes[comboboxes.length - 1]; // the second select is the doc type

    // choose a category option (exists in the DOM)
    await user.selectOptions(categorySelect, "Computer Science");
    await user.selectOptions(docTypeSelect, "Bachelor Thesis");

    // Add a tag
    const tagInput = screen.getByPlaceholderText("Add Tag");
    await user.type(tagInput, "tag1");
    await user.click(screen.getByText("Add"));

    // Now Publish button should appear (since initialIsPublic was false and now true)
    const publishBtn = await screen.findByText(/Publish Project/i);
    expect(publishBtn).toBeInTheDocument();

    // Click publish (the visible span is inside the clickable motion.div)
    await user.click(publishBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        "2",
        expect.objectContaining({
          titleCommunityPage: "Community Title for Publish",
          isPublic: true,
        })
      );
    });

    updateSpy.mockRestore();
  });

  test("initially public -> toggle to private shows 'Hide Project' and allows hiding", async () => {
    const user = userEvent.setup();

    // start from project that is public
    const pubProject: Project = {
      _id: "3",
      name: "Pub Project",
      projectStructure: [],
      isPublic: true,
      titleCommunityPage: "T",
      category: "Computer Science",
      typeOfDocument: "Bachelor Thesis",
      tags: ["t"],
      username: "sam",
      authorName: "sam",
    };
    vi.spyOn(ProjectService, "getProjectById").mockResolvedValueOnce(
      pubProject
    );
    const updateSpy = vi
      .spyOn(ProjectService, "updateProject")
      .mockResolvedValue({
        ...pubProject,
        isPublic: false,
      });

    renderWithRouter("3");

    // wait for inputs
    await screen.findByPlaceholderText(/Community Page Title/i);

    // Toggle to private
    const label = screen.getByText("Visibility:").closest("label")!;
    const toggleDiv = label.querySelector(".w-16") as HTMLElement;
    toggleDiv.click();

    // Expect Hide Project button to show up
    const hideBtn = await screen.findByText(/Hide Project/i);
    expect(hideBtn).toBeInTheDocument();

    // Click hide
    await user.click(hideBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        "3",
        expect.objectContaining({
          isPublic: false,
        })
      );
    });

    updateSpy.mockRestore();
  });

  test("stays private and no action button rendered when initial private and not changed", async () => {
    const project: Project = {
      _id: "4",
      name: "Remain Private",
      projectStructure: [],
      isPublic: false,
      titleCommunityPage: "",
      category: "",
      typeOfDocument: "",
      tags: [],
      username: "z",
      authorName: "z",
    };
    vi.spyOn(ProjectService, "getProjectById").mockResolvedValueOnce(project);

    renderWithRouter("4");

    // wait for the component to load
    await waitFor(() => {
      expect(screen.getByText(/Visibility:/i)).toBeInTheDocument();
    });

    // since it's private and hasn't been toggled there should be no action button
    expect(screen.queryByText(/Publish Project/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hide Project/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Update Project/i)).not.toBeInTheDocument();
  });

  test("loading error from ProjectService.getProjectById logs error and keeps loading state", async () => {
    const err = new Error("network");
    const spyErr = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(ProjectService, "getProjectById").mockRejectedValueOnce(err);

    renderWithRouter("5");

    // After rejection the component still shows Loading project... (project remains null)
    const loading = await screen.findByText(/Loading project/i);
    expect(loading).toBeInTheDocument();
    expect(spyErr).toHaveBeenCalled();

    spyErr.mockRestore();
  });

  test("invalid projectStructure logs error and stays loading", async () => {
    const badProject: any = {
      _id: "6",
      name: "Bad",
      projectStructure: "not-an-array-or-object",
      isPublic: true,
      titleCommunityPage: "T",
      category: "Computer Science",
      typeOfDocument: "Bachelor Thesis",
      tags: ["a"],
      username: "u",
      authorName: "u",
    };
    const spyErr = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(ProjectService, "getProjectById").mockResolvedValueOnce(
      badProject
    );

    renderWithRouter("6");

    // Since projectStructure invalid, component logs error and should not set project -> still loading
    const loading = await screen.findByText(/Loading project/i);
    expect(loading).toBeInTheDocument();
    expect(spyErr).toHaveBeenCalledWith("Project structure is not valid!");

    spyErr.mockRestore();
  });

  test("when form is invalid for update (initial public) -> Update Project button is disabled", async () => {
    const user = userEvent.setup();

    // project initially public with valid fields
    const p: Project = {
      _id: "7",
      name: "P7",
      projectStructure: [],
      isPublic: true,
      titleCommunityPage: "Title",
      category: "Computer Science",
      typeOfDocument: "Bachelor Thesis",
      tags: ["a"],
      username: "usr",
      authorName: "usr",
    };
    vi.spyOn(ProjectService, "getProjectById").mockResolvedValueOnce(p);
    const updateSpy = vi
      .spyOn(ProjectService, "updateProject")
      .mockResolvedValue(p);

    renderWithRouter("7");

    // wait for inputs
    const titleInput =
      await screen.findByPlaceholderText(/Community Page Title/i);

    // make form invalid for update: remove title and tags (Update Project should then be disabled)
    await user.clear(titleInput);
    // remove existing tag by clicking ✕
    const removeButtons = await screen.findAllByText("✕", {
      selector: "button",
    });
    if (removeButtons.length) {
      await user.click(removeButtons[0]);
    }
    // Finde das sichtbare "Update Project" Text-Element (ist ein span/div, kein <button>)
    const updateBtn = await screen.findByText(/Update Project/i);

    // climb DOM to container that has possible opacity class
    let container: HTMLElement | null = updateBtn.closest("div");

    // Falls .closest("div") nichts ergibt, fallback auf parentElement
    if (!container) container = updateBtn.parentElement as HTMLElement | null;

    while (
      container &&
      !container.classList.contains("opacity-40") &&
      container !== document.body
    ) {
      container = container.parentElement as HTMLElement | null;
    }

    expect(container).toHaveClass("opacity-40");
    expect(updateSpy).not.toHaveBeenCalled();

    updateSpy.mockRestore();
  });
});
