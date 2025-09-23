// test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/todos", () => {
    return HttpResponse.json([{ id: 1, text: "Lern Vitest" }]);
  }),
];
