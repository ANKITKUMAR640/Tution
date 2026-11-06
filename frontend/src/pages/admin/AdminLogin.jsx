import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { apiRequest, hydrateAdminFromApi } from '../../utils/storage';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
      await hydrateAdminFromApi();
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in. Check the API and credentials.');
    } finally { setLoading(false); }
  };

  return <div className="admin-login-page"><section className="admin-login-card">
    <div className="admin-login-mark"><LockKeyhole /></div>
    <span className="eyebrow">BECC MANAGEMENT</span>
    <h1>Administrator Login</h1>
    <p>Sign in with the administrator account configured for this institute.</p>
    <form className="content-form" onSubmit={submit}>
      <label>Admin email<input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></label>
      <label>Password<span className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="submit-button" disabled={loading}>{loading ? 'Signing in…' : 'Secure Admin Login ↗'}</button>
    </form>
    <Link to="/">← Back to website</Link>
  </section></div>;
}
