import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Quote, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/useCart";

const categories = [
  { title: "Dresses", label: "Everyday, made special", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&auto=format&fit=crop&q=85", query: "Casual Dresses", className: "category-tall" },
  { title: "The occasion edit", label: "A reason to get dressed", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=900&auto=format&fit=crop&q=85", query: "Party Wear", className: "" },
  { title: "Soft essentials", label: "Your everyday favourites", image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=900&auto=format&fit=crop&q=85", query: "Tops", className: "" },
];

function Home() {
  const [email, setEmail] = useState("");
  const { notify } = useCart();

  const subscribe = event => {
    event.preventDefault();
    const subscribers = JSON.parse(localStorage.getItem("newsletterSubscribers") || "[]");
    if (subscribers.includes(email.trim().toLowerCase())) {
      notify("You are already on our list.");
      return;
    }
    localStorage.setItem("newsletterSubscribers", JSON.stringify([...subscribers, email.trim().toLowerCase()]));
    setEmail("");
    notify("Lovely! You are on the list.");
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-image" role="img" aria-label="Friends enjoying a sunny afternoon in effortless outfits" />
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow"><Sparkles size={14} /> THE NEW SEASON, SOFTLY</span>
          <h1>Discover<br />Your <em>Style.</em></h1>
          <p>Find the perfect outfit for every occasion. Thoughtful pieces, made for your kind of beautiful.</p>
          <div className="hero-actions">
            <Link to="/shop" className="button button-dark">Shop now <ArrowRight size={16} /></Link>
            <Link to="/shop#categories" className="button button-light">Explore collection <ArrowUpRight size={16} /></Link>
          </div>
          <div className="hero-note"><span className="hero-note-mark">✳</span> A little more you, in every outfit.</div>
        </div>
        <div className="hero-index"><span>01</span> / 03 <ArrowDown size={14} /></div>
      </section>

      <section className="trust-strip" aria-label="Our promises">
        <span>Thoughtful fabrics</span><i>✳</i><span>Made for real life</span><i>✳</i>
        <span>Free delivery over ₹2,500</span><i>✳</i><span>Easy 7-day returns</span>
      </section>

      <section className="section-shell category-section" id="categories">
        <div className="section-heading">
          <div><span className="eyebrow">A GOOD PLACE TO START</span><h2>Find your <em>kind</em> of lovely.</h2></div>
          <Link className="text-link" to="/shop">Browse everything <ArrowUpRight size={15} /></Link>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link
              to={`/shop?category=${encodeURIComponent(category.query)}`}
              className={`category-tile ${category.className}`}
              key={category.title}
              style={{ "--tile-index": index }}
            >
              <img src={category.image} alt="" loading="lazy" />
              <span className="category-shade" />
              <span className="category-copy"><small>{category.label}</small><strong>{category.title}</strong></span>
              <span className="category-arrow"><ArrowUpRight size={19} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell arrivals-section">
        <div className="section-heading">
          <div><span className="eyebrow">FRESH FROM THE STUDIO</span><h2>New things, <em>good feelings.</em></h2></div>
          <Link className="text-link" to="/shop">Shop new arrivals <ArrowRight size={15} /></Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
        </div>
      </section>

      <section className="editorial-banner">
        <div className="editorial-image" role="img" aria-label="A softly tailored look from our new collection" />
        <div className="editorial-copy">
          <span className="eyebrow">THE EVERYDAY EDIT · NO. 04</span>
          <h2>Not saved<br />for <em>later.</em></h2>
          <p>Beautiful things deserve to be worn. Find the pieces that make a Tuesday feel a little bit like a reason.</p>
          <Link to="/shop" className="button button-dark">Meet your new favourites <ArrowRight size={16} /></Link>
        </div>
        <div className="editorial-stamp">MADE<br />FOR<br />YOU <span>✳</span></div>
      </section>

      <section className="section-shell trending-section">
        <div className="section-heading">
          <div><span className="eyebrow">TRENDING COLLECTIONS</span><h2>Little things, <em>big moods.</em></h2></div>
          <Link className="text-link" to="/shop?sort=popular">See what is trending <ArrowUpRight size={15} /></Link>
        </div>
        <div className="product-grid">
          {[...products].sort((a, b) => b.rating - a.rating).slice(4, 8).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="section-shell bestsellers-section">
        <div className="section-heading">
          <div><span className="eyebrow">THE BEST-LOVED PIECES</span><h2>Best sellers, <em>for a reason.</em></h2></div>
          <Link className="text-link" to="/shop?sort=popular">Find your favourite <ArrowRight size={15} /></Link>
        </div>
        <div className="product-grid">
          {[...products].sort((a, b) => b.rating - a.rating).slice(0, 4).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} label="A BEST LOVED" />
          ))}
        </div>
      </section>

      <section className="review-section">
        <span className="eyebrow">KIND WORDS, WORN WELL</span>
        <Quote className="review-quote-icon" size={27} />
        <blockquote>“The kind of dress that makes you cancel your outfit change plans. It just feels like me.”</blockquote>
        <div className="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
        <p>ANANYA S. <span>·</span> Verified customer</p>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-illustration">✳</div>
        <div className="newsletter-copy">
          <span className="eyebrow">A LITTLE LOVE IN YOUR INBOX</span>
          <h2>Good things, <em>occasionally.</em></h2>
          <p>First dibs, thoughtful notes and 10% off your first order. No noise, promise.</p>
        </div>
        <form className="newsletter-form" onSubmit={subscribe}>
          <label className="visually-hidden" htmlFor="newsletter-email">Your email address</label>
          <input id="newsletter-email" type="email" placeholder="Your email address" value={email} onChange={event => setEmail(event.target.value)} required />
          <button type="submit" aria-label="Subscribe to newsletter"><ArrowRight size={20} /></button>
          <small>By subscribing, you agree to receive the occasional lovely email.</small>
        </form>
      </section>
    </main>
  );
}

export default Home;
