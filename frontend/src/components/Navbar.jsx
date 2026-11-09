import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useCart } from "../context/useCart";

function Navbar() {
  const { cart, wishlist } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const submitSearch = event => {
    event.preventDefault();
    navigate(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="announcement-bar">A little something lovely — complimentary delivery over ₹2,500</div>
      <header className="site-header">
        <div className="navbar">
          <button
            type="button"
            className="mobile-menu-toggle icon-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link to="/" className="logo" onClick={closeMenu} aria-label="Maison Muse home">
            <span className="logo-mark">m.</span>
            <span>maison muse<small>THE EVERYDAY EDIT</small></span>
          </Link>

          <nav className={`nav-links${menuOpen ? " nav-links-open" : ""}`} aria-label="Main navigation">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/shop" onClick={closeMenu}>Shop</NavLink>
            <NavLink to="/shop#categories" onClick={closeMenu}>Categories</NavLink>
            <NavLink to="/about" onClick={closeMenu}>Our story</NavLink>
            <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
          </nav>

          <div className="nav-actions">
            <form className="nav-search" role="search" onSubmit={submitSearch}>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                placeholder="Find your favourite..."
                aria-label="Search products"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </form>
            <Link to="/wishlist" className="icon-button icon-with-count" aria-label={`Wishlist, ${wishlist.length} items`}>
              <Heart size={20} />
              {wishlist.length > 0 && <span className="icon-count">{wishlist.length}</span>}
            </Link>
            <Link to="/profile" className="icon-button" aria-label="My account"><UserRound size={20} /></Link>
            <Link to="/cart" className="icon-button icon-with-count" aria-label={`Shopping bag, ${cartCount} items`}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="icon-count">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
