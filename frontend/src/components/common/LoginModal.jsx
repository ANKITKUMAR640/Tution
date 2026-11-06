import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, UserRound, ShieldCheck } from 'lucide-react';
import { apiRequest, hydrateAdminFromApi } from '../../utils/storage';

export default function LoginModal({onClose}){
 const navigate=useNavigate();
 const [tab,setTab]=useState('user'),[mode,setMode]=useState('login'),[show,setShow]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(''),[loading,setLoading]=useState(false);
 const [form,setForm]=useState({name:'',email:'',phone:'',password:''});
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async e=>{
  e.preventDefault();setError('');setSuccess('');
  const email=form.email.trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email))return setError('Please enter a valid email address.');
  if(form.password.length<(mode==='signup'?8:6))return setError(mode==='signup'?'Password must contain at least 8 characters.':'Password must contain at least 6 characters.');
  if(mode==='signup'&&(!form.name.trim()||!/^\d{10}$/.test(form.phone)))return setError('Enter your name and a valid 10-digit phone number.');
  setLoading(true);
  try{
   if(tab==='admin'){
    await apiRequest('/auth/login',{method:'POST',body:JSON.stringify({email,password:form.password})});
    await hydrateAdminFromApi();
    onClose();navigate('/admin');return;
   }
   const result=mode==='signup'
    ? await apiRequest('/auth/student/register',{method:'POST',body:JSON.stringify({name:form.name.trim(),email,phone:form.phone,password:form.password})})
    : await apiRequest('/auth/student/login',{method:'POST',body:JSON.stringify({email,password:form.password})});
   localStorage.setItem('becc_user_session',JSON.stringify(result.user));
   const {attempts=[]}=await apiRequest('/auth/student/attempts');
   localStorage.setItem('practice_attempts',JSON.stringify(attempts));
   onClose();window.dispatchEvent(new Event('becc-auth-change'));
  }catch(err){setError(err.message||'Unable to complete account request.');}
  finally{setLoading(false);}
 };
 return <div className="login-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="login-dialog">
  <button className="login-close" onClick={onClose} aria-label="Close"><X/></button><span className="eyebrow">WELCOME TO BECC</span><h2>Sign in to continue</h2>
  <div className="login-tabs"><button className={tab==='user'?'active':''} onClick={()=>{setTab('user');setError('');}}><UserRound/> User</button><button className={tab==='admin'?'active':''} onClick={()=>{setTab('admin');setMode('login');setError('');}}><ShieldCheck/> Admin</button></div>
  <form onSubmit={submit}>
   {tab==='admin'?<><label>Admin Email ID<input type="email" name="email" value={form.email} onChange={change} placeholder="admin@example.com" required/></label><label>Admin Password<span className="password-field"><input type={show?'text':'password'} name="password" value={form.password} onChange={change} required/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></span></label>{error&&<p className="form-error">{error}</p>}<button type="submit" className="submit-button" disabled={loading}>{loading?'Please wait...':'Admin Login ↗'}</button></>:<>
    {mode==='signup'&&<><label>Full name<input name="name" value={form.name} onChange={change} required/></label><label>Phone number<input name="phone" type="tel" maxLength="10" value={form.phone} onChange={change} required/></label></>}
    <label>Email ID<input type="email" name="email" value={form.email} onChange={change} placeholder="name@example.com" required/></label>
    <label>Password<span className="password-field"><input type={show?'text':'password'} name="password" value={form.password} onChange={change} placeholder={mode==='signup'?'At least 8 characters':'Your password'} required/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></span></label>
    {error&&<p className="form-error">{error}</p>}{success&&<p className="form-success">{success}</p>}
    <button className="submit-button" disabled={loading}>{loading?'Please wait...':mode==='signup'?'Create Account':'User Login'} ↗</button>
   </>}
  </form>
  {tab==='user'&&<button className="auth-switch" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setSuccess('');}}>{mode==='login'?'New to BECC? Create Account':'Already registered? Login'}</button>}
  <p className="login-foot">Your account is stored securely by the BECC backend.</p>
 </section></div>;
}
