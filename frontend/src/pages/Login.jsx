import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async event => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await apiRequest("/accounts/login/", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      if (!data?.access || !data?.refresh) throw new Error("The store did not return a valid sign-in session.");
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/profile");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-story-panel">
        <span className="eyebrow">WELCOME BACK, LOVELY</span>
        <h1>Good to<br />have you <em>here.</em></h1>
        <p>Your saved pieces and favourite little things are right where you left them.</p>
        <div className="auth-story-signoff">maison muse <span>✳</span></div>
      </div>
      <form className="auth-form" onSubmit={handleLogin}>
        <span className="eyebrow">YOUR LITTLE CORNER</span>
        <h2>Sign in</h2>
        <p>Pick up right where you left off.</p>
        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        <label>Email address<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
        <button type="submit" className="button button-dark auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing you in..." : "Sign in"} <ArrowRight size={16} />
        </button>
        <div className="auth-switch">New around here? <Link to="/register">Make an account</Link></div>
        <div className="auth-safety"><ShieldCheck size={16} /> Your details stay safe with us.</div>
      </form>
    </main>
  );
}

export default Login;
