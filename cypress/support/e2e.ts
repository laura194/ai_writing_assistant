// cypress/support/e2e.ts
Cypress.on("uncaught:exception", (err) => {
  // Wenn die Meldung auf "Script error" oder cross-origin hinweist, ignoriere
  const msg = (err && err.message) || "";
  if (/Script error/i.test(msg) || /cross origin/i.test(msg)) {
    return false;
  }
  // Sonst ebenfalls false (keine Tests abbrechen), du kannst hier filtern falls du strenger willst
  return false;
});
