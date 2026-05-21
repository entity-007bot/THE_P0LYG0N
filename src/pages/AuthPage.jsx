import React, { useState } from "react";
import "../styles/polygon.css";

/**
 * LOGIN & SIGNUP PAGE
 * - Minimal: No product info, only brand logo + form.
 * - Only shows login/signup forms; all feature/about/support links are hidden here.
 * - After login (on submit), show main app UI (to be wired up later).
 */
function AuthLogo() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',marginBottom:'24px'}}>
      <div className="drawer-logo-diamond" style={{width:60,height:60}}>
        <div className="drawer-logo-inner"></div>
      </div>
      <div className="drawer-brand" style={{fontSize:'2rem'}}>POLYGON</div>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // TODO: Replace with your auth logic
    // Block empty/short fake logins for demo
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    if (!email.match(/^\S+@\S+\.\S+$/)) { setError("Enter a valid email."); return; }
    if (password.length < 8) { setError("Password too short"); return; }
    // Success: navigate to main app shell
    // (Demo: alert, real app: route change)
    alert("Login/Signup successful. TODO: Hook to main app shell.");
  };

  return (
    <main className="screen" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--color-bg-deep)'}}>
      <AuthLogo />
      <form className="login-form" style={{minWidth:320,maxWidth:350,width:'90%'}} onSubmit={handleSubmit} autoComplete="off">
        <div className="input-group">
          <span className="input-icon" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:14}}>👤</span>
          <input className="form-input" name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="username" required />
        </div>
        <div className="input-group">
          <span className="input-icon" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔒</span>
          <input className="form-input" name="password" type="password" placeholder="Password" aria-label="Password" minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
        </div>
        {error && <div style={{color:'var(--color-danger)',fontSize:13,margin:'4px 0'}}>{error}</div>}
        <button className="btn-primary" type="submit" style={{marginTop:12}}>{mode === "login" ? "Log In" : "Sign Up"}</button>
        <div className="signup-row" style={{marginTop:8}}>
          {mode === "login" ? (
            <>Don't have an account? <a href="#" onClick={e=>{e.preventDefault();setMode("signup")}} aria-label="Sign up">Sign Up</a></>
          ) : (
            <>Already have an account? <a href="#" onClick={e=>{e.preventDefault();setMode("login")}} aria-label="Log in">Log In</a></>
          )}
        </div>
      </form>
    </main>
  );
}
