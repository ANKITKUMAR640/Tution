import { useState } from 'react';
import { readStore, writeStore } from '../../utils/storage';

export default function AdminAdmissions() {
  const [items, setItems] = useState(() => readStore('admissions', []));
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const update = async (id, status) => {
    setBusyId(id); setError('');
    const next = items.map(item => item.id === id ? { ...item, status } : item);
    try { await writeStore('admissions', next); setItems(next); }
    catch (err) { setError(err.message || 'Could not update admission status.'); }
    finally { setBusyId(''); }
  };
  const remove = async id => {
    if (!window.confirm('Delete this admission enquiry permanently?')) return;
    setBusyId(id); setError('');
    const next = items.filter(item => item.id !== id);
    try { await writeStore('admissions', next); setItems(next); }
    catch (err) { setError(err.message || 'Could not delete the enquiry.'); }
    finally { setBusyId(''); }
  };
  return <div className="page-enter"><div className="admin-page-heading"><div><span className="eyebrow">STUDENT MANAGEMENT</span><h1>Admission Enquiries</h1><p>Review and update enquiries submitted from the website.</p></div><span className="count-chip">{items.length} records</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="admin-table-wrap"><table><thead><tr><th>Student</th><th>Father's Name</th><th>Mobile</th><th>Class / Course</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {items.map(item => <tr key={item.id}><td><b>{item.studentName}</b></td><td>{item.fatherName}</td><td>{item.mobile}</td><td>{item.className}</td><td><select value={item.status || 'New'} disabled={busyId === item.id} onChange={event => update(item.id, event.target.value)}><option>New</option><option>Contacted</option><option>Interested</option><option>Converted</option><option>Not Interested</option></select></td><td><button className="admin-secondary" onClick={() => remove(item.id)} disabled={busyId === item.id}>{busyId === item.id ? 'Saving…' : 'Delete'}</button></td></tr>)}
    </tbody></table>{!items.length && <div className="empty-admin"><p>No enquiries yet. New admission forms will appear here.</p></div>}</div>
  </div>;
}
