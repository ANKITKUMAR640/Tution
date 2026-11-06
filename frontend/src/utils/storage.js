const KEYS = {
  admissions: 'becc_admissions', courses: 'becc_courses', notices: 'becc_notices',
  faculty: 'becc_faculty', messages: 'becc_messages', admin: 'becc_admin_session'
};
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      'X-BECC-Request': '1',
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function readStore(key, fallback = []) {
  try {
    const raw = localStorage.getItem(KEYS[key] || key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}

// Admin data is committed to PostgreSQL first. The browser cache changes only after success.
export async function writeStore(key, value) {
  await request(`/admin/content/${encodeURIComponent(key)}`, {
    method: 'PUT', body: JSON.stringify({ data: value })
  });
  localStorage.setItem(KEYS[key] || key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('becc-data-change', { detail: { key } }));
  return value;
}

export async function addStoreItem(key, item) {
  const endpoint = key === 'admissions' ? '/public/admissions' : key === 'messages' ? '/public/messages' : null;
  if (!endpoint) throw new Error(`Adding records to ${key} is not supported through this form.`);
  const { item: saved } = await request(endpoint, { method: 'POST', body: JSON.stringify(item) });
  const current = readStore(key, []);
  localStorage.setItem(KEYS[key] || key, JSON.stringify([saved, ...current.filter(row => row.id !== saved.id)]));
  window.dispatchEvent(new CustomEvent('becc-data-change', { detail: { key } }));
  return saved;
}

export async function removeStoreItem(key, id) {
  const next = readStore(key, []).filter(item => item.id !== id);
  return writeStore(key, next);
}

export async function updateStoreItem(key, id, changes) {
  const next = readStore(key, []).map(item => item.id === id ? { ...item, ...changes } : item);
  return writeStore(key, next);
}

export async function hydrateFromApi() {
  const { data = {} } = await request('/public/bootstrap');
  const publicKeys = ['courses', 'notices', 'faculty', 'practice_questions', 'practice_sets', 'content_home', 'content_about', 'content_courses', 'content_faculty', 'content_results', 'content_contact', 'content_testimonials', 'settings', 'results'];
  publicKeys.forEach(key => { if (Object.hasOwn(data, key)) localStorage.setItem(KEYS[key] || key, JSON.stringify(data[key])); else localStorage.removeItem(KEYS[key] || key); });
  return data;
}

export async function apiRequest(path, options = {}) {
  return request(path, options);
}

export async function uploadAsset(file) {
  const form = new FormData();
  form.append('file', file);
  const result = await request('/admin/upload', { method: 'POST', body: form });
  return { ...result, url: result.url.startsWith('http') ? result.url : `${API_BASE}${result.url}` };
}

export async function hydrateAdminFromApi() {
  const { data = {} } = await request('/admin/bootstrap');
  const adminKeys = ['admissions', 'courses', 'notices', 'faculty', 'messages', 'practice_questions', 'practice_sets', 'practice_attempts', 'content_home', 'content_about', 'content_courses', 'content_faculty', 'content_results', 'content_contact', 'content_testimonials', 'settings', 'results'];
  adminKeys.forEach(key => { if (Object.hasOwn(data, key)) localStorage.setItem(KEYS[key] || key, JSON.stringify(data[key])); else localStorage.removeItem(KEYS[key] || key); });
  const { attempts = [] } = await request('/admin/attempts');
  localStorage.setItem('practice_attempts', JSON.stringify(attempts));
  return data;
}

export async function hydrateStudentSession() {
  try {
    const { user } = await request('/auth/student/me');
    localStorage.setItem('becc_user_session', JSON.stringify(user));
    const { attempts = [] } = await request('/auth/student/attempts');
    localStorage.setItem('practice_attempts', JSON.stringify(attempts));
    return user;
  } catch (error) {
    if (error.status === 401) {
      localStorage.removeItem('becc_user_session');
      return null;
    }
    throw error;
  }
}
