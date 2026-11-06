import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { courses as defaults } from "../data/siteData";
import { readStore } from "../utils/storage";
import Button from "../components/common/Button";
import NotFound from "./NotFound";

export default function CourseDetail() {
  const { slug } = useParams();
  const courses = readStore("courses", defaults).filter(c => c.published !== false);
  const course = courses.find(c=>c.slug===slug);
  if (!course) return <NotFound/>;
  return <div className="page-enter"><section className="detail-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(5,24,57,.95),rgba(5,24,57,.35)),url(${course.image})`}}><div className="container"><Link to="/courses" className="back-link"><ArrowLeft size={16}/> All courses</Link><span className="eyebrow">{course.category}</span><h1>{course.title}</h1><p>{course.subtitle}</p></div></section><section className="section container detail-grid"><div><span className="eyebrow">COURSE OVERVIEW</span><h2>{course.title} at BECC</h2><p>{course.description}</p><h3>Learning focus</h3><div className="value-list"><span><CheckCircle2/> {course.subjects}</span><span><CheckCircle2/> Concept clarity and practice</span><span><CheckCircle2/> Offline classroom learning</span><span><CheckCircle2/> Batch information confirmed by institute</span></div></div><aside className="detail-enquiry"><h3>Interested in this course?</h3><p>Send an admission enquiry and ask about current batch availability.</p><Button to="/admission">Enquire Now</Button><small>Fees and batch details are confirmed directly by BECC.</small></aside></section></div>;
}
