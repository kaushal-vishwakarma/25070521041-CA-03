// TEMPORARY page to look at every Part 4 component. Part 5 replaces the "/" route with the real landing page.
import { useState } from 'react';
import { Briefcase, FileText, Mail, Search, Users, Bookmark } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Select from '../components/ui/Select.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { InternshipCardSkeleton, StatCardSkeleton } from '../components/ui/Skeleton.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import useFetch from '../hooks/useFetch.js';
import { listInternships } from '../services/internshipService.js';
import { getErrorMessage } from '../services/api.js';
import { APPLICATION_STATUSES, CATEGORIES } from '../utils/constants.js';
import { dashboardPathFor } from '../utils/routes.js';

const DEMO_PASSWORD = 'Demo@12345'; // development-only seed password (server/seed/data.js)

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default function ComponentPreview() {
  const { user, login, logout } = useAuth();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(3);
  const [bio, setBio] = useState('');
  const [savedIds, setSavedIds] = useState([]);
  const { data, loading, error, reload } = useFetch(() => listInternships({ limit: 3 }), []);

  const quickLogin = async (email) => {
    try {
      const me = await login({ email, password: DEMO_PASSWORD });
      toast.success(`Logged in as ${me.name} (${me.role})`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleSave = (item) =>
    setSavedIds((ids) => (ids.includes(item._id) ? ids.filter((id) => id !== item._id) : [...ids, item._id]));

  return (
    <div className="container-page space-y-12 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Component preview</h1>
        <p className="mt-2 text-muted">Temporary page for checking the Part 4 building blocks. The real landing page arrives in Part 5.</p>
      </div>

      <Section title="Quick login (development only)">
        <div className="card flex flex-wrap items-center gap-3 p-5">
          {user ? (
            <>
              <p className="text-sm">
                Logged in as <span className="font-semibold text-accent">{user.name}</span> ({user.role})
              </p>
              <Button to={dashboardPathFor(user.role)} size="sm">Open my dashboard</Button>
              <Button variant="secondary" size="sm" onClick={logout}>Log out</Button>
            </>
          ) : (
            <>
              <Button onClick={() => quickLogin('student1@careerhub.demo')}>Login as demo student</Button>
              <Button variant="secondary" onClick={() => quickLogin('recruiter1@careerhub.demo')}>Login as demo recruiter</Button>
            </>
          )}
        </div>
      </Section>

      <Section title="Internship cards (real data from your API)">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading && !data
              ? [1, 2, 3].map((n) => <InternshipCardSkeleton key={n} />)
              : data.items.map((item) => (
                  <InternshipCard key={item._id} internship={item} saved={savedIds.includes(item._id)} onToggleSave={toggleSave} />
                ))}
          </div>
        )}
      </Section>

      <Section title="Buttons and badges">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" icon={Search}>Small</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="violet">Violet</Badge>
          <Badge tone="cyan">Cyan</Badge>
          <Badge tone="green">Green</Badge>
          <Badge tone="amber">Amber</Badge>
          <Badge tone="red">Red</Badge>
          {APPLICATION_STATUSES.map((s) => <StatusBadge key={s} status={s} />)}
        </div>
      </Section>

      <Section title="Form controls">
        <div className="card grid gap-5 p-5 sm:grid-cols-2">
          <Input label="Email" icon={Mail} placeholder="you@example.com" required hint="We never share your email." />
          <Input label="Full name (with error)" defaultValue="A" error="Name must be at least 2 characters" />
          <PasswordInput label="Password" placeholder="At least 8 characters" required />
          <Select label="Category" placeholder="All categories" options={CATEGORIES} />
          <Textarea className="sm:col-span-2" label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} hint="Tell recruiters about yourself." />
        </div>
      </Section>

      <Section title="Stat cards and loading skeletons">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={FileText} label="Applications" value={12} tone="violet" />
          <StatCard icon={Users} label="Shortlisted" value={3} tone="green" />
          <StatCard icon={Briefcase} label="Active listings" value={5} tone="cyan" />
          <StatCard icon={Bookmark} label="Saved" value={7} tone="amber" />
          <StatCardSkeleton />
        </div>
      </Section>

      <Section title="Dialogs, toasts, pagination">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open confirm dialog</Button>
          <Button variant="secondary" onClick={() => toast.success('Saved successfully')}>Success toast</Button>
          <Button variant="secondary" onClick={() => toast.error('Something failed')}>Error toast</Button>
          <Button variant="secondary" onClick={() => toast.info('Just so you know')}>Info toast</Button>
        </div>
        <Pagination page={page} totalPages={9} onPageChange={setPage} />
      </Section>

      <Section title="Empty and error states">
        <div className="grid gap-5 lg:grid-cols-2">
          <EmptyState title="No applications yet" description="When you apply to an internship it will show up here." action={<Button to="/internships">Browse internships</Button>} />
          <ErrorState message="Cannot reach the server." onRetry={() => toast.info('Retry clicked')} />
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example modal"
        footer={<Button onClick={() => setModalOpen(false)}>Got it</Button>}
      >
        <p className="text-sm text-muted">Press Escape, click outside, or use Tab: focus stays inside this dialog.</p>
        <Input className="mt-4" label="Try typing here" />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Delete internship?"
        message="This also removes all applications to it. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success('Confirmed (nothing was actually deleted)');
        }}
      />
    </div>
  );
}
