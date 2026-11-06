import { useState } from 'react';
import { faculty as defaults } from '../../data/siteData';
import { readStore, writeStore, uploadAsset } from '../../utils/storage';
const blank = { name: '', subject: '', qualification: '', graduation: '', masters: '', bed: '', phd: '', institution: '', experience: '', role: '', bio: '', image: '', published: true };
const fields = [['name', 'Teacher name'], ['subject', 'Subject'], ['qualification', 'Highest qualification'], ['graduation', 'Graduation'], ['masters', 'Masters'], ['bed', 'B.Ed'], ['phd', 'PhD'], ['institution', 'Institution'], ['experience', 'Experience'], ['role', 'Role / designation'], ['bio', 'Short biography']];
export default function AdminFaculty() {
  const [items, setItems] = useState(() => readStore('faculty', defaults).map((item, index) => ({ ...item, id: item.id || `faculty-${index}` })));
  const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const save = async event => {
    event.preventDefault();
    const record = { ...form, id: editing || crypto.randomUUID() };
    const next = editing ? items.map(item => item.id === editing ? record : item) : [record, ...items];
    setSaving(true); setError('');
    try { await writeStore('faculty', next); setItems(next); setForm(blank); setEditing(null); }
    catch (err) { setError(err.message || 'Could not save faculty details.'); }
    finally { setSaving(false); }
  };
  const remove = async id => {
    if (!window.confirm('Delete this faculty profile permanently?')) return;
    const next = items.filter(item => item.id !== id); setError('');
    try { await writeStore('faculty', next); setItems(next); }
    catch (err) { setError(err.message || 'Could not delete faculty profile.'); }
  };
  const upload = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setError('');
    try { const result = await uploadAsset(file); setForm(current => ({ ...current, image: result.url })); }
    catch (err) { setError(err.message || 'Photo upload failed.'); }
    finally { setUploading(false); event.target.value = ''; }
  };
  return <div className="page-enter"><div className="admin-page-heading"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h1>Faculty</h1><p>Manage teacher profiles, qualifications, experience and photos. Enter only verified details.</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <form className="admin-panel content-form" onSubmit={save}><h3>{editing ? 'Edit faculty' : 'Add faculty member'}</h3>{fields.map(([key, label]) => key === 'bio' ? <textarea key={key} placeholder={label} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })}/> : <input key={key} placeholder={label} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} required={['name', 'subject'].includes(key)}/>)}<input placeholder="Photo URL" value={form.image} onChange={event => setForm({ ...form, image: event.target.value })}/><label>Upload faculty photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading}/></label>{form.image && <img src={form.image} alt="Faculty preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12 }}/>}<label className="check-label"><input type="checkbox" checked={!!form.published} onChange={event => setForm({ ...form, published: event.target.checked })}/> Publish profile</label><button className="admin-action" disabled={uploading || saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add faculty'}</button>{editing && <button type="button" className="admin-secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</form>
    <div className="admin-course-list">{items.map(item => <article key={item.id || item.name}>{item.image && <img src={item.image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }}/>}<div><b>{item.name}</b><small>{item.subject} · {item.qualification} · {item.experience} · {item.published === false ? 'Draft' : 'Published'}</small><p>{item.bio}</p></div><div className="admin-row-actions"><button onClick={() => { setEditing(item.id); setForm({ ...blank, ...item }); }}>Edit</button><button onClick={() => remove(item.id)}>Delete</button></div></article>)}</div>
  </div>;
}
