import { ArrowRight, Check, PackageCheck, ShoppingBag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { formatPrice } from "../lib/pricing";

function getOrders() {
  try { return JSON.parse(localStorage.getItem("orders") || "[]"); } catch { return []; }
}

function OrderConfirmation() {
  const { id } = useParams();
  const order = getOrders().find(item => String(item.id) === id);

  if (!order) {
    return (
      <main className="empty-state confirmation-page">
        <PackageCheck size={34} />
        <h1>We could not find that order.</h1>
        <p>Have an account? Your order may be available in your order history.</p>
        <Link to="/orders" className="button button-dark">Go to my orders <ArrowRight size={16} /></Link>
      </main>
    );
  }

  return (
    <main className="confirmation-page section-shell">
      <div className="confirmation-card">
        <div className="confirmation-check"><Check size={27} /></div>
        <span className="eyebrow">{order.paymentStatus === "Paid" ? "PAYMENT RECEIVED" : "THANK YOU, LOVELY"}</span>
        <h1>Your order is <em>in.</em></h1>
        <p className="confirmation-message">{order.paymentStatus === "Paid" ? "Your payment is confirmed. We cannot wait for you to meet your new favourites." : "Your order is confirmed. Have the payment ready when your lovely things arrive."}</p>
        <div className="confirmation-order-number"><span>ORDER NUMBER</span><strong>{order.id}</strong></div>
        <div className="confirmation-details">
          <div><span>Payment</span><strong>{order.paymentStatus}</strong></div>
          <div><span>Order total</span><strong>{formatPrice(order.total)}</strong></div>
          <div><span>Delivering to</span><strong>{order.customer?.name || "Your address"}</strong></div>
        </div>
        {order.storage === "browser" && (
          <p className="local-order-note">This order is saved in this browser. Live fulfilment and status updates require connecting the store order API.</p>
        )}
        <div className="confirmation-actions">
          <Link to="/orders" className="button button-dark">Track your order <PackageCheck size={16} /></Link>
          <Link to="/shop" className="button button-outline"><ShoppingBag size={16} /> Back to the shop</Link>
        </div>
      </div>
      <div className="confirmation-items">
        <span className="eyebrow">YOUR LITTLE LINE-UP</span>
        {order.items?.map((item, index) => (
          <div className="confirmation-item" key={`${item.id}-${item.size}-${index}`}>
            <img src={item.image} alt="" />
            <div><strong>{item.name || item.product_name}</strong><span>Size {item.size} · Qty {item.quantity}</span></div>
            <strong>{formatPrice((item.price || item.unit_price) * item.quantity)}</strong>
          </div>
        ))}
        <Link to="/contact" className="text-link">Need a hand? We are here for you <ArrowRight size={14} /></Link>
      </div>
    </main>
  );
}

export default OrderConfirmation;
