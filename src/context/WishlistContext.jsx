import React, { createContext, useState, useEffect, useContext } from 'react';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { showToast } = useCart();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem('book_store_wishlist');
    if (storedWishlist) {
      try {
        setWishlistItems(JSON.parse(storedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist data", e);
      }
    }
  }, []);

  // Save wishlist to localStorage
  const saveWishlist = (items) => {
    setWishlistItems(items);
    localStorage.setItem('book_store_wishlist', JSON.stringify(items));
  };

  const addToWishlist = (book) => {
    if (wishlistItems.some(item => item._id === book._id)) return;
    const newItems = [...wishlistItems, book];
    saveWishlist(newItems);
    showToast(`Added "${book.title}" to your wishlist!`);
  };

  const removeFromWishlist = (bookId) => {
    const itemToRemove = wishlistItems.find(item => item._id === bookId);
    const newItems = wishlistItems.filter(item => item._id !== bookId);
    saveWishlist(newItems);
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.title}" from your wishlist`, 'info');
    }
  };

  const toggleWishlist = (book) => {
    if (wishlistItems.some(item => item._id === book._id)) {
      removeFromWishlist(book._id);
    } else {
      addToWishlist(book);
    }
  };

  const isInWishlist = (bookId) => {
    return wishlistItems.some(item => item._id === bookId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
