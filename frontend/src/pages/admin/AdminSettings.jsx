import { useState } from 'react';
import { institute as defaults } from '../../data/siteData';
import { readStore, writeStore } from '../../utils/storage';
export default function AdminSettings() {
  const [form, setForm] = useState(() => readStore('settings', [defaults])[0] || defaults);
  const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const save = async event => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try { await writeStore('settings', [form]); setMessage('Institute settings saved successfully.'); }
    catch (err) { setError(err.message || 'Could not save institute settings.'); }
    finally { setSaving(false); }
  };
  return <div className="page-enter"><div className="admin-page-heading"><div><span className="eyebrow">CONFIGURATION</span><h1>Institute Settings</h1><p>Update the institute information shown across the public website.</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
    <form className="admin-panel content-form" onSubmit={save}><h3>Public institute details</h3>{Object.entries({ name: 'Institute name', shortName: 'Short name', address: 'Full address', phone: 'Contact number', email: 'Email address', established: 'Established year', timings: 'Class timings' }).map(([key, label]) => <label key={key}>{label}<input value={form[key] || ''} onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} required/></label>)}<button className="admin-action" disabled={saving}>{saving ? 'Saving…' : 'Save institute details'}</button></form>
    <div className="admin-tip"><b>Security:</b> Administrator passwords are managed through the backend environment and are never stored in website settings.</div>
  </div>;
}
