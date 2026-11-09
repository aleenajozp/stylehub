import { useState } from "react";
import { ArrowUpRight, Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";

function ProductCard({ product, index = 0, label = "" }) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [size, setSize] = useState(product.sizes?.[0] || "One size");
  const isFavourite = wishlist.some(item => item.id === product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article className="product-card" style={{ "--card-index": index }}>
      <div className="product-image">
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        {discount ? <span className="product-badge">{discount}% off</span> : label && <span className="product-badge">{label}</span>}
        <button
          type="button"
          className={`wishlist-button${isFavourite ? " is-favourite" : ""}`}
          onClick={() => toggleWishlist(product)}
          aria-label={isFavourite ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isFavourite}
        >
          <Heart size={18} fill={isFavourite ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className="quick-add"
          onClick={() => addToCart(product, size)}
        >
          <ShoppingBag size={16} /> Quick add
        </button>
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="product-rating"><Star size={13} fill="currentColor" /> {product.rating || "4.8"}</span>
        </div>
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <div className="product-price">
          <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
          {product.originalPrice && <del>₹{Number(product.originalPrice).toLocaleString("en-IN")}</del>}
        </div>
        <div className="product-card-bottom">
          <label className="visually-hidden" htmlFor={`size-${product.id}`}>Select size for {product.name}</label>
          <select id={`size-${product.id}`} value={size} onChange={event => setSize(event.target.value)}>
            {(product.sizes?.length ? product.sizes : ["One size"]).map(option => (
              <option key={option} value={option}>Size {option}</option>
            ))}
          </select>
          <Link className="product-details-link" to={`/product/${product.id}`} aria-label={`Details for ${product.name}`}>
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
