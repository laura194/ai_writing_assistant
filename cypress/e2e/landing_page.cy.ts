// cypress/e2e/landing_page.cy.ts
/// <reference types="cypress" />

describe("Landing Page E2E", () => {
  beforeEach(() => {
    cy.intercept({ url: "**" }, (req) => {
      // this prints to Cypress runner logs (visible in CI)
      // you can filter by req.url.includes('clerk') etc.
      // eslint-disable-next-line no-console
      console.log("[CYPRESS-REQ]", req.method, req.url);
      req.continue();
    });

    cy.viewport(1280, 720);

    // optional: stub externe 3rd-party requests, reduziert Noise / race conditions
    cy.intercept("GET", "https://prod.spline.design/**", { body: "" });
    cy.intercept("GET", "https://www.gstatic.com/draco/**", { body: "" });
    cy.intercept("GET", "https://novel-mammal-30.clerk.accounts.dev/**", {
      statusCode: 200,
      body: {},
    });

    // visit landing page
    cy.visit("/");
  });

  it("renders the header and hero section", () => {
    cy.get("[data-cy=landing-header]").should("exist");
    cy.get("section")
      .first()
      .within(() => {
        cy.get("h1, h2, h3").should("exist");
        cy.get("img").should("have.attr", "src");
      });
  });

  it("renders all main sections", () => {
    const sections = ["about", "tech", "work", "team", "contact"];
    sections.forEach((id) => {
      cy.get(`section#${id}`).should("exist").and("be.visible");
    });
  });

  it("displays hero background image", () => {
    cy.get("section")
      .first()
      .within(() => {
        cy.get("div")
          .first()
          .should("have.css", "background-image")
          .and("include", "herobg.png");
      });
  });

  it("renders the stars canvas in contact section", () => {
    cy.get("section#contact").within(() => {
      cy.get("canvas").should("exist");
    });
  });
});
