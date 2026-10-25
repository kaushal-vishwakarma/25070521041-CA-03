import { LayoutDashboard, FileText, Bookmark, UserCircle, Briefcase, PlusCircle } from 'lucide-react';
import { ROUTES } from './routes.js';

// Sidebar items for the dashboards. `end: true` means "active only on this exact URL".
export const STUDENT_NAV = [
  { label: 'Dashboard', to: ROUTES.student.dashboard, icon: LayoutDashboard, end: true },
  { label: 'My Applications', to: ROUTES.student.applications, icon: FileText },
  { label: 'Saved', to: ROUTES.student.saved, icon: Bookmark },
  { label: 'Profile', to: ROUTES.student.profile, icon: UserCircle },
];

export const RECRUITER_NAV = [
  { label: 'Dashboard', to: ROUTES.recruiter.dashboard, icon: LayoutDashboard, end: true },
  { label: 'My Internships', to: ROUTES.recruiter.internships, icon: Briefcase, end: true },
  { label: 'Post Internship', to: ROUTES.recruiter.newInternship, icon: PlusCircle },
  { label: 'Profile', to: ROUTES.recruiter.profile, icon: UserCircle },
];
