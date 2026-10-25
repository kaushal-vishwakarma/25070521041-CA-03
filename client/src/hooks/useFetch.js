import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/api.js';

// Runs an async function and tracks { data, loading, error }.
//   const { data, loading, error, reload } = useFetch(() => getInternship(id), [id]);
// - Re-runs whenever a value in `deps` changes, or when reload() is called.
// - Old data stays visible while reloading, so pages do not flash empty.
// - Ignores results from outdated requests (e.g. user changed filters quickly).
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((err) => active && setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(err) })));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  // Lets a page update the list locally (e.g. after deleting an item) without refetching.
  const setData = useCallback(
    (updater) =>
      setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater })),
    []
  );

  return { ...state, reload, setData };
}
