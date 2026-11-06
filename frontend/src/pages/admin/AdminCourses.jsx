import { useState } from 'react';
import { courses as defaults } from '../../data/siteData';
import { readStore, writeStore, uploadAsset } from '../../utils/storage';
const blank = { title: '', subtitle: '', category: 'School Tuition', subjects: '', description: '', image: '', published: true };
export default function AdminCourses() {
  const [items, setItems] = useState(() => readStore('courses', defaults));
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async event => {
    event?.preventDefault?.();
    if (!form.title.trim()) return setError('Enter a course name.');
    const title = form.title.trim();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const record = { ...form, title, slug, id: editing || crypto.randomUUID(), subtitle: form.subtitle || 'Course details', subjects: form.subjects || 'Details to be added', description: form.description || 'Course description to be added.' };
    const next = editing ? items.map(item => item.id === editing ? record : item) : [record, ...items];
    setSaving(true); setError('');
    try { await writeStore('courses', next); setItems(next); setForm(blank); setEditing(null); }
    catch (err) { setError(err.message || 'Could not save this course.'); }
    finally { setSaving(false); }
  };
  const remove = async id => {
    if (!window.confirm('Delete this course permanently?')) return;
    const next = items.filter(item => item.id !== id); setError('');
    try { await writeStore('courses', next); setItems(next); }
    catch (err) { setError(err.message || 'Could not delete this course.'); }
  };
  const upload = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setError('');
    try { const result = await uploadAsset(file); setForm(current => ({ ...current, image: result.url })); }
    catch (err) { setError(err.message || 'Image upload failed.'); }
    finally { setUploading(false); event.target.value = ''; }
  };
  return <div className="page-enter"><div className="admin-page-heading"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h1>Courses</h1><p>Manage course names, categories, descriptions, subjects and images.</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <form className="admin-panel content-form" onSubmit={save}><h3>{editing ? 'Edit course' : 'Add course'}</h3><input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Course name" required/><input value={form.subtitle} onChange={event => setForm({ ...form, subtitle: event.target.value })} placeholder="Subtitle / board / exam"/><select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}><option>School Tuition</option><option>Competitive Exams</option></select><input value={form.subjects} onChange={event => setForm({ ...form, subjects: event.target.value })} placeholder="Subjects covered"/><textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Course details / description"/><input value={form.image} onChange={event => setForm({ ...form, image: event.target.value })} placeholder="Image URL"/><label>Upload course image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading}/></label>{form.image && <img src={form.image} alt="Course preview" style={{ width: 180, height: 110, objectFit: 'cover', borderRadius: 10 }}/>}<label className="check-label"><input type="checkbox" checked={!!form.published} onChange={event => setForm({ ...form, published: event.target.checked })}/> Publish course</label><button className="admin-action" disabled={uploading || saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add course +'}</button>{editing && <button type="button" className="admin-secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</form>
    <div className="admin-course-list">{items.map(course => <article key={course.id}>{course.image && <img src={course.image} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8 }}/>}<div><b>{course.title}</b><small>{course.category} · {course.subtitle} · {course.published === false ? 'Draft' : 'Published'}</small><p>{course.description}</p></div><div className="admin-row-actions"><button onClick={() => { setEditing(course.id); setForm({ ...blank, ...course }); }}>Edit</button><button onClick={() => remove(course.id)}>Delete</button></div></article>)}</div>
  </div>;
}
