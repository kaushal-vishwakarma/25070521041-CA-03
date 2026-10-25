import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Building2, CalendarDays, CheckCircle2, Clock, Laptop, ListChecks, MapPin, Users, Wallet,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Alert from '../components/ui/Alert.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import ApplyModal from '../components/ApplyModal.jsx';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import useFetch from '../hooks/useFetch.js';
import { getInternship } from '../services/internshipService.js';
import { saveInternship, unsaveInternship } from '../services/userService.js';
import { getErrorMessage } from '../services/api.js';
import { deadlineLabel, formatDate, formatStipend } from '../utils/format.js';
import { ROUTES } from '../utils/routes.js';

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-muted">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="text-sm font-medium text-white">{value}</dd>
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" role="status" aria-label="Loading internship">
      <div className="space-y-6">
        <div className="card space-y-4 p-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="card space-y-3 p-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <Skeleton className="h-48 w-full !rounded-2xl" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default function InternshipDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user, isStudent, isRecruiter } = useAuth();
  const toast = useToast();
  const [applyOpen, setApplyOpen] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  // Reload when the id changes or when the logged-in user changes (the "viewer" part depends on who is looking).
  const { data: internship, loading, error, reload, setData } = useFetch(() => getInternship(id), [id, user?._id]);

  const toggleSave = async () => {
    const wasSaved = internship.viewer.isSaved;
    setSavingBookmark(true);
    try {
      if (wasSaved) await unsaveInternship(internship._id);
      else await saveInternship(internship._id);
      setData((current) => ({ ...current, viewer: { ...current.viewer, isSaved: !wasSaved } }));
      toast.success(wasSaved ? 'Removed from saved internships' : 'Saved for later');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingBookmark(false);
    }
  };

  const showSkeleton = !internship || internship._id !== id;

  if (error) {
    return (
      <div className="container-page py-10">
        <ErrorState message={error} onRetry={reload} />
        <div className="mt-6 text-center">
          <Button to={ROUTES.internships} variant="secondary">Browse all internships</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <Link to={ROUTES.internships} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All internships
      </Link>

      {showSkeleton ? <DetailsSkeleton /> : renderContent()}
    </div>
  );

  // Plain render function (NOT a component): it uses no hooks, and a nested component would be
  // re-created on every render, which would reset the apply form while the user is typing.
  function renderContent() {
    const { viewer, recruiter } = internship;
    const closedByRecruiter = internship.status === 'closed';

    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------- Main column ---------- */}
        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex items-start gap-4">
              <Avatar name={internship.companyName} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{internship.title}</h1>
                <p className="mt-1 text-muted">{internship.companyName}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="violet">{internship.category}</Badge>
                  <Badge tone="cyan">{internship.workMode}</Badge>
                  <Badge>{internship.internshipType}</Badge>
                  {!internship.isOpen && <Badge tone="red">{closedByRecruiter ? 'Closed' : 'Deadline passed'}</Badge>}
                </div>
              </div>
            </div>

            <dl className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2">
              <Fact icon={Wallet} label="Stipend" value={formatStipend(internship.stipendMin, internship.stipendMax)} />
              <Fact icon={MapPin} label="Location" value={internship.location} />
              <Fact icon={Laptop} label="Work mode" value={internship.workMode} />
              <Fact icon={Clock} label="Duration" value={internship.duration} />
              <Fact icon={Users} label="Openings" value={`${internship.vacancies} position${internship.vacancies === 1 ? '' : 's'}`} />
              <Fact
                icon={CalendarDays}
                label="Apply before"
                value={`${formatDate(internship.applicationDeadline)} (${deadlineLabel(internship.applicationDeadline)})`}
              />
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold text-white">About this internship</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">{internship.description}</p>
          </section>

          {internship.responsibilities?.length > 0 && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-white">Responsibilities</h2>
              <ul className="mt-4 space-y-3">
                {internship.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-6">
            <h2 className="text-lg font-semibold text-white">Required skills</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {internship.requiredSkills.map((skill) => (
                <li key={skill} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">{skill}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-6" aria-label="Apply">
            {isStudent ? (
              viewer.hasApplied ? (
                <div className="space-y-4">
                  <Alert tone="success">You have already applied to this internship.</Alert>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Current status</span>
                    <StatusBadge status={viewer.applicationStatus} />
                  </div>
                  <Button to={ROUTES.student.applications} variant="secondary" fullWidth>View my applications</Button>
                </div>
              ) : internship.isOpen ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted">
                    {deadlineLabel(internship.applicationDeadline)}. Applications close on {formatDate(internship.applicationDeadline)}.
                  </p>
                  <Button fullWidth size="lg" icon={CheckCircle2} onClick={() => setApplyOpen(true)}>Apply Now</Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    icon={viewer.isSaved ? BookmarkCheck : Bookmark}
                    loading={savingBookmark}
                    onClick={toggleSave}
                    aria-pressed={viewer.isSaved}
                  >
                    {viewer.isSaved ? 'Saved' : 'Save for later'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert tone="error">
                    {closedByRecruiter ? 'The recruiter has closed this internship.' : 'The application deadline has passed.'} You can no longer apply.
                  </Alert>
                  <Button fullWidth size="lg" disabled>Applications closed</Button>
                  <Button to={ROUTES.internships} variant="secondary" fullWidth>Find other internships</Button>
                </div>
              )
            ) : isRecruiter ? (
              viewer.isOwner ? (
                <div className="space-y-3">
                  <Alert tone="info">This is your listing. {internship.isOpen ? 'It is open for applications.' : 'It is currently closed.'}</Alert>
                  <Button to={ROUTES.recruiter.applicants(internship._id)} fullWidth>View applicants</Button>
                  <Button to={ROUTES.recruiter.editInternship(internship._id)} variant="secondary" fullWidth>Edit internship</Button>
                </div>
              ) : (
                <Alert tone="info">Recruiter accounts cannot apply to internships. Log in with a student account to apply.</Alert>
              )
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  {internship.isOpen ? 'Log in or create a student account to apply to this internship.' : 'This internship is no longer accepting applications.'}
                </p>
                {internship.isOpen && (
                  <>
                    <Button to={ROUTES.login} state={{ from: location }} fullWidth size="lg">Log in to apply</Button>
                    <Button to={`${ROUTES.register}?role=student`} state={{ from: location }} variant="secondary" fullWidth>Create student account</Button>
                  </>
                )}
              </div>
            )}
          </section>

          <section className="card p-6" aria-label="About the company">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <Building2 className="h-4 w-4 text-muted" aria-hidden="true" /> About the company
            </h2>
            <p className="mt-3 font-medium text-white">{internship.companyName}</p>
            {recruiter ? (
              <p className="mt-1 text-sm text-muted">
                Posted by {recruiter.name}
                {recruiter.designation ? `, ${recruiter.designation}` : ''}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Recruiter details are unavailable.</p>
            )}
            <p className="mt-3 text-xs text-slate-500">Posted on {formatDate(internship.createdAt)}</p>
          </section>
        </aside>

        {isStudent && internship.isOpen && !viewer.hasApplied && (
          <ApplyModal
            key={internship._id}
            open={applyOpen}
            onClose={() => setApplyOpen(false)}
            internship={internship}
            defaultResumeUrl={user?.resumeUrl || ''}
            onApplied={() => {
              setApplyOpen(false);
              reload(); // shows the "already applied" panel
            }}
          />
        )}
      </div>
    );
  }
}
