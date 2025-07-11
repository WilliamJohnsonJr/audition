import { Navigate, Route, Routes, useNavigate } from "react-router";
import "./App.css";
import { Box, Button, CircularProgress } from "@mui/material";
import logo from "./assets/AuditionLogoMedium.png";
import { useAuth0 } from "@auth0/auth0-react";
import { Home } from "./components/home/Home";
import { Logout } from "./components/login/Logout";
import { HeaderLayout } from "./HeaderLayout";
import { Movies } from "./components/movies/Movies";
import { ViewMovie } from "./components/movies/ViewMovie";
import { EditMovie } from "./components/movies/EditMovie";
import { AddMovie } from "./components/movies/AddMovie";
import { Actors } from "./components/actors/Actors";
import { ViewActor } from "./components/actors/ViewActor";
import { EditActor } from "./components/actors/EditActor";
import { AddActor } from "./components/actors/AddActor";
import { AssignCast } from "./components/casts/AssignCast";
import { NotFound } from "./components/not-found/NotFound";

export function App() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <>
      {isLoading ? (
        <div className="min-h-[90vh] flex flex-col justify-center align-center">
          <div className="flex justify-center align-center">
            <img src={logo} alt="Audition Logo" />
          </div>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        </div>
      ) : isAuthenticated ? (
        <Routes>
          <Route path="/" element={<Home />} />
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
              <Route path=":actorId/edit" element={<EditActor />} />
              <Route path="add" element={<AddActor />} />
            </Route>
            <Route path="casts" element={<AssignCast />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Home />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      )}
    </>
  );
}
