import { useCallback, useEffect, useState } from 'react';
import useAuth from './useAuth.js';
import useToast from './useToast.js';
import { getSavedInternships, saveInternship, unsaveInternship } from '../services/userService.js';
import { getErrorMessage } from '../services/api.js';

// Keeps the logged-in student's saved internships in sync with the server.
//   const { enabled, isSaved, toggle, savingId } = useSavedInternships();
// `enabled` is false for visitors and recruiters (bookmark buttons are then hidden).
export default function useSavedInternships() {
  const { isStudent } = useAuth();
  const toast = useToast();
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!isStudent) {
      setSavedIds(new Set());
      return undefined;
    }
    let active = true;
    getSavedInternships()
      .then((list) => active && setSavedIds(new Set(list.map((item) => item._id))))
      .catch(() => {}); // not critical: bookmarks just start unselected
    return () => {
      active = false;
    };
  }, [isStudent]);

  const toggle = useCallback(
    async (internship) => {
      const id = internship._id;
      const currentlySaved = savedIds.has(id);
      setSavingId(id);
      try {
        if (currentlySaved) await unsaveInternship(id);
        else await saveInternship(id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (currentlySaved) next.delete(id);
          else next.add(id);
          return next;
        });
        toast.success(currentlySaved ? 'Removed from saved internships' : 'Saved for later');
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setSavingId(null);
      }
    },
    [savedIds, toast]
  );

  return { enabled: isStudent, isSaved: (id) => savedIds.has(id), toggle, savingId };
}
