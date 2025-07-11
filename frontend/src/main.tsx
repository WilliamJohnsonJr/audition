import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { BrowserRouter } from "react-router";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import { theme } from "./theme.ts";
import { baseUrl, BaseUrlContext } from "./shared/base-url.ts";
import { Auth0ProviderWithNavigate } from "./shared/auth0-provider-with-navigate.tsx";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <StyledEngineProvider enableCssLayer>
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Auth0ProviderWithNavigate>
              <BaseUrlContext value={baseUrl}>
                <App />
              </BaseUrlContext>
            </Auth0ProviderWithNavigate>
          </BrowserRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    </StrictMode>,
  );
} else {
  throw new Error("No root found.");
}
