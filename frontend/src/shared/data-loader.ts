import { useCallback, useEffect, useRef, useState } from "react";

export const useDataLoader = <T>(url: string, init: T) => {
  const [data, setData] = useState<T>(init);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    } else {
      isLoadingRef.current = true;
      setIsLoading(true);
      const res = await fetch(url);
      if (res.ok && res.status < 400) {
        const json = await res.json();
        setData(json);
      } else {
        setError(new Error(`${res.status}: ${res.statusText}`));
      }
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    setError(undefined);
    refresh();
  }, [refresh]);

  return { data, refresh, error, isLoading };
};
