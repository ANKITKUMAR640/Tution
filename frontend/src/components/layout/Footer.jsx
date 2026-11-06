import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { institute as defaults } from "../../data/siteData";
import { readStore } from "../../utils/storage";

export default function Footer() {
  const institute = readStore("settings", [defaults])[0] || defaults;
  return <footer className="footer">
    <div className="container footer-grid">
      <div><Link to="/" className="brand brand-footer"><span className="brand-mark">ॐ</span><span><b>BECC</b><small>BHARTI EXCELLENT<br/>COACHING CENTER</small></span></Link><p>Learn with purpose. Build strong foundations. Prepare for a brighter future.</p></div>
      <div><h4>Explore</h4><Link to="/about">About BECC</Link><Link to="/courses">Our Courses</Link><Link to="/faculty">Faculty</Link><Link to="/results">Results</Link></div>
      <div><h4>Quick Links</h4><Link to="/notices">Notices</Link><Link to="/admission">Admission</Link><Link to="/contact">Contact</Link></div>
      <div><h4>Contact</h4><p><MapPin size={15}/>{institute.address}</p><p><Phone size={15}/>{institute.phone}</p><p><Mail size={15}/>{institute.email}</p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} BECC. All rights reserved.</span><span>Designed for learning <ArrowUpRight size={14}/></span></div>
  </footer>;
}
