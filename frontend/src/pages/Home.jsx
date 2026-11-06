import ManagedContent from "../components/common/ManagedContent";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRight, ArrowUpRight, BookOpen, GraduationCap, Trophy, Users, Monitor, Target, Star, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { courses, institute, notices as defaultNotices } from "../data/siteData";
import SectionHeading from "../components/common/SectionHeading";
import CourseCard from "../components/common/CourseCard";
import Button from "../components/common/Button";
import Reveal from "../components/common/Reveal";
import AdmissionForm from "../components/forms/AdmissionForm";
import HeroSlider from "../components/common/HeroSlider";
import { readStore } from "../utils/storage";

export default function Home() {
  const hero = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-copy > *", { y: 35, opacity: 0, duration: .8, stagger: .12, ease: "power3.out" });
      gsap.from(".hero-visual", { x: 55, opacity: 0, duration: 1, delay: .2, ease: "power3.out" });
      gsap.to(".hero-orbit", { rotate: 360, duration: 32, repeat: -1, ease: "none" });
    }, hero);
    return () => ctx.revert();
  }, []);
  const instituteInfo = readStore("settings", [institute])[0] || institute;
  const activeCourses = readStore("courses", courses).filter(c => c.published !== false);
  const notices = readStore("notices", defaultNotices).filter(n => n.published !== false).slice().sort((a,b)=>new Date(b.createdAt||b.date)-new Date(a.createdAt||a.date));
  return <div className="page-enter">
    <section className="home-hero" ref={hero}>
      <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
      <div className="container hero-grid">
        <div className="hero-copy"><span className="hero-kicker"><i/> ESTABLISHED {instituteInfo.established} · {instituteInfo.address.toUpperCase()}</span><p className="script-line">Dream Big. Prepare Better.</p><h1>Build a brighter future <em>with BECC.</em></h1><p className="hero-description">Quality education, expert guidance and a supportive learning environment for school students and competitive exam aspirants.</p>
          <div className="hero-actions"><Button to="/courses">Explore Courses</Button><Button to="/contact" variant="outline-light">Contact Us</Button></div>
          <div className="hero-trust"><div><b>01</b><span>Strong foundations</span></div><div><b>02</b><span>Focused preparation</span></div><div><b>03</b><span>Personal guidance</span></div></div>
        </div>
        <div className="hero-visual"><HeroSlider/></div>
      </div>
      <div className="hero-bottom container"><span>BHARTI EXCELLENT COACHING CENTER</span><span>MUZAFFARPUR, BIHAR <ArrowRight size={15}/></span></div>
    </section>

    <section className="stats-strip container">
      {[["01","School Classes","1–12",BookOpen],["02","Exam Preparation","3 pathways",Trophy],["03","Learning Support","Focused",Users],["04","Classroom Learning","Offline",Monitor]].map(([n,l,v,I]) => <div className="stat-item" key={n}><span className="stat-number">{n}</span><I/><div><b>{v}</b><small>{l}</small></div></div>)}
    </section>

    <section className="section container"><SectionHeading eyebrow="LEARNING PATHWAYS" title="Choose the right course for your goals" text="Academic support for school students and structured preparation for entrance examinations."/><div className="course-grid">{activeCourses.map(c => <CourseCard key={c.id} course={c}/>)}</div><div className="center-action"><Button to="/courses" variant="dark">View All Courses</Button></div></section>

    <section className="about-band"><div className="container about-band-grid"><Reveal><div className="about-photo"><img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1100&q=90" alt="Bright classroom"/><div className="photo-caption"><span>BECC</span><small>Learning with purpose since 2022</small></div></div></Reveal><Reveal delay={.12}><div className="about-copy"><span className="eyebrow">A PLACE TO GROW</span><h2>Education that builds confidence, not just marks.</h2><p>Bharti Excellent Coaching Center is committed to helping learners strengthen their concepts, develop good study habits and prepare with confidence. Our focus is on clear teaching, regular practice and individual attention.</p><div className="value-list"><span><CheckCircle2/> Concept-focused learning</span><span><CheckCircle2/> Supportive classroom environment</span><span><CheckCircle2/> Regular practice and guidance</span></div><Button to="/about" variant="dark">Discover BECC</Button></div></Reveal></div></section>

    <section className="section container"><div className="why-grid"><div><SectionHeading eyebrow="THE BECC APPROACH" title="A better way to learn" align="left" text="A supportive learning experience designed around consistency, clarity and confidence."/><div className="why-list">{[[Target,"Clear concepts","Understand the basics before moving to advanced topics."],[Users,"Personal attention","A learning environment where students can ask and improve."],[BookOpen,"Regular practice","Build confidence through revision and consistent practice."],[Trophy,"Goal-oriented guidance","Stay focused on academic and entrance examination goals."]].map(([I,t,d])=><div className="why-row" key={t}><span><I/></span><div><b>{t}</b><p>{d}</p></div></div>)}</div></div><div className="why-image"><img src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1000&q=90" alt="Students in classroom"/><div className="why-image-label">A classroom built around curiosity.</div></div></div></section>

    <section className="dark-cta"><div className="container dark-cta-inner"><div><span className="eyebrow">TAKE THE NEXT STEP</span><h2>Make your next chapter a strong one.</h2><p>Talk to BECC about classes, batches and admission.</p></div><Button to="/admission">Start Admission Enquiry</Button></div></section>

    <section className="section container"><div className="split-heading"><SectionHeading eyebrow="LATEST UPDATES" title="What's happening at BECC" align="left" text="Stay connected with institute announcements and learning updates."/><Link to="/notices" className="text-link">All notices <ArrowUpRight/></Link></div><div className="notice-preview-grid">{notices.map(n=><article className="notice-preview" key={n.title}><span>{n.date}</span><div><small>{n.type}</small><h3>{n.title}</h3><p>{n.body}</p></div><ArrowUpRight/></article>)}</div></section>

    <section className="section container admission-home"><div className="admission-side"><span className="eyebrow">ADMISSIONS OPEN</span><h2>Start with a conversation. Grow with confidence.</h2><p>Share a few details. The institute team can guide you about the right class or course and current batch availability.</p><div className="admission-points"><span><CheckCircle2/> Simple enquiry form</span><span><CheckCircle2/> Offline classroom learning</span><span><CheckCircle2/> Fee details confirmed by institute</span></div></div><AdmissionForm/></section>
    <ManagedContent section="home"/>
  </div>;
}
