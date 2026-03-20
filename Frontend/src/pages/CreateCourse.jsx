import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../services/course.service';
import PageHeader from '../components/common/PageHeader';

const steps = ['Basic Info', 'Curriculum Setup', 'Pricing', 'Review'];
const levels = ['beginner', 'intermediate', 'advanced'];

function CreateCourse() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', category: '', level: 'beginner', language: 'English', thumbnailUrl: '', isPaid: false, price: '', currency: 'INR' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(() => ({ ...form, price: form.isPaid ? Number(form.price || 0) : 0 }), [form]);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep = () => {
    if (step === 0 && (!form.title.trim() || !form.description.trim())) return 'Title and description are required';
    if (step === 2 && form.isPaid && (!form.price || Number(form.price) <= 0)) return 'Paid courses require a valid price';
    return '';
  };

  const next = () => {
    const message = validateStep();
    if (message) return setError(message);
    setError('');
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = validateStep();
    if (message) return setError(message);
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await createCourse(summary);
      setSuccess('Course created successfully. Redirecting to your course library...');
      setTimeout(() => navigate('/courses'), 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Create Course" />
      <div className="card wizard-shell">
        <div className="wizard-steps">{steps.map((label, index) => <button key={label} type="button" className={`wizard-step ${index === step ? 'active' : index < step ? 'done' : ''}`} onClick={() => index <= step && setStep(index)}>{index + 1}. {label}</button>)}</div>
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
        <form onSubmit={handleSubmit}>
          {step === 0 && <div className="grid-2"><div className="form-group"><label className="form-label">Course Title</label><input className="form-input" value={form.title} onChange={(e) => update('title', e.target.value)} required /></div><div className="form-group"><label className="form-label">Subtitle</label><input className="form-input" value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} /></div><div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category} onChange={(e) => update('category', e.target.value)} /></div><div className="form-group"><label className="form-label">Level</label><select className="form-select" value={form.level} onChange={(e) => update('level', e.target.value)}>{levels.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div className="form-group"><label className="form-label">Language</label><input className="form-input" value={form.language} onChange={(e) => update('language', e.target.value)} /></div><div className="form-group"><label className="form-label">Thumbnail URL</label><input className="form-input" value={form.thumbnailUrl} onChange={(e) => update('thumbnailUrl', e.target.value)} /></div><div className="form-group full-width"><label className="form-label">Description</label><textarea className="form-textarea" rows={6} value={form.description} onChange={(e) => update('description', e.target.value)} required /></div></div>}
          {step === 1 && <div className="grid-2"><div className="card"><h3>Curriculum Strategy</h3><p>After creation, you can open the course builder to add modules, lessons, quizzes, and assignments using the existing builder workflow.</p></div><div className="card"><h3>Publishing Flow</h3><p>Draft / Review / Approval / Publish. Teachers build content first, then submit for admin approval from the course list.</p></div></div>}
          {step === 2 && <div className="grid-2"><div className="form-group"><label className="form-label">Course Type</label><select className="form-select" value={form.isPaid ? 'paid' : 'free'} onChange={(e) => update('isPaid', e.target.value === 'paid')}><option value="free">Free</option><option value="paid">Paid</option></select></div><div className="form-group"><label className="form-label">Currency</label><input className="form-input" value={form.currency} onChange={(e) => update('currency', e.target.value.toUpperCase())} /></div>{form.isPaid && <div className="form-group"><label className="form-label">Price</label><input className="form-input" type="number" min="1" value={form.price} onChange={(e) => update('price', e.target.value)} /></div>}</div>}
          {step === 3 && <div className="grid-2"><div className="card"><p className="stat-label">Course</p><h3>{summary.title || 'Untitled Course'}</h3><p>{summary.subtitle || 'No subtitle yet'}</p><p>{summary.description || 'No description yet'}</p></div><div className="card"><p className="stat-label">Commercial Setup</p><h3>{summary.isPaid ? `Paid - ${summary.currency} ${summary.price}` : 'Free Course'}</h3><p>{summary.category || 'General'} / {summary.level}</p><p>{summary.language}</p></div></div>}
          <div className="wizard-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setStep((value) => Math.max(value - 1, 0))} disabled={step === 0}>Back</button>
            {step < steps.length - 1 ? <button type="button" className="btn btn-primary" onClick={next}>Continue</button> : <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Course'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;

