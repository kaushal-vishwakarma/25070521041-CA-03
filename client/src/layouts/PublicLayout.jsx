import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

// Navbar + page + footer. Used by the landing page, internship listing and details.
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Keyboard users can jump straight past the navigation */}
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
