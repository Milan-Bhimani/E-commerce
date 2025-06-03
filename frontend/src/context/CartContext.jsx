import { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';

const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  totalPrice: 0
});

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  const getCartKey = () => {
    return user ? `cart_${user._id}` : 'cart_guest';
  };

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(getCartKey());
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [itemCount, setItemCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    
    // Calculate item count and total price
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const price = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    
    setItemCount(count);
    setTotalPrice(price);
  }, [cart, user]); // Added user as dependency to update cart when user changes

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item._id === product._id);
      
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Item doesn't exist, add new item
        return [
          ...prevCart,
          {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity
          }
        ];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;