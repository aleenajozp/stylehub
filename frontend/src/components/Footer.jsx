import { Camera, UsersRound, ArrowUpRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="logo footer-logo">
            <span className="logo-mark">m.</span>
            <span>maison muse<small>THE EVERYDAY EDIT</small></span>
          </Link>
          <p>Thoughtful pieces for the way you really live. Made to be worn, loved, and worn again.</p>
          <div className="social-links">
            <a href="https://www.instagram.com/" aria-label="Visit Instagram" target="_blank" rel="noreferrer"><Camera size={19} /></a>
            <a href="https://www.facebook.com/" aria-label="Visit Facebook" target="_blank" rel="noreferrer"><UsersRound size={19} /></a>
            <a href="mailto:hello@maisonmuse.in" aria-label="Email Maison Muse"><Mail size={18} /></a>
          </div>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/shop">Shop all <ArrowUpRight size={13} /></Link>
          <Link to="/shop?category=Casual%20Dresses">Dresses <ArrowUpRight size={13} /></Link>
          <Link to="/shop?category=Ethnic%20Wear">Ethnic edit <ArrowUpRight size={13} /></Link>
          <Link to="/about">Our story <ArrowUpRight size={13} /></Link>
        </div>
        <div className="footer-column">
          <h3>Here to help</h3>
          <Link to="/contact">Contact us <ArrowUpRight size={13} /></Link>
          <Link to="/orders">Track an order <ArrowUpRight size={13} /></Link>
          <Link to="/profile">My account <ArrowUpRight size={13} /></Link>
          <Link to="/cart">Your shopping bag <ArrowUpRight size={13} /></Link>
        </div>
        <div className="footer-note">
          <span className="eyebrow">A NOTE FROM US</span>
          <p>Good clothes. Good people. A little more joy in getting dressed.</p>
          <Link to="/shop" className="text-link">Find your new favourite <span>↗</span></Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Maison Muse. Made with care.</span>
        <span>Made for the everyday, wherever you are.</span>
        <span>Secure checkout · Thoughtful delivery</span>
      </div>
    </footer>
  );
}

export default Footer;
