import { useState } from "react";
import { ArrowRight, ArrowUpRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import { calculateOrder, COUPON_CODE, formatPrice } from "../lib/pricing";

function Cart() {
  const { cart, removeFromCart, changeQuantity, notify } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const summary = calculateOrder(cart, couponApplied);

  const applyCoupon = event => {
    event.preventDefault();
    if (coupon.trim().toUpperCase() !== COUPON_CODE) {
      setCouponError("That code did not work. Try MUSE10 for a little treat.");
      setCouponApplied(false);
      return;
    }
    setCouponError("");
    setCouponApplied(true);
    notify("MUSE10 applied. Enjoy 10% off your pieces.");
  };

  return (
    <main className="cart-page section-shell">
      <div className="page-intro">
        <span className="eyebrow">YOUR EDIT, YOUR WAY</span>
        <h1>Your shopping bag<span>.</span></h1>
        <p>{cart.length ? `${cart.reduce((sum, item) => sum + item.quantity, 0)} lovely ${cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "thing" : "things"} picked out just for you.` : "A little space for something lovely."}</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state cart-empty">
          <div className="empty-bag-icon"><ShoppingBag size={27} /></div>
          <h2>Looks like your bag is taking a breather.</h2>
          <p>There is plenty of lovely out there. We saved your favourites for when you are ready.</p>
          <Link to="/shop" className="button button-dark">Find something lovely <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Items in your shopping bag">
            <div className="cart-list-header"><span>YOUR PIECES ({cart.length})</span><Link to="/shop">Keep looking <ArrowUpRight size={14} /></Link></div>
            {cart.map(item => (
              <article className="cart-item" key={`${item.id}-${item.size}`}>
                <Link to={`/product/${item.id}`} className="cart-item-image"><img src={item.image} alt={item.name} /></Link>
                <div className="cart-item-details">
                  <span className="eyebrow">{item.category}</span>
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                  <span className="cart-item-variant">Colour: {item.color} <span>·</span> Size: {item.size}</span>
                  <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" aria-label="Decrease quantity" onClick={() => changeQuantity(item.id, item.size, -1)}><Minus size={13} /></button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => changeQuantity(item.id, item.size, 1)}><Plus size={13} /></button>
                  </div>
                </div>
                <div className="cart-item-total">
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                  {item.originalPrice && <del>{formatPrice(item.originalPrice * item.quantity)}</del>}
                  <button type="button" onClick={() => removeFromCart(item.id, item.size)} aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button>
                </div>
              </article>
            ))}
            <div className="cart-note"><ShieldCheck size={17} /> Easy returns within 7 days. Because finding your fit should feel good.</div>
          </section>

          <aside className="order-summary">
            <h2>A little sum-up</h2>
            <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(summary.subtotal)}</strong></div>
            {summary.itemSavings > 0 && <div className="summary-row summary-savings"><span>Your price savings</span><strong>−{formatPrice(summary.itemSavings)}</strong></div>}
            <div className="summary-row"><span>Delivery</span><strong>{summary.delivery ? formatPrice(summary.delivery) : "On us"}</strong></div>
            <form className="coupon-form" onSubmit={applyCoupon}>
              <label htmlFor="coupon-code">A little treat for your order?</label>
              <div><input id="coupon-code" value={coupon} onChange={event => setCoupon(event.target.value)} placeholder="Enter code" disabled={couponApplied} />
                <button type="submit" disabled={couponApplied}>{couponApplied ? "Added" : "Apply"}</button></div>
              {couponError && <p className="form-message form-message-error" role="alert">{couponError}</p>}
              {couponApplied && <p className="form-message form-message-success" role="status">10% off, just for you.</p>}
            </form>
            {couponApplied && <div className="summary-row summary-savings"><span>MUSE10 little treat</span><strong>−{formatPrice(summary.couponDiscount)}</strong></div>}
            <div className="summary-total"><span>Your total</span><strong>{formatPrice(summary.total)}</strong></div>
            <p className="summary-tax-note">All prices include applicable taxes.</p>
            <Link to={`/checkout${couponApplied ? "?coupon=MUSE10" : ""}`} className="button button-dark checkout-button">On to checkout <ArrowRight size={16} /></Link>
            <p className="secure-note"><ShieldCheck size={15} /> A safe, secure checkout. Always.</p>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
