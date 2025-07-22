import { Auth0Provider, type AppState } from "@auth0/auth0-react";
import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router";

export const Auth0ProviderWithNavigate = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  const onRedirectCallback = (appState: AppState | undefined) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  if (!(domain && clientId && redirectUri)) {
    return null;
  }

  return (
    <Auth0Provider
      cacheLocation="localstorage"
      domain={domain as string}
      clientId={clientId as string}
      useRefreshTokens={true}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience as string,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
