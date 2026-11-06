import { readStore, writeStore, apiRequest } from '../utils/storage';

export const getQuestions = () => readStore('practice_questions', []);
export const saveQuestions = items => writeStore('practice_questions', items);
export const getPracticeSets = () => readStore('practice_sets', []);
export const savePracticeSets = items => writeStore('practice_sets', items);
export const getAttempts = () => readStore('practice_attempts', []);

export async function saveAttempt(attempt) {
  const { attempt: saved } = await apiRequest('/public/practice-attempts', {
    method: 'POST', body: JSON.stringify(attempt)
  });
  const next = [saved, ...getAttempts().filter(item => item.id !== saved.id)];
  localStorage.setItem('practice_attempts', JSON.stringify(next));
  return next;
}

export const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem('becc_user_session') || 'null'); }
  catch { return null; }
};
