import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { BrowserRouter } from "react-router";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import { baseUrl, BaseUrlContext } from "./shared/base-url.ts";
import { Auth0ProviderWithNavigate } from "./shared/auth0-provider-with-navigate.tsx";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <StyledEngineProvider enableCssLayer>
            <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
            <ThemeProvider
              theme={createTheme({
                colorSchemes: {
                  dark: {
                    palette: {
                      contrastThreshold: 4.5,
                      primary: {
                        main: "#4ED7FA",
                      },
                      secondary: {
                        main: "#c500f6",
                      },
                    },
                  },
                },
              })}
              defaultMode="dark"
            >
              <BaseUrlContext value={baseUrl}>
                <App />
              </BaseUrlContext>
            </ThemeProvider>
          </StyledEngineProvider>
        </Auth0ProviderWithNavigate>
      </BrowserRouter>
    </StrictMode>
  );
} else {
  throw new Error("No root found.");
}
