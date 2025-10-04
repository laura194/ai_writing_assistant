import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";

const AllProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
