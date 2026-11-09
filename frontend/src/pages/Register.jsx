import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Those passwords do not match just yet.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/accounts/register/", {
        method: "POST",
        body: { name: form.name.trim(), email: form.email.trim(), password: form.password },
      });
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setSuccess("All set. Your account is ready — sign in whenever you are.");
    } catch (registrationError) {
      setError(registrationError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-story-panel auth-story-register">
        <span className="eyebrow">A LITTLE MORE YOU</span>
        <h1>Make room<br />for <em>lovely.</em></h1>
        <p>Save the things you love, keep track of your orders and get a little treat on your first visit.</p>
        <div className="auth-story-signoff">maison muse <span>✳</span></div>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <span className="eyebrow">YOUR LITTLE CORNER</span>
        <h2>Come on in</h2>
        <p>A few details and you are all set.</p>
        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        {success && <p className="form-message form-message-success" role="status">{success}</p>}
        <label>Full name<input autoComplete="name" value={form.name} required maxLength={150} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} /></label>
        <label>Email address<input type="email" autoComplete="email" value={form.email} required onChange={event => setForm(current => ({ ...current, email: event.target.value }))} /></label>
        <label>Password<input type="password" autoComplete="new-password" value={form.password} required minLength={8} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} /></label>
        <label>Confirm password<input type="password" autoComplete="new-password" value={form.confirmPassword} required onChange={event => setForm(current => ({ ...current, confirmPassword: event.target.value }))} /></label>
        <button type="submit" className="button button-dark auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Making your account..." : "Create account"} <ArrowRight size={16} />
        </button>
        <div className="auth-switch">Already one of us? <Link to="/login">Sign in</Link></div>
        <div className="auth-safety"><ShieldCheck size={16} /> Your details stay safe with us.</div>
      </form>
    </main>
  );
}

export default Register;
