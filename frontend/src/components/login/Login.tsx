import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export function Login() {
  const {user, isAuthenticated, loginWithRedirect } = useAuth0();
  return <div>
    <p>Authenticated: {isAuthenticated}</p>
    <p>Please log in.</p><Button type="button" onClick={() => loginWithRedirect()}>Log In</Button>
  </div>
}