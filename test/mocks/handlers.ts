// test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/todos", () => {
    return HttpResponse.json([{ id: 1, text: "Lern Vitest" }]);
  }),

  // Mock for the new DOCX export service
  http.post("http://localhost:5001/api/export/word", () => {
    const blob = new Blob(["Mocked DOCX content"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    return new HttpResponse(blob); 
    }),
];
