import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { API_BASE_URL, createLocalOrderId, saveLocalOrder } from "../lib/api";
import { calculateOrder, formatPrice } from "../lib/pricing";

const initialForm = { name: "", email: "", phone: "", address: "" };

function Checkout() {
  const { cart, clearCart, notify } = useCart();
  const [form, setForm] = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponApplied, setCouponApplied] = useState(() => new URLSearchParams(window.location.search).get("coupon") === "MUSE10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const pricing = calculateOrder(cart, couponApplied);

  const updateForm = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const saveCodOrder = event => {
    event.preventDefault();
    setError("");
    const order = {
      id: createLocalOrderId(),
      createdAt: new Date().toISOString(),
      customer: { ...form },
      items: cart,
      subtotal: pricing.subtotal,
      shipping: pricing.delivery,
      discount: pricing.couponDiscount + pricing.itemSavings,
      total: pricing.total,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pay on delivery",
      status: "Order confirmed",
      tracking: ["Order confirmed"],
      storage: "browser",
    };
    saveLocalOrder(order);
    clearCart();
    navigate(`/order-confirmation/${encodeURIComponent(order.id)}`);
  };

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Secure payment checkout could not be loaded. Please try again or choose Cash on Delivery."));
    document.body.appendChild(script);
  });

  const payOnline = async event => {
    event.preventDefault();
    setError("");
    const orderUrl = import.meta.env.VITE_RAZORPAY_ORDER_URL;
    const verifyUrl = import.meta.env.VITE_RAZORPAY_VERIFY_URL;
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!orderUrl || !verifyUrl || !keyId) {
      setError("Online payments are not connected yet. Configure VITE_RAZORPAY_ORDER_URL, VITE_RAZORPAY_VERIFY_URL and VITE_RAZORPAY_KEY_ID with your backend before accepting payments.");
      return;
    }

    setBusy(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const orderResponse = await fetch(orderUrl.startsWith("http") ? orderUrl : `${API_BASE_URL}${orderUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          items: cart.map(({ id, size, quantity }) => ({ product_id: id, size, quantity })),
          customer: form,
          coupon_code: couponApplied ? "MUSE10" : "",
          delivery_address: form.address,
          phone_number: form.phone,
        }),
      });
      const serverOrder = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(serverOrder?.detail || `Could not create a secure order (HTTP ${orderResponse.status}).`);
      if (!serverOrder.id && !serverOrder.order_id) throw new Error("The payment service did not return a server-created order ID.");
      if (!Number.isFinite(Number(serverOrder.amount)) || Number(serverOrder.amount) <= 0) {
        throw new Error("The payment service did not return a valid server-calculated amount.");
      }
      await loadRazorpay();
      setBusy(false);

      const gateway = new window.Razorpay({
        key: keyId,
        amount: serverOrder.amount,
        currency: serverOrder.currency || "INR",
        name: "Maison Muse",
        description: "A little something lovely",
        order_id: serverOrder.id || serverOrder.order_id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#292520" },
        handler: async payment => {
          setBusy(true);
          try {
            const verifyResponse = await fetch(verifyUrl.startsWith("http") ? verifyUrl : `${API_BASE_URL}${verifyUrl}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({
                razorpay_order_id: payment.razorpay_order_id,
                razorpay_payment_id: payment.razorpay_payment_id,
                razorpay_signature: payment.razorpay_signature,
              }),
            });
            let verification = null;
            try { verification = await verifyResponse.json(); } catch { /* The response status still signals a failed verification. */ }
            if (!verifyResponse.ok || verification?.verified !== true) {
              throw new Error(verification?.detail || "We could not verify this payment. Please contact support before trying again.");
            }
            const order = {
              id: verification?.order_id || payment.razorpay_order_id,
              createdAt: new Date().toISOString(),
              customer: { ...form },
              items: cart,
              subtotal: pricing.subtotal,
              shipping: pricing.delivery,
              discount: pricing.couponDiscount + pricing.itemSavings,
              total: Number(serverOrder.amount) / 100,
              paymentMethod: "Razorpay",
              paymentStatus: "Paid",
              status: "Order confirmed",
              tracking: ["Order confirmed"],
              storage: "browser",
            };
            saveLocalOrder(order);
            clearCart();
            navigate(`/order-confirmation/${encodeURIComponent(order.id)}`);
          } catch (verificationError) {
            setError(verificationError.message);
            notify("Payment verification needs attention. Please contact support before retrying.", "error");
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setError("Payment was cancelled. Your bag is still here whenever you are ready.");
          },
        },
      });
      gateway.on("payment.failed", response => {
        setError(response.error?.description || "Your payment could not be completed. Please try again.");
        setBusy(false);
      });
      gateway.open();
    } catch (paymentError) {
      setError(paymentError.message);
      setBusy(false);
    }
  };

  if (!cart.length) {
    return (
      <main className="empty-state checkout-empty">
        <span className="empty-state-mark">✳</span>
        <h1>Your bag is taking a breather.</h1>
        <p>Add a piece or two before heading to checkout.</p>
        <Link to="/shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link>
      </main>
    );
  }

  return (
    <main className="checkout-page section-shell">
      <Link to="/cart" className="back-link"><ArrowLeft size={15} /> Back to your bag</Link>
      <div className="page-intro checkout-intro">
        <span className="eyebrow">JUST A FEW LITTLE DETAILS</span>
        <h1>Make it <em>yours.</em></h1>
        <p>Where should we send your lovely things?</p>
      </div>
      <form className="checkout-layout" onSubmit={paymentMethod === "cod" ? saveCodOrder : payOnline}>
        <div className="checkout-form-column">
          <section className="checkout-panel">
            <div className="checkout-step"><span>01</span><div><h2>Delivery details</h2><p>We will keep these safe and just for this order.</p></div></div>
            <div className="form-grid">
              <label className="field-full">Full name<input name="name" autoComplete="name" value={form.name} onChange={updateForm} required maxLength={150} /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={updateForm} required /></label>
              <label>Phone number<input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={updateForm} required minLength={7} maxLength={30} /></label>
              <label className="field-full">Delivery address<textarea name="address" autoComplete="street-address" value={form.address} onChange={updateForm} required maxLength={2000} rows={3} placeholder="House number, street, city, PIN code" /></label>
            </div>
          </section>

          <section className="checkout-panel">
            <div className="checkout-step"><span>02</span><div><h2>How would you like to pay?</h2><p>Your details stay private and protected.</p></div></div>
            <div className="payment-options">
              <label className={`payment-option${paymentMethod === "cod" ? " selected" : ""}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                <span className="payment-option-icon"><Truck size={19} /></span>
                <span className="payment-option-copy"><strong>Cash on Delivery</strong><small>Pay when your order arrives</small></span>
                <span className="payment-radio" />
              </label>
              <label className={`payment-option${paymentMethod === "razorpay" ? " selected" : ""}`}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} />
                <span className="payment-option-icon"><CreditCard size={19} /></span>
                <span className="payment-option-copy"><strong>Online payment</strong><small>UPI, cards & net banking via Razorpay</small></span>
                <span className="payment-radio" />
              </label>
            </div>
            {error && <p className="form-message form-message-error checkout-error" role="alert">{error}</p>}
          </section>
          <button type="submit" className="button button-dark place-order-button" disabled={busy}>
            {busy ? "One moment..." : paymentMethod === "cod" ? "Place my order" : "Pay securely"} <ArrowRight size={17} />
          </button>
          <p className="secure-note checkout-secure"><ShieldCheck size={15} /> {paymentMethod === "razorpay" ? "Card details are handled by Razorpay and never stored here." : "You can pay when your order arrives."}</p>
        </div>

        <aside className="order-summary checkout-summary">
          <h2>Your lovely things</h2>
          <div className="checkout-items">
            {cart.map(item => (
              <div className="checkout-item" key={`${item.id}-${item.size}`}>
                <div className="checkout-item-image"><img src={item.image} alt="" /><span>{item.quantity}</span></div>
                <div><strong>{item.name}</strong><small>{item.color} · {item.size}</small></div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <button type="button" className="checkout-coupon-link" onClick={() => setCouponApplied(applied => !applied)}>
            {couponApplied ? <><Check size={15} /> MUSE10 applied — remove</> : "Have a MUSE10 code? Apply 10%"}
          </button>
          <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(pricing.subtotal)}</strong></div>
          <div className="summary-row"><span>Delivery</span><strong>{pricing.delivery ? formatPrice(pricing.delivery) : "On us"}</strong></div>
          {pricing.couponDiscount > 0 && <div className="summary-row summary-savings"><span>MUSE10</span><strong>−{formatPrice(pricing.couponDiscount)}</strong></div>}
          <div className="summary-total"><span>Total</span><strong>{formatPrice(pricing.total)}</strong></div>
          <p className="checkout-delivery-note"><Truck size={15} /> Complimentary delivery over ₹2,500.</p>
        </aside>
      </form>
    </main>
  );
}

export default Checkout;
