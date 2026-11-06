import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { readStore, writeStore, uploadAsset } from '../../utils/storage';
const titles = { home: 'Home Page Content', about: 'About Content', courses: 'Course Content', faculty: 'Faculty Content', results: 'Results Content', contact: 'Contact Information', testimonials: 'Testimonials' };
const blank = { title: '', description: '', image: '', published: true };
export default function ContentManager() {
  const { section } = useParams(); const key = `content_${section}`;
  const [items, setItems] = useState(() => readStore(key, []));
  const [form, setForm] = useState(blank); const [edit, setEdit] = useState(null);
  const [uploading, setUploading] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const save = async event => {
    event.preventDefault();
    const record = { ...form, id: edit || crypto.randomUUID() };
    const next = edit ? items.map(item => item.id === edit ? record : item) : [record, ...items];
    setSaving(true); setError('');
    try { await writeStore(key, next); setItems(next); setForm(blank); setEdit(null); }
    catch (err) { setError(err.message || 'Could not save website content.'); }
    finally { setSaving(false); }
  };
  const remove = async id => {
    if (!window.confirm('Delete this content item permanently?')) return;
    const next = items.filter(item => item.id !== id); setError('');
    try { await writeStore(key, next); setItems(next); }
    catch (err) { setError(err.message || 'Could not delete this content item.'); }
  };
  const upload = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setError('');
    try { const result = await uploadAsset(file); setForm(current => ({ ...current, image: result.url })); }
    catch (err) { setError(err.message || 'Image upload failed.'); }
    finally { setUploading(false); event.target.value = ''; }
  };
  return <div className="page-enter"><div className="admin-page-heading"><div><span className="eyebrow">WEBSITE MANAGEMENT</span><h1>{titles[section] || 'Website Content'}</h1><p>Add, edit, publish and remove content records for this section.</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <form className="admin-panel content-form" onSubmit={save}><h3>{edit ? 'Edit content' : 'Add content'}</h3><input placeholder="Title / heading" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} required/><textarea placeholder="Description / details" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} required/><input placeholder="Image URL (optional)" value={form.image} onChange={event => setForm({ ...form, image: event.target.value })}/><label>Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading}/></label>{form.image && <img src={form.image} alt="Preview" style={{ width: 180, maxHeight: 120, objectFit: 'cover', borderRadius: 10 }}/>}<label className="check-label"><input type="checkbox" checked={!!form.published} onChange={event => setForm({ ...form, published: event.target.checked })}/> Publish content</label><button className="admin-action" disabled={uploading || saving}>{saving ? 'Saving…' : edit ? 'Save changes' : 'Add item'}</button>{edit && <button type="button" className="admin-secondary" onClick={() => { setEdit(null); setForm(blank); }}>Cancel</button>}</form>
    <div className="admin-course-list">{items.map(item => <article key={item.id}>{item.image && <img src={item.image} alt="" style={{ width: 60, height: 50, objectFit: 'cover', borderRadius: 8 }}/>}<div><b>{item.title}</b><small>{item.published === false ? 'Draft' : 'Published'}</small><p>{item.description}</p></div><div className="admin-row-actions"><button onClick={() => { setEdit(item.id); setForm({ ...blank, ...item }); }}>Edit</button><button onClick={() => remove(item.id)}>Delete</button></div></article>)}</div>
  </div>;
}
