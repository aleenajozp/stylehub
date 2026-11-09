
import { useCart } from "../context/useCart";
import ProductCard from "../components/ProductCard";
import { ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

function Wishlist() {
  const { wishlist } = useCart();

  return (
    <main className="shop-page section-shell">
      <div className="page-intro">
        <span className="eyebrow">THE PIECES YOU LOVE</span>
        <h1>My wishlist<span>.</span></h1>
        <p>Your favourites, all in one lovely place.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-bag-icon"><Heart size={25} /></div>
          <h2>Save a little room for lovely.</h2>
          <p>Tap the heart on anything you love and it will be waiting right here.</p>
          <Link to="/shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

export default Wishlist;
