import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageHero from "../components/layout/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import CourseCard from "../components/common/CourseCard";
import { courses as defaults } from "../data/siteData";
import { readStore } from "../utils/storage";

export default function Courses() {
  const [courses] = useState(() => readStore("courses", defaults).filter(c => c.published !== false));
  const [filter,setFilter] = useState("All");
  const [query,setQuery] = useState("");
  const shown = useMemo(() => courses.filter(c => (filter === "All" || c.category === filter) && `${c.title} ${c.subtitle} ${c.subjects}`.toLowerCase().includes(query.toLowerCase())),[filter,query]);
  return <div className="page-enter"><PageHero title="Courses designed around your goals" text="Explore school tuition and entrance examination preparation at BECC." image="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=90"/>
    <section className="section container"><SectionHeading eyebrow="EXPLORE PROGRAMMES" title="Find your learning path" text="Choose a course to view its learning focus and enquiry options."/><div className="course-toolbar"><div className="filter-pills">{["All","School Tuition","Competitive Exams"].map(f=><button className={filter===f?"active":""} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div><label className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search courses"/></label></div><div className="course-grid">{shown.map(c=><CourseCard key={c.id} course={c}/>)}</div>{!shown.length && <p className="empty-state">No courses match your search.</p>}</section>
  </div>;
}
