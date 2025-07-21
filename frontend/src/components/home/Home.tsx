import { Link as RouterLink } from "react-router";
import { Button, Link } from "@mui/material";
import logo from "../..//assets/AuditionLogoMedium.png";
import { useAuth0 } from "@auth0/auth0-react";

export function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  return (
    <div className="min-h-[90vh] flex flex-col justify-center align-center">
      <div className="flex justify-center align-center">
        <img src={logo} alt="Audition Logo" />
      </div>
      {isAuthenticated ? (
        <div className="flex justify-center">
          <Link component={RouterLink} to="/movies">
            <Button sx={{backgroundColor: "#1a1a1a !important"}} type="button">Movies</Button>
          </Link>
          <Link component={RouterLink} to="/actors">
            <Button sx={{backgroundColor: "#1a1a1a !important"}} type="button" className="ml-5">
              Actors
            </Button>
          </Link>
          <Link component={RouterLink} to="/casts">
            <Button sx={{backgroundColor: "#1a1a1a !important"}} type="button" className="ml-5">
              Casts
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <Button sx={{backgroundColor: "#1a1a1a !important"}} type="button" onClick={() => loginWithRedirect()}>
            Log In
          </Button>
        </div>
      )}
    </div>
  );
}
