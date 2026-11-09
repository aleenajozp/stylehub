import { ArrowRight, Heart, Leaf, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-image" role="img" aria-label="A relaxed, sunlit fashion portrait" />
        <div className="about-hero-copy">
          <span className="eyebrow">A NOTE FROM THE STUDIO</span>
          <h1>Getting dressed<br />should feel like <em>you.</em></h1>
          <p>Less “what should I wear?” and more “this feels just right.” That is the little idea behind Maison Muse.</p>
        </div>
      </section>
      <section className="about-story section-shell">
        <div className="about-story-label"><span className="eyebrow">OUR LITTLE BELIEF</span><span className="about-star">✳</span></div>
        <div><h2>Not more clothes.<br /><em>More you in them.</em></h2>
          <p>We started Maison Muse for the real-life moments: the coffee that turns into lunch, the celebration that was not on the calendar, the Tuesday when you simply want to feel like yourself.</p>
          <p>We look for pieces with a point of view and room to move. Easy shapes, thoughtful details, fabrics that feel like a yes. Not outfits for an imaginary life — lovely things for the one you already have.</p>
        </div>
      </section>
      <section className="about-values">
        <div className="about-value"><span><Heart size={20} /></span><h3>Choose with care</h3><p>We keep our edit considered, so finding your new favourite can feel simple.</p></div>
        <div className="about-value"><span><Leaf size={20} /></span><h3>Wear it your way</h3><p>Real wardrobes are personal. Our pieces are made to mix, match and make your own.</p></div>
        <div className="about-value"><span><Sparkles size={20} /></span><h3>Find the feeling</h3><p>Style is not a set of rules. It is that small “oh, this is me” moment.</p></div>
      </section>
      <section className="about-cta">
        <span className="eyebrow">WHEN YOU ARE READY</span><h2>Something lovely<br />is waiting <em>for you.</em></h2>
        <Link to="/shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}

export default About;
