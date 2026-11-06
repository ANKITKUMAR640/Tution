import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Bell, Settings,
  LogOut, ExternalLink, Menu, Home, Info, Trophy, MessageSquare,
  ClipboardList, ChevronDown
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest, hydrateAdminFromApi } from '../../utils/storage';

const links = [
  ['Overview', '/admin', LayoutDashboard],
  ['Admissions', '/admin/admissions', Users],
  ['Courses', '/admin/courses', BookOpen],
  ['Faculty', '/admin/faculty', GraduationCap],
  ['Notices', '/admin/notices', Bell],
  ['Results', '/admin/results', Trophy],
  ['Institute Settings', '/admin/settings', Settings],
  ['Question Practice', '/admin/practice', ClipboardList],
  ['Contact Messages', '/admin/messages', MessageSquare]
];
const contentLinks = [
  ['Home page', '/admin/content/home', Home],
  ['About page', '/admin/content/about', Info],
  ['Contact information', '/admin/content/contact', MessageSquare],
  ['Testimonials', '/admin/content/testimonials', MessageSquare]
];

export default function AdminLayout() {
  const [mobile, setMobile] = useState(false);
  const [contentOpen, setContentOpen] = useState(true);
  const [status, setStatus] = useState('checking');
  const [logoutError, setLogoutError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    apiRequest('/auth/me')
      .then(() => hydrateAdminFromApi())
      .then(() => { if (active) setStatus('ready'); })
      .catch(() => { if (active) { setStatus('denied'); navigate('/admin/login', { replace: true }); } });
    return () => { active = false; };
  }, [navigate]);

  const logout = async () => {
    setLogoutError('');
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
      navigate('/admin/login', { replace: true });
    } catch (error) { setLogoutError(error.message || 'Could not sign out.'); }
  };

  if (status !== 'ready') return <div className="admin-guard"><h2>{status === 'checking' ? 'Checking secure admin session…' : 'Admin sign-in required'}</h2><p>{status === 'checking' ? 'Please wait.' : 'Redirecting to administrator login.'}</p></div>;

  return <div className="admin-shell">
    <aside className={mobile ? 'admin-sidebar show' : 'admin-sidebar'}>
      <div className="admin-brand"><span className="brand-mark">ॐ</span><span><b>BECC</b><small>ADMIN PANEL</small></span></div>
      <p className="sidebar-label">WORKSPACE</p>
      {links.map(([label, path, Icon]) => <NavLink key={path} to={path} end={path === '/admin'} onClick={() => setMobile(false)}><Icon size={18} />{label}</NavLink>)}
      <button className="admin-nav-group" onClick={() => setContentOpen(value => !value)} aria-expanded={contentOpen}><span><Home size={18} />Website Content</span><ChevronDown size={16} className={contentOpen ? 'rotate' : ''} /></button>
      {contentOpen && <div className="admin-subnav">{contentLinks.map(([label, path, Icon]) => <NavLink key={path} to={path} onClick={() => setMobile(false)}><Icon size={15} />{label}</NavLink>)}</div>}
      <div className="sidebar-bottom"><NavLink to="/"><ExternalLink size={17} />View Website</NavLink><button onClick={logout}><LogOut size={17} />Logout</button>{logoutError && <small className="form-error">{logoutError}</small>}</div>
    </aside>
    <section className="admin-main"><header className="admin-topbar"><button className="mobile-toggle" onClick={() => setMobile(value => !value)} aria-label="Toggle menu"><Menu /></button><div><span className="admin-status-dot" /> Management workspace</div><span>Welcome, Admin</span></header><div className="admin-content"><Outlet /></div></section>
  </div>;
}
