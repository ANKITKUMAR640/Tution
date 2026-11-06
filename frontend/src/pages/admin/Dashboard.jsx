import { Users, BookOpen, Trophy, ArrowUpRight, CalendarDays, Bell, TrendingUp, GraduationCap, MessageSquare, ClipboardList } from 'lucide-react';
import { readStore } from '../../utils/storage';
import { courses as defaultCourses, notices as defaultNotices, faculty as defaultFaculty } from '../../data/siteData';

export default function Dashboard() {
  const admissions = readStore('admissions', []);
  const courses = readStore('courses', defaultCourses);
  const notices = readStore('notices', defaultNotices);
  const faculty = readStore('faculty', defaultFaculty);
  const results = readStore('results', []);
  const messages = readStore('messages', []);
  const attempts = readStore('practice_attempts', []);
  const cards = [
    [Users, 'Admission Enquiries', admissions.length, 'All submitted admission forms'],
    [BookOpen, 'Courses', courses.length, 'Manage public programmes'],
    [GraduationCap, 'Faculty Profiles', faculty.length, 'Manage faculty details'],
    [Trophy, 'Published Results', results.filter(item => item.published !== false).length, 'Class 10, Class 12 and entrance'],
    [MessageSquare, 'Contact Messages', messages.length, 'Website enquiries'],
    [ClipboardList, 'Practice Attempts', attempts.length, 'Student practice activity']
  ];
  return <div className="page-enter">
    <div className="admin-page-heading"><div><span className="eyebrow">OVERVIEW</span><h1>Dashboard</h1><p>Current BECC website activity and content overview.</p></div><span className="admin-date"><CalendarDays /> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
    <div className="dashboard-stats">{cards.map(([Icon, title, value, description]) => <article key={title}><div className="dash-stat-top"><span><Icon /></span><ArrowUpRight size={17} /></div><small>{title}</small><b>{value}</b><p>{description}</p></article>)}</div>
    <div className="dashboard-main-grid">
      <section className="admin-panel"><div className="panel-heading"><div><h3>Recent admission enquiries</h3><p>Latest forms submitted on the public website</p></div><a href="/admin/admissions">View all ↗</a></div>
        {admissions.length ? admissions.slice(0, 5).map(item => <div className="admin-list-row" key={item.id}><div className="avatar-circle">{item.studentName?.[0]?.toUpperCase() || 'S'}</div><div><b>{item.studentName}</b><small>{item.className} · {item.mobile}</small></div><span className="status-pill">{item.status || 'New'}</span></div>) : <div className="empty-admin"><Users /><b>No admission enquiries yet</b><p>New form submissions will appear here.</p></div>}
      </section>
      <section className="admin-panel"><div className="panel-heading"><div><h3>Website snapshot</h3><p>Stored content and student activity</p></div><TrendingUp /></div>
        <div className="snapshot-row"><span>Notices</span><b>{notices.length}</b></div><div className="snapshot-row"><span>Contact messages</span><b>{messages.length}</b></div><div className="snapshot-row"><span>Practice attempts</span><b>{attempts.length}</b></div><div className="snapshot-row"><span>Results</span><b>{results.length}</b></div><div className="admin-tip"><Bell /><span>Manage published content and review student enquiries from the workspace navigation.</span></div>
      </section>
    </div>
  </div>;
}
