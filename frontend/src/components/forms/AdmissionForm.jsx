import { useState } from "react";
import { addStoreItem } from "../../utils/storage";
import { courses } from "../../data/siteData";

const initial = { studentName: "", fatherName: "", mobile: "", className: "" };
export default function AdmissionForm() {
  const [form, setForm] = useState(initial);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(""); setDone("");
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return setError("Please enter a valid 10-digit mobile number.");
    if (!form.studentName.trim() || !form.fatherName.trim() || !form.className) return setError("Please complete all required fields.");
    try { await addStoreItem("admissions", { ...form, status: "New" }); setDone("Your admission enquiry has been submitted successfully."); setForm(initial); }
    catch (err) { setError(err.message || "Unable to submit enquiry. Please try again."); }
  };
  return <form className="form-card" onSubmit={submit}>
    <div className="form-heading"><span className="eyebrow">START YOUR JOURNEY</span><h3>Admission Enquiry</h3><p>Share your details and our team will contact you.</p></div>
    <label>Student Name *<input name="studentName" value={form.studentName} onChange={change} placeholder="Enter student name" required/></label>
    <label>Father's Name *<input name="fatherName" value={form.fatherName} onChange={change} placeholder="Enter father's name" required/></label>
    <label>Mobile Number *<input name="mobile" inputMode="numeric" maxLength="10" value={form.mobile} onChange={change} placeholder="10-digit mobile number" required/></label>
    <label>Class / Course *<select name="className" value={form.className} onChange={change} required><option value="">Select class or course</option>{["Class 1–5","Class 6–8","Class 9–10","Class 11 Science","Class 11 Arts","Class 12 Science","Class 12 Arts",...courses.slice(2).map(c => c.title)].map(v => <option key={v}>{v}</option>)}</select></label>
    {error && <p className="form-error">{error}</p>}{done && <p className="form-success">{done}</p>}
    <button className="submit-button" type="submit">Submit Admission Enquiry <span>↗</span></button>
  </form>;
}
