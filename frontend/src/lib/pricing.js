export const DELIVERY_FEE = 99;
export const FREE_DELIVERY_THRESHOLD = 2500;
export const COUPON_CODE = "MUSE10";
export const COUPON_RATE = 0.1;
export const COUPON_LIMIT = 500;

export function calculateOrder(cart, couponApplied = false) {
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemSavings = cart.reduce((sum, item) =>
    sum + Math.max(0, Number(item.originalPrice || item.price) - Number(item.price)) * item.quantity, 0);
  const couponDiscount = couponApplied ? Math.min(Math.round(subtotal * COUPON_RATE), COUPON_LIMIT) : 0;
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return {
    subtotal,
    itemSavings,
    couponDiscount,
    delivery,
    total: Math.max(0, subtotal - couponDiscount) + delivery,
  };
}

export function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}
