import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import { hydrateFromApi, hydrateStudentSession } from './utils/storage';

function showStartupError(error) {
  const root = document.getElementById('root');
  root.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#0b1020;color:#f5f7ff;font-family:Arial,sans-serif">
      <section style="width:min(100%,560px);padding:32px;border:1px solid #34405e;border-radius:20px;background:#121a33">
        <p style="color:#a99aff;letter-spacing:.12em;font-size:12px;font-weight:700">BECC CONNECTION CHECK</p>
        <h1 style="font-size:28px;margin:10px 0">Website backend is not ready</h1>
        <p style="color:#c4cbe0;line-height:1.6">The website has not loaded preview data. Start the PostgreSQL database and BECC API, then retry.</p>
        <pre style="white-space:pre-wrap;color:#ffc8c8;background:#201d31;padding:12px;border-radius:10px">${String(error?.message || 'Unable to connect to the API.').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</pre>
        <button onclick="location.reload()" style="border:0;border-radius:10px;padding:12px 18px;background:#7c5cff;color:white;font-weight:700;cursor:pointer">Retry connection</button>
      </section>
    </main>`;
}

async function start() {
  try {
    await hydrateFromApi();
    await hydrateStudentSession();
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>
    );
  } catch (error) {
    console.error('BECC startup failed:', error);
    showStartupError(error);
  }
}

start();
