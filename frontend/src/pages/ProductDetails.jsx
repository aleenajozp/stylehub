import { useState } from "react";
import { ArrowLeft, ArrowRight, Heart, ShieldCheck, Star, Truck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import products from "../data/products";
import { useCart } from "../context/useCart";

function ProductDetails() {
  const { id } = useParams();
  const product = products.find(item => item.id === Number(id));
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState(product?.sizes?.[0] || "");
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState("");

  if (!product) {
    return (
      <main className="empty-state product-not-found">
        <span className="empty-state-mark">✳</span>
        <h1>This piece has wandered off.</h1>
        <p>Let us help you find something lovely instead.</p>
        <Link to="/shop" className="button button-dark">Back to the collection <ArrowRight size={16} /></Link>
      </main>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const isSaved = wishlist.some(item => item.id === product.id);
  const addAndCheckout = () => {
    if (!size) {
      setSizeError("Please choose a size before adding this piece.");
      return;
    }
    addToCart(product, size);
    navigate("/checkout");
  };

  return (
    <main className="details-page section-shell">
      <div className="details-gallery">
        <div className="details-main-image">
          <img src={images[activeImage]} alt={product.name} />
          <button
            type="button"
            className={`wishlist-button details-wishlist${isSaved ? " is-favourite" : ""}`}
            onClick={() => toggleWishlist(product)}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isSaved}
          ><Heart size={19} fill={isSaved ? "currentColor" : "none"} /></button>
        </div>
        {images.length > 1 && (
          <div className="details-thumbnails" aria-label="Product images">
            {images.map((image, index) => (
              <button
                type="button"
                key={image}
                className={index === activeImage ? "active" : ""}
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={index === activeImage}
              ><img src={image} alt="" /></button>
            ))}
          </div>
        )}
      </div>

      <section className="details-copy">
        <Link to="/shop" className="back-link"><ArrowLeft size={15} /> Back to the collection</Link>
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <div className="details-rating"><span><Star size={15} fill="currentColor" /> {product.rating || "4.8"}</span><span>Kind words from our customers</span></div>
        <div className="details-price">
          <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
          {product.originalPrice && <del>₹{Number(product.originalPrice).toLocaleString("en-IN")}</del>}
          {product.originalPrice && <span>Save ₹{(product.originalPrice - product.price).toLocaleString("en-IN")}</span>}
        </div>
        <p className="details-description">{product.description}</p>

        <div className="details-color"><span>Colour</span><strong>{product.color}</strong><i style={{ backgroundColor: product.color.toLowerCase().includes("rose") ? "#d9a3a2" : product.color.toLowerCase().includes("black") ? "#282524" : "#c2a88f" }} /></div>
        <div className="size-picker-heading"><span>Choose your size</span><button type="button" onClick={() => setSizeError("Our pieces are designed for a comfortable, true-to-size fit. Between sizes? Choose the larger size for a relaxed feel.")}>Size guide</button></div>
        <div className="size-options" role="group" aria-label="Available sizes">
          {(product.sizes || []).map(option => (
            <button type="button" key={option} className={size === option ? "selected" : ""} onClick={() => { setSize(option); setSizeError(""); }}>{option}</button>
          ))}
        </div>
        {sizeError && <p className="form-message form-message-error" role="status">{sizeError}</p>}

        <div className="details-actions">
          <button type="button" className="button button-dark" onClick={() => addToCart(product, size)}>Add to bag <ArrowRight size={16} /></button>
          <button type="button" className="button button-outline" onClick={addAndCheckout}>Buy now</button>
        </div>
        <div className="details-promises">
          <span><Truck size={17} /> Complimentary delivery over ₹2,500</span>
          <span><ShieldCheck size={17} /> Easy 7-day returns</span>
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;
