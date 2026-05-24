import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('book_store_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error parsing cart data", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('book_store_cart', JSON.stringify(items));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const addToCart = (book, quantity = 1) => {
    const existingItemIndex = cartItems.findIndex(item => item._id === book._id);
    let newItems = [...cartItems];

    if (existingItemIndex > -1) {
      newItems[existingItemIndex].quantity += quantity;
      showToast(`Updated quantity of "${book.title}" in your bag!`);
    } else {
      newItems.push({
        _id: book._id,
        title: book.title,
        author: book.author,
        price: book.price,
        coverImage: book.coverImage,
        quantity
      });
      showToast(`Added "${book.title}" to your bag!`);
    }

    saveCart(newItems);
  };

  const removeFromCart = (bookId) => {
    const itemToRemove = cartItems.find(item => item._id === bookId);
    const newItems = cartItems.filter(item => item._id !== bookId);
    saveCart(newItems);
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.title}" from your bag`, 'info');
    }
  };

  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    const newItems = cartItems.map(item => {
      if (item._id === bookId) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      toast,
      showToast
    }}>
      {children}
      {/* Global Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce">
          <div className={`px-5 py-3 rounded-xl shadow-lg border backdrop-blur-md text-sm font-medium flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : toast.type === 'info'
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <span className="h-2 w-2 rounded-full animate-ping bg-current" />
            {toast.message}
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
