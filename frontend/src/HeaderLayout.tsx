import { Link as RouterLink, Outlet, useNavigate } from "react-router";
import { Button, Link } from "@mui/material";
import logo from "./assets/AuditionLogoMedium.png";
import { useAuth0 } from "@auth0/auth0-react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function HeaderLayout() {
  const navigate = useNavigate();
  return (
    <>
      <nav className="mb-5 flex justify-between">
        <Button
          sx={{ backgroundColor: "#1a1a1a !important" }}
          startIcon={<ArrowBackIcon />}
          type="button"
          color="secondary"
          className="float-left bg-gradient-to-r focus:from-pink-500 focus:to-orange-500 focus:text-white hover:from-pink-500 hover:to-orange-500 hover:text-white"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Link
          component={RouterLink}
          aria-label="Home"
          to="/"
          className="rounded-xl bg-gradient-to-r focus:from-indigo-800 focus:to-cyan-800 focus:text-white hover:from-indigo-800 hover:to-cyan-800"
        >
          <img src={logo} alt="AuditionLogo" className="h-24" />
        </Link>
        <LogoutButton />
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <Button
      sx={{ backgroundColor: "#1a1a1a !important" }}
      type="button"
      color="secondary"
      className="float-right bg-gradient-to-r focus:from-orange-500 focus:to-pink-500 focus:text-white hover:from-orange-500 hover:to-pink-500 hover:text-white"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log Out
    </Button>
  );
}

export default LogoutButton;
