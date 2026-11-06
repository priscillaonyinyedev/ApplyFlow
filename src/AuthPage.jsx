import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Check, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase.js';

const blankProfile={name:'',email:'',role:'',location:'',linkedin:'',portfolio:'',bio:'',resume:''};

export default function AuthPage({mode,profile,onSuccess,cloudMode}){
  const signup=mode==='signup';
  const [name,setName]=useState('');
  const [email,setEmail]=useState(profile.email||'');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [role,setRole]=useState('');
  const [location,setLocation]=useState('');
  const [linkedin,setLinkedin]=useState('');
  const [portfolio,setPortfolio]=useState('');
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit(e){
    e.preventDefault();setError('');setNotice('');
    if(!email.trim()||!/^\S+@\S+\.\S+$/.test(email)){setError('Enter a valid email address.');return}
    if(password.length<8){setError('Use a password with at least 8 characters.');return}
    if(signup&&!name.trim()){setError('Enter your name to create an account.');return}
    if(signup&&password!==confirm){setError('Your passwords do not match.');return}
    const account={...blankProfile,...profile,name:signup?name.trim():(profile.name||email.split('@')[0]),email:email.trim(),role:signup?role.trim():profile.role,location:signup?location.trim():profile.location,linkedin:signup?linkedin.trim():profile.linkedin,portfolio:signup?portfolio.trim():profile.portfolio};
    setBusy(true);
    try{
      if(cloudMode&&signup){
        const {data,error}=await supabase.auth.signUp({email:account.email,password,options:{data:{full_name:account.name,current_role:account.role,location:account.location,linkedin_url:account.linkedin,portfolio_url:account.portfolio}}});
        if(error)throw error;
        if(data.session)onSuccess(account);else setNotice('Check your email to confirm your account, then sign in to continue.');
      }else if(cloudMode){
        const {error}=await supabase.auth.signInWithPassword({email:account.email,password});if(error)throw error;onSuccess();
      }else onSuccess(account);
    }catch(err){setError(err.message||'We could not complete sign in. Please try again.')}finally{setBusy(false)}
  }
  async function resetPassword(){setError('');setNotice('');if(!/^\S+@\S+\.\S+$/.test(email)){setError('Enter your account email first.');return}if(!cloudMode){setError('Password reset requires a connected authentication service.');return}const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/update-password`});if(error)setError(error.message);else setNotice('Password reset instructions are on their way to your email.')}

  return <main className="auth-shell"><section className="auth-story"><div className="auth-story-inner"><Link to="/login" className="brand auth-brand"><span className="brand-mark"><Activity size={18}/></span><span>applyflow</span></Link><div className="auth-hero-copy"><span className="auth-overline"><Sparkles size={14}/> YOUR NEXT CHAPTER STARTS HERE</span><h1>Good things happen when you keep going.</h1><p>Every application, interview, and possibility. One thoughtful place to keep it all moving.</p><div className="auth-preview"><div className="auth-preview-top"><span>YOUR JOB SEARCH</span><span className="auth-live"><i/> MADE FOR YOUR NEXT MOVE</span></div><div className="auth-preview-caption auth-preview-pills"><span>Applied</span><span>In review</span><span>Interview</span><span>Offer</span></div><div className="auth-preview-progress"><span/><span/><span/><span/></div><div className="auth-preview-caption"><span>One clear view</span><span>One next step at a time</span></div></div></div><div className="auth-quote"><span>“</span><p>A little more clarity makes a big difference.</p><small>YOUR SEARCH, IN FLOW.</small></div></div></section><section className="auth-form-side"><div className="auth-mobile-brand"><span className="brand-mark"><Activity size={18}/></span><span>applyflow</span></div><div className="auth-form-wrap"><div className="auth-heading"><div className="eyebrow">{signup?'START YOUR NEXT CHAPTER':'WELCOME BACK'}</div><h2>{signup?'Create your account':'Sign in to ApplyFlow'}</h2><p>{signup?'Add your real details so your workspace starts with you.':'Pick up right where your job search left off.'}</p></div><form className="auth-form" onSubmit={submit} noValidate>{signup&&<><label>Full name<input autoComplete="name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></label><label>Current role<input autoComplete="organization-title" placeholder="e.g. Product designer" value={role} onChange={e=>setRole(e.target.value)}/></label><label>Location<input autoComplete="address-level2" placeholder="City, country or remote" value={location} onChange={e=>setLocation(e.target.value)}/></label></>}<label>Email address<input autoFocus type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>{signup&&<><label>LinkedIn profile <span className="field-optional">Optional</span><input type="url" placeholder="https://linkedin.com/in/you" value={linkedin} onChange={e=>setLinkedin(e.target.value)}/></label><label>Portfolio website <span className="field-optional">Optional</span><input type="url" placeholder="https://yourportfolio.com" value={portfolio} onChange={e=>setPortfolio(e.target.value)}/></label></>}<label>Password<input type="password" autoComplete={signup?'new-password':'current-password'} placeholder={signup?'At least 8 characters':'Enter your password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>{signup&&<label>Confirm password<input type="password" autoComplete="new-password" placeholder="Enter your password again" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>}{!signup&&<div className="auth-options"><label className="remember-option"><input type="checkbox" defaultChecked/> Remember me</label><button type="button" onClick={resetPassword}>Forgot password?</button></div>}{error&&<div className="auth-error" role="alert">{error}</div>}{notice&&<div className="auth-notice" role="status">{notice}</div>}<button className="auth-submit" type="submit" disabled={busy}>{busy?'Please wait…':signup?'Create account':'Sign in'} {!busy&&<ArrowRight size={16}/>}</button></form><div className="auth-switch">{signup?'Already have an account?':'New to ApplyFlow?'} <Link to={signup?'/login':'/signup'}>{signup?'Sign in':'Create an account'}</Link></div><div className="auth-secure"><span><Check size={13}/></span>{cloudMode?'Your account and job search sync securely to your workspace.':'Your profile and job search stay in this browser until cloud sync is connected.'}</div></div><footer className="auth-footer"><span>© 2026 ApplyFlow</span><a href="mailto:hello@applyflow.app">Need help?</a><span className="auth-demo-note">{cloudMode?'Secure account':'Local preview'}</span></footer></section></main>
}
