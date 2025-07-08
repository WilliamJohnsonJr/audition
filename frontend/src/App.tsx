import { useState } from "react";
import { Link as RouterLink } from "react-router";
import "./App.css";
import { Button, Link } from "@mui/material";
import logo from "./assets/AuditionLogoMedium.png";

function App() {
  return (
    <>
      <div className="flex-auto justify-center align-center">
        <img src={logo} alt="Audition Logo" />
      </div>
      <div className="flex-auto">
        <Link component={RouterLink} to="/movies">
          <Button type="button" className="mr-5">
            Movies
          </Button>
        </Link>
        <Link component={RouterLink} to="/actors">
          <Button type="button" className="ml-5">
            Actors
          </Button>
        </Link>
        <Link component={RouterLink} to="/casts">
          <Button type="button" className="ml-5">
            Casts
          </Button>
        </Link>
      </div>
    </>
  );
}

export default App;
