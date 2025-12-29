import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => 
        item.id === product.id && item.priceId === product.priceId
      );
      if (existingItem) {
        return prevCart.map((item) =>
          (item.id === product.id && item.priceId === product.priceId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, priceId) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === productId && item.priceId === priceId)));
  };

  const updateQuantity = (productId, priceId, quantity) => {
    if (quantity < 1) {
        removeFromCart(productId, priceId);
        return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id === productId && item.priceId === priceId)
          ? { ...item, quantity: parseInt(quantity, 10) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}