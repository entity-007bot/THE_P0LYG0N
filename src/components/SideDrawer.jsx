import React from "react";
import "../styles/polygon.css";

/**
 * SIDE SLIDE DRAWER COMPONENT
 * - Uses all class names, structure, and accessibility roles/tags from the official POLYGON_UI spec.
 */
export default function SideDrawer() {
  return (
    <aside className="wide-drawer" id="shell-drawer" aria-label="Side navigation drawer">
      {/* Drawer header with logo and login form */}
      <div className="drawer-header">
        <div className="drawer-logo-area">
          <div className="drawer-logo-diamond">
            <div className="drawer-logo-inner"></div>
          </div>
          <div className="drawer-brand">POLYGON</div>
          <div className="drawer-tagline">Unlock Your Workspace</div>
        </div>
        {/* LOGIN FORM */}
        <form className="login-form" onSubmit={e => { e.preventDefault(); }}>
          <div className="input-group">
            <span className="input-icon" style={{left:14,top:"50%",fontSize:14,position:"absolute",transform:"translateY(-50%)"}}>👤</span>
            <input className="form-input" type="email" placeholder="Username / Email" aria-label="Username or Email" required />
          </div>
          <div className="input-group">
            <span className="input-icon" style={{left:14,top:"50%",fontSize:14,position:"absolute",transform:"translateY(-50%)"}}>🔒</span>
            <input className="form-input" type="password" placeholder="Password" aria-label="Password" minLength={8} required />
            <span className="eye-toggle" role="button" tabIndex={0} aria-label="Toggle password visibility">👁</span>
          </div>
          <button className="btn-primary" type="submit">Log In</button>
          <div className="signup-row">
            <a href="#" aria-label="Sign up for POLYGON">Sign Up</a>
          </div>
          <div className="social-divider">
            <div className="social-divider-line"></div>
            <span className="social-divider-text">Social Login</span>
            <div className="social-divider-line"></div>
          </div>
          <button className="social-btn" type="button" aria-label="Continue with Google">
            <span className="social-icon google">G</span> Continue with Google
          </button>
          <button className="social-btn" type="button" aria-label="Continue with LinkedIn">
            <span className="social-icon linkedin">in</span> Continue with LinkedIn
          </button>
        </form>
      </div>
      {/* NAVIGATION MENU ITEMS */}
      <nav className="drawer-nav" aria-label="Main navigation">
        {[
          { icon: "🔍", label: "AI Search", active: true },
          { icon: "🌐", label: "Web Search" },
          { icon: "📰", label: "Saved Feed" },
          { icon: "🔖", label: "Saved Items" },
          { icon: "🔔", label: "Notifications" },
          { icon: "👥", label: "Communities / Groups" },
          { icon: "✅", label: "Tasks / Missions" },
          { icon: "🏆", label: "Rewards / Points" },
          { icon: "❓", label: "Help Center" },
          { icon: "⋯", label: "More Tools" }
        ].map((item, idx) => (
          <div
            className={"nav-item" + (item.active ? " active" : "")}
            role="menuitem"
            tabIndex={0}
            aria-current={item.active ? "page" : undefined}
            key={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className="nav-chevron">›</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
