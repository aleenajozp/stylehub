import { useEffect, useMemo, useState } from "react";
import { ArrowRight, PackageCheck, Search, ShoppingBag, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { formatPrice } from "../lib/pricing";

const trackingSteps = ["Order confirmed", "Processing", "Shipped", "Delivered"];

function readLocalOrders() {
  try { return JSON.parse(localStorage.getItem("orders") || "[]"); } catch { return []; }
}

function normalizeApiOrder(order) {
  return {
    id: order.id,
    createdAt: order.created_at,
    total: Number(order.total_amount),
    paymentMethod: order.payment_status === "paid" ? "Online payment" : "Cash on Delivery",
    paymentStatus: order.payment_status,
    status: order.order_status,
    customer: { name: order.user_email || "Account holder", address: order.delivery_address },
    items: (order.items || []).map(item => ({
      id: item.product,
      name: item.product_name,
      price: Number(item.unit_price),
      size: item.size,
      quantity: item.quantity,
    })),
    storage: "backend",
  };
}

function Orders() {
  const [orders, setOrders] = useState(readLocalOrders);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("accessToken")));
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const hasSession = Boolean(localStorage.getItem("accessToken"));

  useEffect(() => {
    if (!hasSession) return undefined;
    let active = true;
    apiRequest("/orders/my-orders/", { authenticated: true })
      .then(data => {
        if (!active) return;
        const apiOrders = (Array.isArray(data) ? data : data?.results || []).map(normalizeApiOrder);
        const localOrders = readLocalOrders();
        const localIds = new Set(localOrders.map(order => String(order.id)));
        setOrders([...localOrders, ...apiOrders.filter(order => !localIds.has(String(order.id)))]);
      })
      .catch(loadError => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [hasSession]);

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter(order => !term || String(order.id).toLowerCase().includes(term));
  }, [orders, search]);

  return (
    <main className="orders-page section-shell">
      <div className="page-intro">
        <span className="eyebrow">YOUR LITTLE LINE-UP</span>
        <h1>My orders<span>.</span></h1>
        <p>Every lovely thing, all in one place.</p>
      </div>
      {error && <p className="form-message form-message-error orders-error" role="alert">{error}</p>}
      <label className="orders-search"><Search size={16} /><span className="visually-hidden">Find an order by number</span>
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Find an order by number" />
      </label>

      {loading && <div className="loading-state"><span className="loading-spinner" /> Gathering your orders...</div>}
      {!loading && visibleOrders.length === 0 && (
        <div className="empty-state orders-empty">
          <div className="empty-bag-icon"><PackageCheck size={26} /></div>
          <h2>{search ? "No order with that number." : "Nothing on its way just yet."}</h2>
          <p>{search ? "Check the number and give it another try." : "Once you find something you love, we will keep its details right here."}</p>
          {search ? <button className="button button-outline" type="button" onClick={() => setSearch("")}>Clear search</button> : <Link to="/shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link>}
        </div>
      )}

      <div className="orders-list">
        {visibleOrders.map(order => {
          const currentStep = trackingSteps.findIndex(step => step.toLowerCase() === String(order.status).toLowerCase());
          const activeStep = order.status === "shipped" ? 2 : order.status === "delivered" ? 3 : Math.max(currentStep, 0);
          return (
            <article className="order-card" key={order.id}>
              <div className="order-card-heading">
                <div><span className="eyebrow">ORDER · {order.id}</span><p>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>
                <span className={`order-status${String(order.status).toLowerCase() === "delivered" ? " order-status-done" : ""}`}><span />{String(order.status).replaceAll("_", " ")}</span>
              </div>
              <div className="order-card-items">
                {order.items?.slice(0, 3).map((item, index) => (
                  <div className="order-card-item" key={`${item.id}-${index}`}>
                    {item.image ? <img src={item.image} alt="" /> : <div className="order-placeholder"><ShoppingBag size={18} /></div>}
                    <div><strong>{item.name || item.product_name}</strong><span>Size {item.size} · Qty {item.quantity}</span></div>
                  </div>
                ))}
                {order.items?.length > 3 && <span className="order-extra-count">+{order.items.length - 3} more pieces</span>}
              </div>
              <div className="order-progress" aria-label={`Tracking status: ${order.status}`}>
                {trackingSteps.map((step, index) => (
                  <div className={`tracking-step${index <= activeStep ? " tracking-step-active" : ""}`} key={step}>
                    <span className="tracking-dot">{index <= activeStep ? <PackageCheck size={13} /> : null}</span>
                    <small>{step}</small>
                  </div>
                ))}
              </div>
              <div className="order-card-footer"><span>{order.paymentMethod} <i>·</i> {order.paymentStatus}</span><strong>{formatPrice(order.total)}</strong></div>
            </article>
          );
        })}
      </div>
      {!hasSession && !orders.length && <div className="orders-login-note"><Truck size={16} /> Signed in already? <Link to="/login">Sign in to find your account orders.</Link></div>}
    </main>
  );
}

export default Orders;
