import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

export function Logout() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  return (<div>
    <p>You have been logged out</p>
    <p>Authenticated: { isAuthenticated }</p>
    <Button type="button" onClick={() => loginWithRedirect()}>Log In</Button>
  </div>)
}