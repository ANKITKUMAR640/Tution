import { useState } from 'react';
import { readStore, apiRequest, uploadAsset } from '../../utils/storage';

const blank = {
  studentName: '', className: 'Class 10', examName: 'Board Examination',
  marks: '', totalMarks: '500', year: String(new Date().getFullYear()),
  image: '', rollNumber: '', schoolName: '', remarks: '', published: true
};

export default function AdminResults() {
  const [items, setItems] = useState(() => readStore('results', []));
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const change = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const persist = async next => {
    await apiRequest('/admin/content/results', {
      method: 'PUT',
      body: JSON.stringify({ data: next })
    });
    localStorage.setItem('results', JSON.stringify(next));
    setItems(next);
  };

  const resetForm = () => {
    setForm(blank);
    setEditing(null);
  };

  const save = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    const marks = Number(form.marks);
    const totalMarks = Number(form.totalMarks);
    if (!form.studentName.trim() || !Number.isFinite(marks) || !Number.isFinite(totalMarks) || totalMarks <= 0 || marks < 0 || marks > totalMarks) {
      setError('Enter a student name and valid marks.');
      return;
    }
    const record = {
      ...form,
      studentName: form.studentName.trim(),
      marks,
      totalMarks,
      percentage: Number((marks / totalMarks * 100).toFixed(2)),
      id: editing || crypto.randomUUID(),
      updatedAt: new Date().toISOString()
    };
    const next = editing
      ? items.map(item => item.id === editing ? record : item)
      : [record, ...items];
    setSaving(true);
    try {
      await persist(next);
      setMessage(editing ? 'Student result updated successfully.' : 'Student result added successfully.');
      resetForm();
    } catch (err) {
      setError(err.message || 'Could not save the result. Please check the backend connection.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    if (!window.confirm('Are you sure you want to permanently delete this student result?')) return;
    setError('');
    setMessage('');
    const next = items.filter(item => item.id !== id);
    try {
      await persist(next);
      if (editing === id) resetForm();
      setMessage('Student result deleted successfully.');
    } catch (err) {
      setError(err.message || 'Could not delete the result.');
    }
  };

  const edit = item => {
    setEditing(item.id);
    setForm({ ...blank, ...item, marks: String(item.marks), totalMarks: String(item.totalMarks) });
    setError('');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const upload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadAsset(file);
      change('image', result.url);
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return <div className="page-enter">
    <div className="admin-page-heading">
      <div><span className="eyebrow">STUDENT ACHIEVEMENTS</span><h1>Results Management</h1>
        <p>Add new students, replace old records, edit details, or permanently delete results for Class 10 and Class 12.</p>
      </div>
      <span className="count-chip">{items.length} records</span>
    </div>

    <form className="admin-panel content-form" onSubmit={save}>
      <h3>{editing ? 'Edit / Replace Student Result' : 'Add New Student Result'}</h3>
      <input placeholder="Student full name" value={form.studentName} onChange={e => change('studentName', e.target.value)} required />
      <div className="practice-two">
        <select value={form.className} onChange={e => change('className', e.target.value)}>
          <option>Class 10</option><option>Class 12</option><option>ITI Entrance</option>
          <option>Polytechnic Entrance</option><option>Paramedical Entrance</option><option>Other</option>
        </select>
        <input placeholder="Exam name" value={form.examName} onChange={e => change('examName', e.target.value)} />
      </div>
      <div className="practice-two">
        <input type="number" min="0" placeholder="Marks obtained" value={form.marks} onChange={e => change('marks', e.target.value)} required />
        <input type="number" min="1" placeholder="Total marks" value={form.totalMarks} onChange={e => change('totalMarks', e.target.value)} required />
      </div>
      <div className="practice-two">
        <input placeholder="Passing year" value={form.year} onChange={e => change('year', e.target.value)} />
        <input placeholder="Roll number (optional)" value={form.rollNumber} onChange={e => change('rollNumber', e.target.value)} />
      </div>
      <input placeholder="School / board (optional)" value={form.schoolName} onChange={e => change('schoolName', e.target.value)} />
      <textarea placeholder="Achievement details / remarks" value={form.remarks} onChange={e => change('remarks', e.target.value)} />
      <input placeholder="Student photo URL (optional)" value={form.image} onChange={e => change('image', e.target.value)} />
      <label>Upload student photo<input type="file" accept="image/*" onChange={upload} disabled={uploading} /></label>
      {uploading && <small>Uploading image...</small>}
      {form.image && <img src={form.image} alt="Student preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12 }} />}
      <label className="check-label"><input type="checkbox" checked={!!form.published} onChange={e => change('published', e.target.checked)} /> Publish this result on the public website</label>
      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}
      <button className="admin-action" disabled={saving || uploading}>{saving ? 'Saving...' : editing ? 'Update Student Result' : 'Add Student Result'}</button>
      {editing && <button type="button" className="admin-secondary" onClick={resetForm}>Cancel Edit</button>}
    </form>

    <div className="admin-course-list">
      {items.map(item => <article key={item.id}>
        <div>
          {item.image && <img src={item.image} alt={item.studentName} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, float: 'left', marginRight: 12 }} />}
          <b>{item.studentName}</b>
          <small>{item.className} · {item.examName} · {item.year} · {item.marks}/{item.totalMarks} ({item.percentage}%) · {item.published ? 'Published' : 'Draft'}</small>
          <p>{item.remarks}</p>
        </div>
        <div className="admin-row-actions">
          <button type="button" onClick={() => edit(item)}>Edit / Replace</button>
          <button type="button" onClick={() => remove(item.id)}>Delete</button>
        </div>
      </article>)}
      {!items.length && <p className="admin-panel">No student results have been added yet.</p>}
    </div>
  </div>;
}
