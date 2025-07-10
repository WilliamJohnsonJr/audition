import { Link as RouterLink, useNavigate} from "react-router";
import "./App.css";
import { Button, Link } from "@mui/material";
import logo from "./assets/AuditionLogoMedium.png";

export function App() {

  return (
    <>
      
      <div className="flex justify-center align-center">
        <img src={logo} alt="Audition Logo" />
      </div>
      <div className="flex justify-center">
        <Link component={RouterLink} to="/movies">
          <Button type="button">
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

