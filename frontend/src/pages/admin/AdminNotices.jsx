import { useState } from 'react';
import { notices as defaults } from '../../data/siteData';
import { readStore, writeStore, uploadAsset } from '../../utils/storage';
const blank = { title: '', body: '', type: 'Announcement', attachment: '', published: true };
export default function AdminNotices() {
  const [items, setItems] = useState(() => readStore('notices', defaults).map((item, index) => ({ ...item, id: item.id || `notice-${index}` })));
  const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const save = async event => {
    event.preventDefault();
    const now = new Date();
    const record = { ...form, date: now.toLocaleDateString('en-IN'), createdAt: editing ? (items.find(item => item.id === editing)?.createdAt || now.toISOString()) : now.toISOString(), id: editing || crypto.randomUUID() };
    const next = editing ? items.map(item => item.id === editing ? record : item) : [record, ...items];
    setSaving(true); setError('');
    try { await writeStore('notices', next); setItems(next); setForm(blank); setEditing(null); }
    catch (err) { setError(err.message || 'Could not save this notice.'); }
    finally { setSaving(false); }
  };
  const remove = async id => {
    if (!window.confirm('Delete this notice permanently?')) return;
    const next = items.filter(item => item.id !== id); setError('');
    try { await writeStore('notices', next); setItems(next); }
    catch (err) { setError(err.message || 'Could not delete this notice.'); }
  };
  const upload = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setError('');
    try { const result = await uploadAsset(file); setForm(current => ({ ...current, attachment: result.url })); }
    catch (err) { setError(err.message || 'Attachment upload failed.'); }
    finally { setUploading(false); event.target.value = ''; }
  };
  return <div className="page-enter"><div className="admin-page-heading"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h1>Notices & Updates</h1><p>Create, edit, publish or unpublish announcements and attach PDF/image files.</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <form className="admin-panel notice-editor" onSubmit={save}><h3>{editing ? 'Edit notice' : 'Create notice'}</h3><input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Notice title" required/><select value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}><option>Announcement</option><option>Admission</option><option>Academic</option><option>Update</option><option>Exam</option><option>Holiday</option></select><textarea value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} placeholder="Notice description" required/><label>Attachment URL<input value={form.attachment} onChange={event => setForm({ ...form, attachment: event.target.value })} placeholder="Optional file URL"/></label><label>Upload PDF / image<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading}/></label>{form.attachment && <a href={form.attachment} target="_blank" rel="noreferrer">Preview attachment</a>}<label className="check-label"><input type="checkbox" checked={!!form.published} onChange={event => setForm({ ...form, published: event.target.checked })}/> Publish this notice</label><button className="admin-action" disabled={uploading || saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish notice'}</button>{editing && <button type="button" className="admin-secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel edit</button>}</form>
    <div className="admin-course-list">{items.map(item => <article key={item.id}><div><b>{item.title}</b><small>{item.date} · {item.type} · {item.published === false ? 'Draft' : 'Published'}</small><p>{item.body || item.description}</p>{item.attachment && <a href={item.attachment} target="_blank" rel="noreferrer">Open attachment</a>}</div><div className="admin-row-actions"><button onClick={() => { setEditing(item.id); setForm({ ...blank, ...item, body: item.body || item.description || '' }); }}>Edit</button><button onClick={() => remove(item.id)}>Delete</button></div></article>)}</div>
  </div>;
}
