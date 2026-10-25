import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, GraduationCap, Mail, User } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Alert from '../components/ui/Alert.jsx';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { validateRegister } from '../utils/validators.js';
import { splitList } from '../utils/format.js';
import { ROUTES } from '../utils/routes.js';

const ROLE_OPTIONS = [
  { value: 'student', title: 'Student', text: 'Find and apply to internships', icon: GraduationCap },
  { value: 'recruiter', title: 'Recruiter', text: 'Post roles and review applicants', icon: Briefcase },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student', // from ?role=
    college: '',
    skills: '',
    companyName: '',
    designation: '',
  });
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
    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`reg-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      confirmPassword: values.confirmPassword,
      role: values.role,
      ...(values.role === 'student'
        ? { college: values.college.trim(), skills: splitList(values.skills) }
        : { companyName: values.companyName.trim(), designation: values.designation.trim() }),
    };

    setSubmitting(true);
    setFormError('');
    try {
      const me = await register(payload);
      toast.success(`Welcome to CareerHub, ${me.name.split(' ')[0]}!`);
      // <GuestRoute> redirects to the new user's dashboard now that they are logged in.
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (err.response?.status === 409) fieldErrors.email = getErrorMessage(err); // email already registered
      setErrors(fieldErrors);
      setFormError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const skillPreview = splitList(values.skills);

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-white">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted">It takes less than a minute.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {formError && <Alert>{formError}</Alert>}

        <fieldset>
          <legend className="label">I am a</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(({ value, title, text, icon: Icon }) => (
              <div key={value}>
                <input
                  type="radio"
                  id={`reg-role-${value}`}
                  name="role"
                  value={value}
                  checked={values.role === value}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`reg-role-${value}`}
                  className="flex h-full cursor-pointer flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/25 peer-checked:border-brand peer-checked:bg-brand/10 peer-focus-visible:ring-2 peer-focus-visible:ring-accent"
                >
                  <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
                  <span className="text-sm font-semibold text-white">{title}</span>
                  <span className="text-xs text-muted">{text}</span>
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <Input id="reg-name" name="name" label="Full name" icon={User} autoComplete="name" placeholder="Your full name" value={values.name} onChange={handleChange} error={errors.name} required />
        <Input id="reg-email" name="email" type="email" label="Email" icon={Mail} autoComplete="email" placeholder="you@example.com" value={values.email} onChange={handleChange} error={errors.email} required />

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordInput id="reg-password" name="password" label="Password" autoComplete="new-password" placeholder="Min. 8 characters" value={values.password} onChange={handleChange} error={errors.password} hint="At least 8 characters with a letter and a number." required />
          <PasswordInput id="reg-confirmPassword" name="confirmPassword" label="Confirm password" autoComplete="new-password" placeholder="Repeat password" value={values.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
        </div>

        {values.role === 'student' ? (
          <>
            <Input id="reg-college" name="college" label="College" placeholder="Your college or university" value={values.college} onChange={handleChange} error={errors.college} />
            <div>
              <Input id="reg-skills" name="skills" label="Skills" placeholder="React, Node.js, Python" value={values.skills} onChange={handleChange} error={errors.skills} hint="Separate skills with commas. We use them to recommend internships." />
              {skillPreview.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills you entered">
                  {skillPreview.map((skill) => (
                    <li key={skill} className="rounded-md bg-brand/15 px-2 py-0.5 text-xs text-violet-200">{skill}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <Input id="reg-companyName" name="companyName" label="Company name" placeholder="Your company" value={values.companyName} onChange={handleChange} error={errors.companyName} required />
            <Input id="reg-designation" name="designation" label="Designation" placeholder="e.g. Hiring Manager" value={values.designation} onChange={handleChange} error={errors.designation} />
          </div>
        )}

        <Button type="submit" fullWidth loading={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-medium text-accent hover:underline">Log in</Link>
      </p>
    </div>
  );
}
