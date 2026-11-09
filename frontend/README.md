# Maison Muse storefront

The existing React + Vite storefront, using React Router, Lucide icons, and the Django API where it is already available.

## Run locally

```powershell
npm install
npm run dev
```

Run `npm run lint` and `npm run build` to validate the app.

## Backend connection

Set `VITE_API_BASE_URL` to the Django API base URL if it differs from `http://127.0.0.1:8000/api`. Registration, sign-in, profile updates, and account order history use the existing Django endpoints. Product browsing, cart, wishlist, and cash-on-delivery preview orders currently use the frontend catalog and browser storage.

Cash-on-delivery orders are saved in the current browser and are not submitted for fulfilment. Connect an authenticated order/cart API before using this storefront for live orders. The `MUSE10` coupon and shipping calculation are frontend previews; a production order API must validate and calculate all prices, coupons, and delivery charges on the server.

## Razorpay connection

Online payments are intentionally unavailable until a trusted backend is configured. Set these Vite environment variables:

- `VITE_RAZORPAY_KEY_ID` — Razorpay public key ID only.
- `VITE_RAZORPAY_ORDER_URL` — backend endpoint that validates the cart and creates a Razorpay order. It must return a server-created `id` (or `order_id`), `amount` in paise, and optionally `currency`.
- `VITE_RAZORPAY_VERIFY_URL` — backend endpoint that verifies the Razorpay signature and persists the paid order. It must return `{ "verified": true, "order_id": "..." }` only after successful verification.

The Razorpay secret key must stay on the backend. Never use a `VITE_` variable for a secret. The existing Django project does not currently expose Razorpay order creation or signature-verification endpoints; the frontend reports a configuration error rather than simulating a successful payment.
