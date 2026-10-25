import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Alert from '../components/ui/Alert.jsx';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { validateLogin } from '../utils/validators.js';
import { ROUTES } from '../utils/routes.js';

// Development-only shortcuts. import.meta.env.DEV is false in a production build,
// so these buttons disappear automatically when the app is deployed.
const DEV_ACCOUNTS = [
  { label: 'Demo student', email: 'student1@careerhub.demo' },
  { label: 'Demo recruiter', email: 'recruiter1@careerhub.demo' },
];
const DEV_PASSWORD = 'Demo@12345';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`login-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const me = await login({ email: values.email.trim(), password: values.password });
      toast.success(`Welcome back, ${me.name.split(' ')[0]}!`);
      // No navigate() needed: <GuestRoute> notices the user is now logged in and redirects
      // to the page they came from, or to their own dashboard.
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-white">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted">Log in to continue to your dashboard.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {formError && <Alert>{formError}</Alert>}

        <Input
          id="login-email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <PasswordInput
          id="login-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Button type="submit" fullWidth loading={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      {import.meta.env.DEV && (
        <div className="mt-6 rounded-xl border border-dashed border-white/15 p-4">
          <p className="text-xs font-medium text-muted">Development only: fill in a seeded demo account</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEV_ACCOUNTS.map((account) => (
              <Button
                key={account.email}
                size="sm"
                variant="secondary"
                onClick={() => {
                  setValues({ email: account.email, password: DEV_PASSWORD });
                  setErrors({});
                  setFormError('');
                }}
              >
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        New to CareerHub?{' '}
        <Link to={ROUTES.register} className="font-medium text-accent hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
