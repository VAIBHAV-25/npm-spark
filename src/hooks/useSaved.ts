import { useEffect, useMemo, useState } from "react";
import { SavedListKey, getSavedState, toggleSaved, removeSaved, clearSaved, isSaved } from "@/lib/saved";

export function useSaved() {
  const [state, setState] = useState(() => getSavedState());

  useEffect(() => {
    const onChange = () => setState(getSavedState());
    window.addEventListener("storage", onChange);
    window.addEventListener("npmx:saved", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("npmx:saved", onChange);
    };
  }, []);

  return useMemo(
    () => ({
      favorites: state.favorites,
      watchlist: state.watchlist,
      isSaved: (list: SavedListKey, name: string) => isSaved(list, name),
      toggleSaved: (list: SavedListKey, name: string) => setState(toggleSaved(list, name)),
      removeSaved: (list: SavedListKey, name: string) => setState(removeSaved(list, name)),
      clearSaved: (list: SavedListKey) => setState(clearSaved(list)),
    }),
    [state],
  );
}

