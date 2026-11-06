import ManagedContent from "../components/common/ManagedContent";
import { Target, Eye, HeartHandshake, BookOpen, ShieldCheck, Users } from "lucide-react";
import PageHero from "../components/layout/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import Reveal from "../components/common/Reveal";
import { institute as defaults } from "../data/siteData";
import { readStore } from "../utils/storage";

export default function About() {
  const institute = readStore("settings", [defaults])[0] || defaults;
  return <div className="page-enter"><PageHero title="About BECC" text="Education today. Stronger possibilities tomorrow." image="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1800&q=90"/>
    <section className="section container about-intro-grid">
  <Reveal>
    <img
      className="about-large-image"
      src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1100&q=90"
      alt="Students at school"
      loading="lazy"
      onError={(e) => {
        console.error("About image failed to load:", e.currentTarget.src);
        e.currentTarget.src =
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1100&q=90";
      }}
    />
  </Reveal>

  <Reveal delay={0.1}>
    <span className="eyebrow">
      OUR STORY · SINCE {institute.established}
    </span>

    <h2>Learning is a journey. We are here to guide it.</h2>

    <p>
      Bharti Excellent Coaching Center (BECC), located at {institute.address},
      is an offline coaching institute supporting students from Class 1 to 12
      and learners preparing for ITI, Polytechnic and Para Medical entrance
      examinations.
    </p>

    <p>
      Our aim is to make learning clear, consistent and encouraging through
      subject-focused teaching, regular practice and guidance.
    </p>

    <div className="about-facts">
      <span>
        <b>{institute.established}</b>
        <small>Established</small>
      </span>
      <span>
        <b>1–12</b>
        <small>School classes</small>
      </span>
      <span>
        <b>03</b>
        <small>Exam pathways</small>
      </span>
    </div>
  </Reveal>
</section>
    <section className="soft-section section"><div className="container"><SectionHeading eyebrow="OUR DIRECTION" title="What guides us" text="The principles behind the BECC learning experience."/><div className="mission-grid">{[[Target,"Our Mission","To provide clear, supportive and quality coaching that helps students strengthen concepts and work steadily towards their goals."],[Eye,"Our Vision","To encourage confident learners with strong foundations, curiosity and the ability to keep improving."],[HeartHandshake,"Our Values","Respect, discipline, consistency, responsibility and a supportive attitude towards every learner."]].map(([I,t,d])=><Reveal key={t}><article className="mission-card"><span><I/></span><h3>{t}</h3><p>{d}</p></article></Reveal>)}</div></div></section>
    <section className="section container"><SectionHeading eyebrow="HOW WE TEACH" title="Learning with a clear process"/><div className="process-grid">{[[BookOpen,"Explain","Build understanding through clear explanations."],[Users,"Engage","Encourage questions and classroom participation."],[ShieldCheck,"Practice","Reinforce concepts through practice and revision."],[Target,"Improve","Identify learning gaps and work on steady progress."]].map(([I,t,d],i)=><div className="process-item" key={t}><span>0{i+1}</span><I/><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    <ManagedContent section="about"/>
  </div>;
}
