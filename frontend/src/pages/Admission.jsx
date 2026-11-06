import { CheckCircle2, Clock, MapPin } from "lucide-react";
import PageHero from "../components/layout/PageHero";
import AdmissionForm from "../components/forms/AdmissionForm";
import { institute as defaults } from "../data/siteData";
import { readStore } from "../utils/storage";
export default function Admission() {
  const institute = readStore("settings", [defaults])[0] || defaults;
  return <div className="page-enter"><PageHero title="Take the first step with BECC" text="Tell us what you want to learn. Our team can guide you about classes, courses and batches." image="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1800&q=90"/><section className="section container admission-page-grid"><div className="admission-info"><span className="eyebrow">ADMISSION PROCESS</span><h2>Simple enquiry. Personal guidance.</h2><p>Submit the form with your basic details. The institute will review the enquiry and contact you to discuss the next steps.</p><div className="admission-step"><span>01</span><div><b>Submit your details</b><p>Fill in the student and contact information.</p></div></div><div className="admission-step"><span>02</span><div><b>Speak with the institute</b><p>Confirm the right class or course and current batch availability.</p></div></div><div className="admission-step"><span>03</span><div><b>Visit the institute</b><p>Complete the admission process and fee discussion offline.</p></div></div><div className="admission-contact"><p><Clock/> Batch timing: {institute.timings}</p><p><MapPin/> {institute.address}</p></div></div><AdmissionForm/></section></div>;
}
