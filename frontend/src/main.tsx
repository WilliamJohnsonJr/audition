import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import Movies from "./components/movies/Movies.tsx";
import { theme } from "./theme.ts";
import ViewMovie from "./components/movies/ViewMovie.tsx";
import Actors from "./components/actors/Actors.tsx";
import ViewActor from "./components/actors/ViewActor.tsx";
import { HeaderLayout } from "./HeaderLayout.tsx";
import EditMovie from "./components/movies/EditMovie.tsx";
import NotFound from "./components/not-found/NotFound.tsx";
import AddMovie from "./components/movies/AddMovie.tsx";
import AddActor from "./components/actors/AddActor.tsx";
import EditActor from "./components/actors/EditActor.tsx";
import AssignCast from "./components/casts/AssignCast.tsx";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <StyledEngineProvider enableCssLayer>
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route element={<HeaderLayout />}>
                <Route path="movies">
                  <Route index element={<Movies />} />
                  <Route path=":movieId" element={<ViewMovie />} />
                  <Route path=":movieId/edit" element={<EditMovie />} />
                  <Route path="add" element={<AddMovie />} />
                </Route>
                <Route path="actors">
                  <Route index element={<Actors />} />
                  <Route path=":actorId" element={<ViewActor />} />
                  <Route path=":id/edit" element={<EditActor />} />
                  <Route path="add" element={<AddActor />} />
                </Route>
                <Route path="casts" element={<AssignCast />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    </StrictMode>,
  );
} else {
  throw new Error("No root found.");
}
