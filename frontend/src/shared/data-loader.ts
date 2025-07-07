import { useCallback, useEffect, useRef, useState } from "react";

export const useDataLoader = <T>(url: string, init: T) => {
  const [data, setData] = useState<T>(init);
  const [errors, setErrors] = useState<Error[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    } else {
      isLoadingRef.current = true;
      setIsLoading(true);
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setErrors([new Error(`Failed to load data from ${url}`)]);
      }
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, refresh, errors, isLoading };
};
