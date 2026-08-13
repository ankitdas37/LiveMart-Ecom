import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [dbSynced, setDbSynced] = useState(false);

  // Get the current user token safely from localStorage
  const getToken = () => {
    try {
      const info = localStorage.getItem('userInfo');
      return info ? JSON.parse(info).token : null;
    } catch {
      return null;
    }
  };

  const cfg = () => {
    const token = getToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const isLoggedIn = () => !!getToken();

  // ── Load cart on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true);
      const token = getToken();
      if (token) {
        // Logged-in: fetch from DB
        try {
          const { data } = await axios.get('/api/cart', cfg());
          setCartItems(data);
          setDbSynced(true);
        } catch (e) {
          console.error('Failed to load cart from DB', e);
        }
      } else {
        setCartItems([]);
      }
      setCartLoading(false);
    };
    loadCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Called externally from AuthContext after login (or on mount after a fresh login)
  const syncLocalCartToDb = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const saved = localStorage.getItem('cartItems');
    let localItems = [];
    if (saved) {
      try { localItems = JSON.parse(saved); } catch {}
    }

    try {
      if (localItems.length > 0) {
        await axios.post('/api/cart/sync', {
          items: localItems.map(i => ({ productId: i.id, quantity: i.quantity }))
        }, cfg());
        localStorage.removeItem('cartItems');
      }
      // Always reload from DB
      const { data } = await axios.get('/api/cart', cfg());
      setCartItems(data);
    } catch (e) {
      console.error('Failed to sync/load cart', e);
    }
  }, []);

  // ── addToCart ──────────────────────────────────────────────────────────────
  const addToCart = async (product, quantity = 1) => {
    if (!isLoggedIn()) {
      import('react-hot-toast').then((module) => {
        module.toast.error('Please login to add items to your cart.');
      });
      setTimeout(() => {
        window.location.href = '/login?redirect=' + window.location.pathname;
      }, 1500);
      return;
    }

    // Optimistic update
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });

    try {
      await axios.post('/api/cart', { productId: product.id, quantity }, cfg());
    } catch (e) {
      console.error('Failed to add to DB cart', e);
    }
  };

  // ── removeFromCart ─────────────────────────────────────────────────────────
  const removeFromCart = async (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));

    if (isLoggedIn()) {
      try {
        await axios.delete(`/api/cart/${id}`, cfg());
      } catch (e) {
        console.error('Failed to remove from DB cart', e);
      }
    }
  };

  // ── updateQuantity ─────────────────────────────────────────────────────────
  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));

    if (isLoggedIn()) {
      try {
        await axios.put(`/api/cart/${id}`, { quantity }, cfg());
      } catch (e) {
        console.error('Failed to update DB cart', e);
      }
    }
  };

  // ── clearCart ──────────────────────────────────────────────────────────────
  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');

    if (isLoggedIn()) {
      try {
        await axios.delete('/api/cart', cfg());
      } catch (e) {
        console.error('Failed to clear DB cart', e);
      }
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncLocalCartToDb,
      cartTotal,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
