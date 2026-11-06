import { useMemo, useState } from 'react';
import { getQuestions, saveQuestions, getPracticeSets, savePracticeSets, getAttempts } from '../../services/practiceService';
import { Plus, Trash2, BookOpenCheck } from 'lucide-react';
const blank = { question: '', options: ['', '', '', ''], answer: 0, explanation: '', subject: 'Mathematics', topic: '', difficulty: 'Medium', className: '10' };
export default function AdminPractice() {
  const [questions, setQuestions] = useState(getQuestions);
  const [sets, setSets] = useState(getPracticeSets);
  const [attempts] = useState(getAttempts);
  const [q, setQ] = useState(blank); const [editing, setEditing] = useState(null);
  const [cfg, setCfg] = useState({ title: 'Practice Set 1', subject: 'Mathematics', topic: '', className: '10', count: 10, time: 15, marks: 1, negative: false });
  const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const update = (key, value) => setQ(current => ({ ...current, [key]: value }));
  const add = async () => {
    if (!q.question.trim() || q.options.some(option => !option.trim())) return setError('Question and all four options are required.');
    const next = editing ? questions.map(item => item.id === editing ? { ...q, id: editing } : item) : [{ ...q, id: crypto.randomUUID() }, ...questions];
    setSaving(true); setError(''); setMessage('');
    try { await saveQuestions(next); setQuestions(next); setQ(blank); setEditing(null); setMessage('Question saved to the database.'); }
    catch (err) { setError(err.message || 'Could not save the question.'); }
    finally { setSaving(false); }
  };
  const publish = async () => {
    const selected = questions.filter(item => (!cfg.subject || item.subject === cfg.subject) && (!cfg.topic || item.topic === cfg.topic) && (!cfg.className || String(item.className) === String(cfg.className)));
    if (!selected.length) return setError('Add questions matching this subject, topic and class first.');
    const next = [{ ...cfg, id: crypto.randomUUID(), questionIds: selected.slice(0, Number(cfg.count)).map(item => item.id), published: true, createdAt: new Date().toISOString() }, ...sets];
    setSaving(true); setError(''); setMessage('');
    try { await savePracticeSets(next); setSets(next); setMessage('Practice set published successfully.'); }
    catch (err) { setError(err.message || 'Could not publish this practice set.'); }
    finally { setSaving(false); }
  };
  const changeSets = async next => {
    setSaving(true); setError(''); setMessage('');
    try { await savePracticeSets(next); setSets(next); }
    catch (err) { setError(err.message || 'Could not update practice sets.'); }
    finally { setSaving(false); }
  };
  const changeQuestions = async next => {
    setSaving(true); setError(''); setMessage('');
    try { await saveQuestions(next); setQuestions(next); }
    catch (err) { setError(err.message || 'Could not update the question bank.'); }
    finally { setSaving(false); }
  };
  const topics = useMemo(() => [...new Set(questions.map(item => item.topic).filter(Boolean))], [questions]);
  return <div className="page-enter"><div className="admin-page-heading"><div><span className="eyebrow">LEARNING TOOLS</span><h1>Question Practice</h1><p>Create MCQs and publish timed practice sets.</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
    <div className="practice-admin-grid"><section className="admin-panel"><h3><Plus size={18}/> Add MCQ</h3><div className="practice-form"><textarea placeholder="Write the question" value={q.question} onChange={event => update('question', event.target.value)}/>{q.options.map((value, index) => <input key={index} placeholder={`Option ${index + 1}`} value={value} onChange={event => update('options', q.options.map((option, optionIndex) => optionIndex === index ? event.target.value : option))}/ >)}<label>Correct option<select value={q.answer} onChange={event => update('answer', Number(event.target.value))}>{q.options.map((_, index) => <option key={index} value={index}>Option {index + 1}</option>)}</select></label><textarea placeholder="Explanation" value={q.explanation} onChange={event => update('explanation', event.target.value)}/><div className="practice-two"><input placeholder="Subject" value={q.subject} onChange={event => update('subject', event.target.value)}/><input placeholder="Topic" value={q.topic} onChange={event => update('topic', event.target.value)}/></div><div className="practice-two"><select value={q.difficulty} onChange={event => update('difficulty', event.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select><input placeholder="Class" value={q.className} onChange={event => update('className', event.target.value)}/></div><button className="submit-button" onClick={add} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Question' : 'Save Question'}</button>{editing && <button className="admin-secondary" onClick={() => { setEditing(null); setQ(blank); }}>Cancel edit</button>}</div></section>
      <section className="admin-panel"><h3><BookOpenCheck size={18}/> Publish practice set</h3><div className="practice-form"><input value={cfg.title} onChange={event => setCfg({ ...cfg, title: event.target.value })} placeholder="Set title"/><input value={cfg.subject} onChange={event => setCfg({ ...cfg, subject: event.target.value })} placeholder="Subject"/><input value={cfg.topic} onChange={event => setCfg({ ...cfg, topic: event.target.value })} placeholder="Topic (optional)"/><input value={cfg.className} onChange={event => setCfg({ ...cfg, className: event.target.value })} placeholder="Class"/><div className="practice-two"><input type="number" min="1" value={cfg.count} onChange={event => setCfg({ ...cfg, count: event.target.value })} placeholder="Questions"/><input type="number" min="1" value={cfg.time} onChange={event => setCfg({ ...cfg, time: event.target.value })} placeholder="Minutes"/></div><div className="practice-two"><input type="number" min="1" value={cfg.marks} onChange={event => setCfg({ ...cfg, marks: event.target.value })} placeholder="Marks/question"/><label className="check-label"><input type="checkbox" checked={cfg.negative} onChange={event => setCfg({ ...cfg, negative: event.target.checked })}/> Negative marking</label></div><button className="submit-button" onClick={publish} disabled={saving}>Publish Set</button><p className="muted">Available topics: {topics.join(', ') || 'Add questions to see topics'}</p></div></section></div>
    <section className="admin-panel practice-list-panel"><h3>Question bank ({questions.length})</h3>{questions.map(item => <article className="practice-admin-row" key={item.id}><div><b>{item.question}</b><small>{item.subject} · {item.topic} · {item.difficulty}</small></div><div className="admin-row-actions"><button onClick={() => { setQ({ ...item, options: [...item.options] }); setEditing(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button><button onClick={() => changeQuestions(questions.filter(row => row.id !== item.id))} disabled={saving} aria-label="Delete question"><Trash2/></button></div></article>)}</section>
    <section className="admin-panel practice-list-panel"><h3>Published sets ({sets.length})</h3>{sets.map(set => <article className="practice-admin-row" key={set.id}><div><b>{set.title}</b><small>{set.subject} · {set.questionIds.length} questions · {set.time} min · {set.marks} marks each</small></div><div className="admin-row-actions"><button disabled={saving} onClick={() => changeSets(sets.map(row => row.id === set.id ? { ...row, published: !row.published } : row))}>{set.published === false ? 'Publish' : 'Unpublish'}</button><button disabled={saving} onClick={() => changeSets(sets.filter(row => row.id !== set.id))} aria-label="Delete set"><Trash2/></button></div></article>)}</section>
    <section className="admin-panel practice-list-panel"><h3>Student practice attempts ({attempts.length})</h3>{attempts.map(attempt => <article className="practice-admin-row" key={attempt.id}><div><b>{attempt.setTitle}</b><small>{attempt.user || 'Guest'} · {new Date(attempt.completedAt).toLocaleString()}</small></div><strong>{attempt.score} marks · {attempt.accuracy}% accuracy</strong></article>)}{!attempts.length && <p className="muted">No practice attempts yet.</p>}</section>
  </div>;
}
