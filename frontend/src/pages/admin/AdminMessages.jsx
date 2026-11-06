import { useState } from 'react';
import { readStore, writeStore } from '../../utils/storage';

export default function AdminMessages() {
  const [items, setItems] = useState(() => readStore('messages', []));
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const remove = async id => {
    if (!window.confirm('Delete this contact message permanently?')) return;
    setBusyId(id); setError('');
    const next = items.filter(item => item.id !== id);
    try { await writeStore('messages', next); setItems(next); }
    catch (err) { setError(err.message || 'Could not delete the message.'); }
    finally { setBusyId(''); }
  };

  return <div className="page-enter">
    <div className="admin-page-heading"><div><span className="eyebrow">ENQUIRY INBOX</span><h1>Contact Messages</h1><p>Messages submitted through the public Contact page.</p></div><span className="count-chip">{items.length} messages</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="admin-panel">
      {items.map(item => <article className="admin-list-row" key={item.id}>
        <div><b>{item.name}</b><small>{item.mobile} · {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : ''}</small><p>{item.message}</p></div>
        <button className="admin-secondary" onClick={() => remove(item.id)} disabled={busyId === item.id}>{busyId === item.id ? 'Deleting…' : 'Delete'}</button>
      </article>)}
      {!items.length && <div className="empty-admin"><p>No contact messages have been received yet.</p></div>}
    </section>
  </div>;
}
