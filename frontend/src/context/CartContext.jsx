import { useEffect, useState } from "react";
import CartContext from "./cartContextValue";

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage("cart", []));
  const [wishlist, setWishlist] = useState(() => readStorage("wishlist", []));
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const notify = (message, kind = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(current => [...current, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id));
    }, 3200);
  };

  const addToCart = (product, size = product.sizes?.[0] || "One size") => {
    setCart(current => {
      const found = current.some(item => item.id === product.id && item.size === size);
      if (found) {
        return current.map(item => item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item);
      }
      return [...current, { ...product, size, quantity: 1 }];
    });
    notify(`${product.name} added to your bag.`);
  };

  const removeFromCart = (id, size) => {
    setCart(current => current.filter(item => !(item.id === id && item.size === size)));
    notify("Item removed from your bag.");
  };

  const changeQuantity = (id, size, amount) => {
    setCart(current => current.map(item => item.id === id && item.size === size
      ? { ...item, quantity: Math.max(1, item.quantity + amount) }
      : item));
  };

  const toggleWishlist = product => {
    const saved = wishlist.some(item => item.id === product.id);
    setWishlist(current => saved
      ? current.filter(item => item.id !== product.id)
      : [...current, product]);
    notify(saved ? "Removed from your wishlist." : "Saved to your wishlist.");
  };

  const clearCart = () => setCart([]);
  const dismissToast = id => setToasts(current => current.filter(toast => toast.id !== id));

  return (
    <CartContext.Provider value={{
      cart, wishlist, toasts, addToCart, removeFromCart, changeQuantity,
      toggleWishlist, clearCart, notify, dismissToast,
    }}>
      {children}
    </CartContext.Provider>
  );
}
