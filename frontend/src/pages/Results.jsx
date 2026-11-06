import { useState } from 'react';
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import PageHero from '../components/layout/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import { readStore } from '../utils/storage';

function ResultGroup({title,students}){
 if(!students.length)return null;
 return <section className="section container achiever-section"><SectionHeading eyebrow="VERIFIED ACHIEVEMENTS" title={title} text="Student results published by the institute."/><div className="achiever-grid">{students.map((s,i)=><article className="achiever-card" key={s.id||`${s.studentName}-${i}`}>{s.image?<img src={s.image} alt={s.studentName}/>:<div className="achiever-photo-placeholder"><Trophy size={36}/></div>}<div className="achiever-info"><span>{s.examName||'BECC ACHIEVER'}</span><h3>{s.studentName}</h3><b>{s.marks}/{s.totalMarks}</b><small>{s.percentage ?? Math.round(Number(s.marks)/Number(s.totalMarks)*100)}% · {s.year}</small>{s.remarks&&<p>{s.remarks}</p>}</div></article>)}</div></section>;
}
export default function Results(){
 const [items]=useState(()=>readStore('results',[]).filter(x=>x.published!==false));
 const tenth=items.filter(x=>x.className==='Class 10'),twelfth=items.filter(x=>x.className==='Class 12'),other=items.filter(x=>!['Class 10','Class 12'].includes(x.className));
 return <div className="page-enter"><PageHero title="Every step forward matters" text="Celebrate learning, effort and academic progress at BECC." image="https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=1800&q=90"/>
 <ResultGroup title="Class 10th Achievers" students={tenth}/><ResultGroup title="Class 12th Achievers" students={twelfth}/><ResultGroup title="Entrance Exam Achievers" students={other}/>
 {!items.length&&<section className="section container"><SectionHeading eyebrow="ACHIEVEMENT WALL" title="Student achievements" text="Verified student results will appear here after the institute publishes them."/><div className="result-metrics">{[[Trophy,'Academic milestones','Verified student records'],[TrendingUp,'Learning progress','Academic improvement'],[Medal,'Entrance preparation','Confirmed selections'],[Star,'Student effort','Achievements shared with permission']].map(([Icon,title,description])=><article key={title}><span><Icon/></span><h3>{title}</h3><p>{description}</p></article>)}</div></section>}
 </div>;
}
