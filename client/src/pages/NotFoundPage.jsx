import Button from '../components/ui/Button.jsx';
import { ROUTES } from '../utils/routes.js';

export default function NotFoundPage() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="bg-gradient-to-r from-brand to-accent bg-clip-text text-7xl font-extrabold text-transparent sm:text-8xl">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">We could not find that page</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          The link may be broken or the page may have moved. Let&apos;s get you back to something useful.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to={ROUTES.home}>Go to home</Button>
          <Button to={ROUTES.internships} variant="secondary">Browse internships</Button>
        </div>
      </div>
    </div>
  );
}
