import { useState } from "react";
import { faculty as defaults } from "../data/siteData";
import { readStore } from "../utils/storage";
import PageHero from "../components/layout/PageHero";
import SectionHeading from "../components/common/SectionHeading";
export default function Faculty() {
  const [faculty] = useState(() => readStore("faculty", defaults).filter(f => f.published !== false));
  return <div className="page-enter"><PageHero title="Meet the people who guide learning" text="A supportive faculty experience built around subject understanding and student progress." image="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1800&q=90"/><section className="section container"><SectionHeading eyebrow="OUR FACULTY" title="Guidance across subjects" text="Sample faculty cards are shown for layout preview. Replace these with verified teacher details before publishing."/><div className="faculty-grid">{faculty.map((f,i)=><article className="faculty-card" key={f.name}><div className="faculty-photo"><img src={f.image} alt="Sample faculty portrait"/><span>0{i+1}</span></div><div className="faculty-info"><small>SUBJECT SPECIALIST</small><h3>{f.name}</h3><b>{f.subject}</b><p>{f.qualification}</p></div></article>)}</div><p className="demo-disclaimer">Demo profiles only — names, photographs and qualifications must be replaced or approved by the actual faculty before the website goes live.</p></section></div>;
}
