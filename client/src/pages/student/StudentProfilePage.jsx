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
import { validateProfile } from '../../utils/validators.js';
import { splitList } from '../../utils/format.js';

// The form's text boxes work with strings, so skills become "React, Node.js".
const toForm = (user) => ({
  name: user.name || '',
  college: user.college || '',
  skills: (user.skills || []).join(', '),
  resumeUrl: user.resumeUrl || '',
  bio: user.bio || '',
});

export default function StudentProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState(() => toForm(user));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(values) !== JSON.stringify(toForm(user));
  const skillPreview = splitList(values.skills);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateProfile(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`profile-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const updated = await updateProfile({
        name: values.name.trim(),
        college: values.college.trim(),
        skills: splitList(values.skills),
        resumeUrl: values.resumeUrl.trim(),
        bio: values.bio.trim(),
      });
      setUser(updated); // the navbar and dashboard now show the new details
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
      <PageHeader title="My profile" subtitle="Recruiters see your name, college, skills and resume link when you apply." />

      <form onSubmit={handleSubmit} noValidate className="card max-w-2xl space-y-5 p-6">
        {formError && <Alert>{formError}</Alert>}

        <Input id="profile-name" name="name" label="Full name" value={values.name} onChange={handleChange} error={errors.name} required />
        <Input label="Email" icon={Mail} value={user.email} disabled readOnly hint="Your email is your login and cannot be changed here." />
        <Input id="profile-college" name="college" label="College" placeholder="Your college or university" value={values.college} onChange={handleChange} error={errors.college} />

        <div>
          <Input
            id="profile-skills"
            name="skills"
            label="Skills"
            placeholder="React, Node.js, Python"
            value={values.skills}
            onChange={handleChange}
            error={errors.skills}
            hint="Separate skills with commas. They are used to recommend internships."
          />
          {skillPreview.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills preview">
              {skillPreview.map((skill) => (
                <li key={skill} className="rounded-md bg-brand/15 px-2 py-0.5 text-xs text-violet-200">{skill}</li>
              ))}
            </ul>
          )}
        </div>

        <Input
          id="profile-resumeUrl"
          name="resumeUrl"
          type="url"
          label="Resume link"
          placeholder="https://drive.google.com/..."
          value={values.resumeUrl}
          onChange={handleChange}
          error={errors.resumeUrl}
          hint="A public link (Google Drive, Dropbox, your website). Used as the default when you apply."
        />
        <Textarea id="profile-bio" name="bio" label="Short bio" rows={5} maxLength={1000} placeholder="Tell recruiters a little about yourself..." value={values.bio} onChange={handleChange} error={errors.bio} />

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" loading={saving} disabled={!isDirty}>Save changes</Button>
          {isDirty && (
            <Button variant="ghost" onClick={() => { setValues(toForm(user)); setErrors({}); setFormError(''); }} disabled={saving}>
              Discard changes
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
