// src/__tests__/HelloApp.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import axios from "axios";
import HelloApp from "../components/HelloApp";

// Axios mocken
vi.mock("axios");
const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe("HelloApp", () => {
  beforeEach(() => {
    mockedAxios.get = vi.fn();
    mockedAxios.post = vi.fn();
  });

  it("zeigt Pflanzen aus der API an", async () => {
    const mockPlants = [
      { _id: "1", name: "Aloe Vera", type: "Sukkulente" },
      { _id: "2", name: "Basilikum", type: "Kräuter" },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockPlants });

    render(<HelloApp />);

    for (const plant of mockPlants) {
      await waitFor(() => {
        expect(
          screen.getByText(`${plant.name} (${plant.type})`),
        ).toBeInTheDocument();
      });
    }
  });

  it("fügt eine neue Pflanze hinzu", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: [] }) // beim ersten Laden: keine Pflanzen
      .mockResolvedValueOnce({
        data: [{ _id: "123", name: "Tomate", type: "Gemüse" }],
      }); // nach POST

    mockedAxios.post.mockResolvedValueOnce({});

    render(<HelloApp />);

    // Felder ausfüllen
    fireEvent.change(screen.getByPlaceholderText("Pflanzenname"), {
      target: { value: "Tomate" },
    });
    fireEvent.change(screen.getByPlaceholderText("Pflanzentyp"), {
      target: { value: "Gemüse" },
    });

    // Button klicken
    fireEvent.click(
      screen.getByRole("button", { name: /pflanze hinzufügen/i }),
    );

    // Neue Pflanze sichtbar?
    await waitFor(() => {
      expect(screen.getByText("Tomate (Gemüse)")).toBeInTheDocument();
    });
  });
});
