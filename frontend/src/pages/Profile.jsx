import { useEffect, useState } from "react";
import { ArrowRight, Heart, LogOut, PackageCheck, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { apiRequest } from "../lib/api";

function Profile() {
  const { wishlist, notify } = useCart();
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("accessToken")));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isSignedIn = Boolean(localStorage.getItem("accessToken"));

  useEffect(() => {
    if (!isSignedIn) return undefined;
    let active = true;
    apiRequest("/accounts/profile/", { authenticated: true })
      .then(data => {
        if (!active) return;
        setProfile(data);
        localStorage.setItem("user", JSON.stringify(data));
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
        });
      })
      .catch(loadError => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isSignedIn]);

  const saveProfile = async event => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await apiRequest("/accounts/profile/", {
        method: "PATCH",
        authenticated: true,
        body: form,
      });
      setProfile(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      notify("Your details have been updated.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    const refresh = localStorage.getItem("refreshToken");
    try {
      if (refresh) await apiRequest("/accounts/logout/", {
        method: "POST",
        authenticated: true,
        body: { refresh },
      });
    } catch (logoutError) {
      setError(`Could not revoke the server session: ${logoutError.message}`);
      return;
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setProfile(null);
    notify("You have signed out.");
    navigate("/");
  };

  if (!isSignedIn) {
    return (
      <main className="profile-page section-shell">
        <div className="page-intro"><span className="eyebrow">YOUR LITTLE CORNER</span><h1>Your account<span>.</span></h1><p>Sign in to see your details and account orders.</p></div>
        <div className="profile-signin">
          <div className="profile-signin-icon"><UserRound size={22} /></div>
          <h2>Make yourself at home.</h2><p>Your wishlist and bag are right here. Sign in for your account details and order history.</p>
          <Link to="/login" className="button button-dark">Sign in <ArrowRight size={16} /></Link>
          <div className="auth-switch">New around here? <Link to="/register">Make an account</Link></div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page section-shell">
      <div className="page-intro"><span className="eyebrow">YOUR LITTLE CORNER</span><h1>Hello, {profile?.first_name || "lovely"}<span>.</span></h1><p>All the little things you need, right where they should be.</p></div>
      <div className="profile-layout">
        <nav className="profile-nav" aria-label="Account navigation">
          <Link className="active" to="/profile"><UserRound size={17} /> My details</Link>
          <Link to="/orders"><PackageCheck size={17} /> My orders</Link>
          <Link to="/wishlist"><Heart size={17} /> My wishlist <span>{wishlist.length}</span></Link>
          <button type="button" onClick={signOut}><LogOut size={17} /> Sign out</button>
        </nav>
        <section className="profile-panel">
          <div className="profile-panel-title"><div><h2>My details</h2><p>Keep your account details up to date.</p></div><ShieldCheck size={21} /></div>
          {error && <p className="form-message form-message-error" role="alert">{error}</p>}
          {loading ? <div className="loading-state"><span className="loading-spinner" /> Gathering your details...</div> : (
            <form className="profile-form" onSubmit={saveProfile}>
              <label>First name<input value={form.first_name} onChange={event => setForm(current => ({ ...current, first_name: event.target.value }))} autoComplete="given-name" required /></label>
              <label>Last name<input value={form.last_name} onChange={event => setForm(current => ({ ...current, last_name: event.target.value }))} autoComplete="family-name" /></label>
              <label className="field-full">Email address<input type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} autoComplete="email" required /></label>
              <button type="submit" className="button button-dark" disabled={saving}>{saving ? "Saving..." : "Save my details"} <ArrowRight size={16} /></button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
