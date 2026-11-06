import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SiteLayout from "./components/layout/SiteLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Faculty from "./pages/Faculty";
import Results from "./pages/Results";
import Notices from "./pages/Notices";
import Admission from "./pages/Admission";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminAdmissions from "./pages/admin/AdminAdmissions";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminSettings from "./pages/admin/AdminSettings";
import ContentManager from "./pages/admin/ContentManager";
import NotFound from "./pages/NotFound";
import AdminPractice from "./pages/admin/AdminPractice";
import Practice from "./pages/practice/Practice";
import Profile from "./pages/user/Profile";
import AdminResults from "./pages/admin/AdminResults";
import AdminMessages from "./pages/admin/AdminMessages";
import CustomCursor from "./components/common/CustomCursor";
import ScrollEffects from "./components/common/ScrollEffects";

gsap.registerPlugin(ScrollTrigger);

function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    gsap.fromTo(".page-enter", { opacity: 0, y: 16 }, {
      opacity: 1, y: 0, duration: 0.55, ease: "power2.out", clearProps: "all"
    });
  }, [location.pathname]);
  return null;
}

export default function App() {
  return <>
    <RouteEffects />
    <CustomCursor />
    <ScrollEffects />
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/results" element={<Results />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="admissions" element={<AdminAdmissions />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="faculty" element={<AdminFaculty />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="practice" element={<AdminPractice />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="content/:section" element={<ContentManager />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>;
}
