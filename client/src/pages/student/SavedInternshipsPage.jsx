import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { InternshipCardSkeleton } from '../../components/ui/Skeleton.jsx';
import InternshipCard from '../../components/InternshipCard.jsx';
import useFetch from '../../hooks/useFetch.js';
import useToast from '../../hooks/useToast.js';
import { getSavedInternships, unsaveInternship } from '../../services/userService.js';
import { getErrorMessage } from '../../services/api.js';
import { ROUTES } from '../../utils/routes.js';

export default function SavedInternshipsPage() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch(getSavedInternships, []);
  const [removingId, setRemovingId] = useState(null);

  const handleUnsave = async (item) => {
    setRemovingId(item._id);
    try {
      await unsaveInternship(item._id);
      setData((list) => list.filter((entry) => entry._id !== item._id)); // remove from the screen immediately
      toast.success('Removed from saved internships');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Saved internships"
        subtitle="Internships you bookmarked to look at later. Closed ones stay here so you can see what happened to them."
        actions={<Button to={ROUTES.internships} variant="secondary">Browse internships</Button>}
      />

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="grid gap-5 sm:grid-cols-2">{[1, 2].map((n) => <InternshipCardSkeleton key={n} />)}</div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the bookmark icon on any internship card to keep it here."
          action={<Button to={ROUTES.internships}>Browse internships</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {data.map((item) => (
            <InternshipCard key={item._id} internship={item} saved onToggleSave={handleUnsave} saving={removingId === item._id} />
          ))}
        </div>
      )}
    </>
  );
}
