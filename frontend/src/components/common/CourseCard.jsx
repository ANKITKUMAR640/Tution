import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
export default function CourseCard({ course }) {
  return <motion.article className="course-card" whileHover={{ y: -7 }} transition={{ duration: .25 }}>
    <Link to={`/courses/${course.slug}`} className="course-image"><img src={course.image} alt={course.title}/><span>{course.category}</span></Link>
    <div className="course-card-body"><h3>{course.title}</h3><p>{course.subtitle}</p><div className="course-check"><CheckCircle2 size={15}/>{course.subjects}</div><Link className="text-link" to={`/courses/${course.slug}`}>Explore course <ArrowUpRight size={16}/></Link></div>
  </motion.article>;
}
