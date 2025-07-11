import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "../api-helper/api-helper";
import { useAuth0 } from "@auth0/auth0-react";

export const useDataLoader = <T>(url: string, init: T) => {
  const [data, setData] = useState<T>(init);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const { getAccessTokenSilently } = useAuth0();

  const refresh = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    } else {
      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        const accessToken = await getAccessTokenSilently();
        const res = await fetchWithAuth(accessToken, url);
        if (res.ok && res.status < 400) {
          const json = await res.json();
          setData(json);
        } else {
          setError(new Error(`${res.status}: ${res.statusText}`));
        }
      } catch (e) {
        setError(new Error("Error processing request. Please try again"));
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    setError(undefined);
    refresh();
  }, [refresh]);

  return { data, refresh, error, isLoading };
};
