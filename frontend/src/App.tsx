import { Navigate, Route, Routes } from "react-router";
import "./App.css";
import { Home } from "./components/home/Home";
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

export function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<HeaderLayout />}>
          <Route index element={<Movies />} />
          <Route path="add" element={<AddMovie />} />
          <Route path=":movieId" element={<ViewMovie />} />
          <Route path=":movieId/edit" element={<EditMovie />} />
        </Route>
        <Route path="actors" element={<HeaderLayout />}>
          <Route index element={<Actors />} />
          <Route path="add" element={<AddActor />} />
          <Route path=":actorId" element={<ViewActor />} />
          <Route path=":actorId/edit" element={<EditActor />} />
        </Route>
        <Route path="casts" element={<HeaderLayout />}>
          <Route index element={<AssignCast />} />
        </Route>
        <Route path="/login" element={<Home />} />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </>
  );
}
