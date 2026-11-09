import { useState } from "react";
import { ArrowRight, Mail, MessageCircle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";

function Contact() {
  const { notify } = useCart();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = `${form.get("subject")} · Maison Muse`;
    const body = `Hello Maison Muse,\n\n${form.get("message")}\n\nFrom: ${form.get("name")}\nEmail: ${form.get("email")}`;
    window.location.href = `mailto:hello@maisonmuse.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    notify("Your email app is opening with your note.");
    event.currentTarget.reset();
  };

  return (
    <main className="contact-page section-shell">
      <div className="contact-intro">
        <span className="eyebrow">A REAL PERSON, ALWAYS</span>
        <h1>We are all <em>ears.</em></h1>
        <p>Need a hand with a size, an order, or just want to say hello? We would love to hear from you.</p>
        <div className="contact-detail"><span><Mail size={18} /></span><div><small>WRITE US A LITTLE NOTE</small><a href="mailto:hello@maisonmuse.in">hello@maisonmuse.in</a></div></div>
        <div className="contact-detail"><span><MessageCircle size={18} /></span><div><small>ORDER QUESTIONS?</small><Link to="/orders">Visit your order page <ArrowRight size={14} /></Link></div></div>
        <div className="contact-detail"><span><MapPin size={18} /></span><div><small>MADE WITH CARE</small><p>Designed for your everyday, wherever you are.</p></div></div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <span className="eyebrow">SEND A LITTLE NOTE</span>
        <h2>How can we help?</h2>
        {submitted && <p className="form-message form-message-success" role="status">Your note is ready in your email app. Send it when you are ready.</p>}
        <label>Your name<input name="name" autoComplete="name" required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>What is it about?<select name="subject" defaultValue="An order"><option>An order</option><option>Finding my size</option><option>Something else</option></select></label>
        <label>Your note<textarea name="message" rows={5} required placeholder="Tell us what is on your mind..." /></label>
        <button type="submit" className="button button-dark">Send your note <ArrowRight size={16} /></button>
        <small className="contact-form-note">We will only use your details to get back to you.</small>
      </form>
    </main>
  );
}

export default Contact;
