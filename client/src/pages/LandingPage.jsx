import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Brain, Briefcase, Building2, CheckCircle2, Database, FileText, Layers, Monitor,
  Palette, Quote, Search, Send, Server, Shield, Sparkles, UserPlus, Users,
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { InternshipCardSkeleton, StatCardSkeleton } from '../components/ui/Skeleton.jsx';
import InternshipCard from '../components/InternshipCard.jsx';
import useFetch from '../hooks/useFetch.js';
import useSavedInternships from '../hooks/useSavedInternships.js';
import { listInternships } from '../services/internshipService.js';
import { getPublicStats } from '../services/statsService.js';
import { ROUTES } from '../utils/routes.js';

const POPULAR_SEARCHES = ['React', 'Python', 'Node.js', 'Figma', 'Machine Learning'];

const CATEGORY_CARDS = [
  { name: 'Frontend Development', icon: Monitor, blurb: 'React, Vue and modern UI work' },
  { name: 'Backend Development', icon: Server, blurb: 'APIs, databases and services' },
  { name: 'Full-Stack Development', icon: Layers, blurb: 'Build features end to end' },
  { name: 'AI/ML', icon: Brain, blurb: 'Models, NLP and experiments' },
  { name: 'Data Science', icon: Database, blurb: 'Analysis, SQL and dashboards' },
  { name: 'Cybersecurity', icon: Shield, blurb: 'Defend, test and monitor systems' },
  { name: 'UI/UX Design', icon: Palette, blurb: 'Research, Figma and prototypes' },
];

const STEPS = [
  { icon: UserPlus, title: 'Create your profile', text: 'Sign up as a student and add your college, skills and resume link.' },
  { icon: Search, title: 'Find the right fit', text: 'Search and filter by role, skill, location, stipend and work mode.' },
  { icon: Send, title: 'Apply in minutes', text: 'Send a short cover letter with your resume. Each internship accepts one application per student.' },
  { icon: CheckCircle2, title: 'Track every update', text: 'Watch your status move from Applied to Shortlisted or Accepted in your dashboard.' },
];

// Fictional demo content, clearly labelled on the page.
const TESTIMONIALS = [
  { name: 'Demo Student A', role: 'BTech CSE, sample profile', quote: 'The filters made it easy to find remote internships that matched my React and Node.js skills.' },
  { name: 'Demo Student B', role: 'BTech IT, sample profile', quote: 'I could see my application status change from Applied to Shortlisted without emailing anyone.' },
  { name: 'Demo Recruiter C', role: 'Hiring manager, sample profile', quote: 'Posting a role and reviewing applicants with their skills and resume links in one place saved us time.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const featured = useFetch(() => listInternships({ limit: 6, sort: 'newest' }), []);
  const stats = useFetch(getPublicStats, []);
  const saved = useSavedInternships();

  const handleSearch = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `${ROUTES.internships}?search=${encodeURIComponent(q)}` : ROUTES.internships);
  };

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="container-page py-16 text-center sm:py-24">
          <Badge tone="violet" icon={Sparkles} className="mx-auto">Internships for BTech students</Badge>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Your Next{' '}
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">Opportunity</span>{' '}
            Starts Here
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
            Discover internships that match your skills, apply in minutes and track every application in one place.
          </p>

          <form onSubmit={handleSearch} role="search" className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <label htmlFor="hero-search" className="sr-only">Search internships by role, company or skill</label>
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by role, company or skill"
                maxLength={100}
                className="input !rounded-2xl !py-3.5 pl-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="!rounded-2xl">Search</Button>
          </form>

          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-muted">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <Link
                key={term}
                to={`${ROUTES.internships}?search=${encodeURIComponent(term)}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition hover:border-brand/50 hover:text-white"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured internships ---------- */}
      <section className="container-page py-12" aria-labelledby="featured-heading">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="featured-heading" className="text-2xl font-bold text-white sm:text-3xl">Featured internships</h2>
            <p className="mt-1.5 text-sm text-muted">The newest openings that are accepting applications right now.</p>
          </div>
          <Link to={ROUTES.internships} className="hidden items-center gap-1.5 text-sm font-medium text-accent hover:underline sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {featured.error ? (
          <ErrorState message={featured.error} onRetry={featured.reload} />
        ) : featured.loading && !featured.data ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => <InternshipCardSkeleton key={n} />)}
          </div>
        ) : featured.data.items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No open internships yet"
            description="Recruiters have not posted anything right now. Please check back soon."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.items.map((item) => (
              <InternshipCard
                key={item._id}
                internship={item}
                saved={saved.isSaved(item._id)}
                onToggleSave={saved.enabled ? saved.toggle : undefined}
                saving={saved.savingId === item._id}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Categories ---------- */}
      <section className="container-page py-12" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-2xl font-bold text-white sm:text-3xl">Explore by category</h2>
        <p className="mt-1.5 text-sm text-muted">Pick a field and see only the internships that belong to it.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map(({ name, icon: Icon, blurb }) => (
            <Link
              key={name}
              to={`${ROUTES.internships}?category=${encodeURIComponent(name)}`}
              className="card card-hover group flex items-start gap-4 p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-white group-hover:text-accent">{name}</span>
                <span className="mt-0.5 block text-xs text-muted">{blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Platform statistics (real counts) ---------- */}
      {!stats.error && (
        <section className="container-page py-12" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-2xl font-bold text-white sm:text-3xl">CareerHub at a glance</h2>
          <p className="mt-1.5 text-sm text-muted">Live numbers counted from the database, not hard-coded.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.loading && !stats.data ? (
              [1, 2, 3, 4].map((n) => <StatCardSkeleton key={n} />)
            ) : (
              <>
                <StatCard icon={Briefcase} label="Open internships" value={stats.data.openInternships} tone="violet" />
                <StatCard icon={Building2} label="Hiring companies" value={stats.data.companies} tone="cyan" />
                <StatCard icon={Users} label="Registered students" value={stats.data.students} tone="green" />
                <StatCard icon={FileText} label="Applications submitted" value={stats.data.applications} tone="amber" />
              </>
            )}
          </div>
        </section>
      )}

      {/* ---------- How it works ---------- */}
      <section className="container-page py-12" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-2xl font-bold text-white sm:text-3xl">How it works</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="card relative p-6">
              <span className="absolute right-5 top-4 text-4xl font-black text-white/5" aria-hidden="true">{index + 1}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Testimonials (demo) ---------- */}
      <section className="container-page py-12" aria-labelledby="testimonials-heading">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="testimonials-heading" className="text-2xl font-bold text-white sm:text-3xl">What people say</h2>
          <Badge tone="amber">Demo content</Badge>
        </div>
        <p className="mt-1.5 text-sm text-muted">These testimonials are fictional placeholders written for this academic project. They are not real users.</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map(({ name, role, quote }) => (
            <figure key={name} className="card flex flex-col p-6">
              <Quote className="h-6 w-6 text-brand" aria-hidden="true" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-200">{quote}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <Avatar name={name} size="sm" rounded="rounded-full" />
                <span>
                  <span className="block text-sm font-medium text-white">{name}</span>
                  <span className="block text-xs text-muted">{role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- Calls to action ---------- */}
      <section className="container-page py-12" aria-label="Get started">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card relative overflow-hidden p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl" aria-hidden="true" />
            <h2 className="relative text-xl font-bold text-white">Looking for an internship?</h2>
            <p className="relative mt-2 max-w-sm text-sm text-muted">Create a free student profile, save listings you like and apply in a few clicks.</p>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <Button to={`${ROUTES.register}?role=student`}>Join as a student</Button>
              <Button to={ROUTES.internships} variant="secondary">Browse internships</Button>
            </div>
          </div>
          <div className="card relative overflow-hidden p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
            <h2 className="relative text-xl font-bold text-white">Hiring interns?</h2>
            <p className="relative mt-2 max-w-sm text-sm text-muted">Post an internship, review applicants with their skills and resume links, and update their status.</p>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <Button to={`${ROUTES.register}?role=recruiter`}>Join as a recruiter</Button>
              <Button to={ROUTES.login} variant="secondary">Recruiter login</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
