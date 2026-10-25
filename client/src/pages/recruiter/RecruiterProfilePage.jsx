import { useState } from 'react';
import { Mail } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Alert from '../../components/ui/Alert.jsx';
import useAuth from '../../hooks/useAuth.js';
import useToast from '../../hooks/useToast.js';
import { updateProfile } from '../../services/userService.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { validateRecruiterProfile } from '../../utils/validators.js';

const toForm = (user) => ({
  name: user.name || '',
  companyName: user.companyName || '',
  designation: user.designation || '',
  bio: user.bio || '',
});

export default function RecruiterProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState(() => toForm(user));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const isDirty = JSON.stringify(values) !== JSON.stringify(toForm(user));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateRecruiterProfile(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`rprofile-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const updated = await updateProfile({
        name: values.name.trim(),
        companyName: values.companyName.trim(),
        designation: values.designation.trim(),
        bio: values.bio.trim(),
      });
      setUser(updated);
      setValues(toForm(updated));
      toast.success('Profile updated');
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="My profile" subtitle="Students see your name, designation and company on your internship listings." />
      <form onSubmit={handleSubmit} noValidate className="card max-w-2xl space-y-5 p-6">
        {formError && <Alert>{formError}</Alert>}
        <Input id="rprofile-name" name="name" label="Full name" value={values.name} onChange={handleChange} error={errors.name} required />
        <Input label="Email" icon={Mail} value={user.email} disabled readOnly hint="Your email is your login and cannot be changed here." />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input id="rprofile-companyName" name="companyName" label="Company name" value={values.companyName} onChange={handleChange} error={errors.companyName} hint="Used as the default for new listings. Existing listings keep their company name." required />
          <Input id="rprofile-designation" name="designation" label="Designation" placeholder="e.g. Hiring Manager" value={values.designation} onChange={handleChange} error={errors.designation} />
        </div>
        <Textarea id="rprofile-bio" name="bio" label="About" rows={5} maxLength={1000} placeholder="A short note about you or your team..." value={values.bio} onChange={handleChange} error={errors.bio} />
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" loading={saving} disabled={!isDirty}>Save changes</Button>
          {isDirty && <Button variant="ghost" onClick={() => { setValues(toForm(user)); setErrors({}); setFormError(''); }} disabled={saving}>Discard changes</Button>}
        </div>
      </form>
    </>
  );
}
