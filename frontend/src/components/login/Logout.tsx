import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";
import logo from "../../assets/AuditionLogoMedium.png";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export function Logout() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);
  return (
    <div>
      <div className="flex justify-center align-center">
        <img src={logo} alt="Audition Logo" />
      </div>
      <p>You have been logged out</p>
      <Button sx={{backgroundColor: "#1a1a1a !important"}} type="button" onClick={() => loginWithRedirect()}>
        Log In
      </Button>
    </div>
  );
}
