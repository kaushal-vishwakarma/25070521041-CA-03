import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Alert from '../../components/ui/Alert.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import useAuth from '../../hooks/useAuth.js';
import useFetch from '../../hooks/useFetch.js';
import useToast from '../../hooks/useToast.js';
import { createInternship, getInternship, updateInternship } from '../../services/internshipService.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { CATEGORIES, DURATIONS, INTERNSHIP_TYPES, WORK_MODES } from '../../utils/constants.js';
import { EMPTY_INTERNSHIP_FORM, buildInternshipPayload, toFormValues } from '../../utils/internshipForm.js';
import { todayUtc, validateInternship } from '../../utils/validators.js';
import { splitList } from '../../utils/format.js';
import { ROUTES } from '../../utils/routes.js';

// The form itself. It is mounted only after any existing data has loaded, so its starting values are final.
function InternshipForm({ internshipId, initialValues }) {
  const isEdit = Boolean(internshipId);
  const navigate = useNavigate();
  const toast = useToast();
  const originalDeadline = isEdit ? initialValues.applicationDeadline : '';

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateInternship(values, { originalDeadline });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`internship-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = buildInternshipPayload(values);
      if (isEdit) await updateInternship(internshipId, payload);
      else await createInternship(payload);
      toast.success(isEdit ? 'Internship updated' : 'Internship posted. Students can apply now.');
      navigate(ROUTES.recruiter.internships);
    } catch (err) {
      setErrors(getFieldErrors(err)); // the server re-validates everything and may report more
      setFormError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const skillPreview = splitList(values.requiredSkills);
  const field = (name) => ({ id: `internship-${name}`, name, value: values[name], onChange: handleChange, error: errors[name] });

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl space-y-6">
      {formError && <Alert>{formError}</Alert>}

      <section className="card space-y-5 p-6" aria-labelledby="basics-heading">
        <h2 id="basics-heading" className="font-semibold text-white">Basics</h2>
        <Input label="Title" placeholder="e.g. React Frontend Intern" required {...field('title')} />
        <Input label="Company name" placeholder="Leave empty to use your company name" hint="Shown on the listing. Defaults to the company in your profile." {...field('companyName')} />
        <Textarea label="Description" rows={6} maxLength={5000} placeholder="What will the intern work on? What will they learn?" required {...field('description')} />
        <Textarea label="Responsibilities" rows={5} placeholder={'One responsibility per line, e.g.\nBuild reusable React components\nFix UI bugs'} hint="One per line, up to 15." {...field('responsibilities')} />
        <div>
          <Input label="Required skills" placeholder="React, JavaScript, Git" hint="Separate skills with commas. Students are matched on these." required {...field('requiredSkills')} />
          {skillPreview.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills preview">
              {skillPreview.map((skill) => <li key={skill} className="rounded-md bg-brand/15 px-2 py-0.5 text-xs text-violet-200">{skill}</li>)}
            </ul>
          )}
        </div>
      </section>

      <section className="card grid gap-5 p-6 sm:grid-cols-2" aria-labelledby="details-heading">
        <h2 id="details-heading" className="font-semibold text-white sm:col-span-2">Details</h2>
        <Select label="Category" placeholder="Select a category" options={CATEGORIES} required {...field('category')} />
        <Select label="Internship type" options={INTERNSHIP_TYPES} {...field('internshipType')} />
        <Input label="Location" placeholder="e.g. Pune, or Remote" required {...field('location')} />
        <Select label="Work mode" placeholder="Select a work mode" options={WORK_MODES} required {...field('workMode')} />
        <Select label="Duration" placeholder="Select a duration" options={DURATIONS} required {...field('duration')} />
        <Input label="Vacancies" type="number" min="1" max="1000" inputMode="numeric" required {...field('vacancies')} />
      </section>

      <section className="card grid gap-5 p-6 sm:grid-cols-2" aria-labelledby="pay-heading">
        <h2 id="pay-heading" className="font-semibold text-white sm:col-span-2">Stipend and deadline</h2>
        <Input label="Minimum stipend (INR per month)" type="number" min="0" step="500" inputMode="numeric" placeholder="0 for unpaid" {...field('stipendMin')} />
        <Input label="Maximum stipend (INR per month)" type="number" min="0" step="500" inputMode="numeric" placeholder="Same as minimum if empty" {...field('stipendMax')} />
        <Input
          className="sm:col-span-2"
          label="Application deadline"
          type="date"
          min={isEdit ? undefined : todayUtc()}
          required
          hint="Students can apply until the end of this day."
          {...field('applicationDeadline')}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Post internship'}</Button>
        <Button to={ROUTES.recruiter.internships} variant="secondary" disabled={saving}>Cancel</Button>
      </div>
    </form>
  );
}

// Used for BOTH /recruiter/internships/new and /recruiter/internships/:id/edit
export default function InternshipFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const { data, loading, error, reload } = useFetch(() => (isEdit ? getInternship(id) : Promise.resolve(null)), [id]);

  const header = (
    <>
      <Link to={ROUTES.recruiter.internships} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> My internships
      </Link>
      <PageHeader
        title={isEdit ? 'Edit internship' : 'Post a new internship'}
        subtitle={isEdit ? 'Changes are visible to students immediately.' : 'Fill in the details. Students will see it as soon as you post it.'}
      />
    </>
  );

  if (isEdit && error) {
    return (<>{header}<ErrorState message={error} onRetry={reload} /></>);
  }
  if (isEdit && (loading || !data || data._id !== id)) {
    return (
      <>
        {header}
        <div className="card max-w-3xl space-y-4 p-6" role="status" aria-label="Loading internship">
          <Skeleton className="h-5 w-1/3" /><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" />
          <span className="sr-only">Loading...</span>
        </div>
      </>
    );
  }
  // Friendly guard. The server enforces ownership as well (403 on save).
  if (isEdit && !data.viewer.isOwner) {
    return (<>{header}<ErrorState message="You can only edit internships that you posted." /></>);
  }

  const initialValues = isEdit ? toFormValues(data) : { ...EMPTY_INTERNSHIP_FORM, companyName: user.companyName || '' };
  return (<>{header}<InternshipForm key={id || 'new'} internshipId={id} initialValues={initialValues} /></>);
}
