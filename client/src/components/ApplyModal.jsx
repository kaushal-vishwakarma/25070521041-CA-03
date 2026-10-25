import { useState } from 'react';
import Modal from './ui/Modal.jsx';
import Button from './ui/Button.jsx';
import Input from './ui/Input.jsx';
import Textarea from './ui/Textarea.jsx';
import Alert from './ui/Alert.jsx';
import useToast from '../hooks/useToast.js';
import { applyToInternship } from '../services/applicationService.js';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { validateApplication } from '../utils/validators.js';

// Cover letter + resume link form shown when a student presses "Apply Now".
// onApplied() runs after the server accepted the application.
export default function ApplyModal({ open, onClose, internship, defaultResumeUrl = '', onApplied }) {
  const toast = useToast();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState(defaultResumeUrl);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateApplication({ coverLetter, resumeUrl });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFormError('');
    try {
      await applyToInternship(internship._id, { coverLetter: coverLetter.trim(), resumeUrl: resumeUrl.trim() });
      toast.success('Application submitted! You can track it in your dashboard.');
      onApplied();
    } catch (err) {
      // The server is the final judge: closed listing, passed deadline, duplicate application...
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={`Apply to ${internship.title}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" form="apply-form" loading={submitting}>Submit application</Button>
        </>
      }
    >
      <form id="apply-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        <p className="text-sm text-muted">
          Applying to <span className="font-medium text-white">{internship.companyName}</span>. You can apply only once to each internship.
        </p>
        {formError && <Alert>{formError}</Alert>}
        <Textarea
          label="Cover letter (optional)"
          rows={6}
          maxLength={2000}
          placeholder="Tell the recruiter why you are a good fit..."
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          error={errors.coverLetter}
        />
        <Input
          label="Resume link"
          type="url"
          placeholder="https://drive.google.com/..."
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
          error={errors.resumeUrl}
          hint="A public link to your resume. Leave empty to use the one on your profile."
        />
      </form>
    </Modal>
  );
}
