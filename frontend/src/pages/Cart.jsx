import { useContext } from 'react';
import { Link } from 'react-router-dom';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import { IndianRupee } from 'lucide-react';
import CartContext from '../context/CartContext';
import BackButton from '../components/common/BackButton';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useContext(CartContext);
  
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
          <div className="text-gray-400 flex justify-center mb-4">
            <ShoppingBag size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <div className="flex flex-col gap-4 items-center">
            <Link 
              to="/products" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors hover-scale"
            >
              Browse Products
            </Link>
            <BackButton />
          </div>
        </div>
      </div>
    );
  }

  const gstRate = 0.28; // 28% GST
  const subtotal = totalPrice || 0;
  const gstAmount = subtotal * gstRate;
  const orderTotal = subtotal + gstAmount;
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
        <BackButton />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cart Items ({cart.length})</h2>
              
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center">
                    <div className="sm:w-20 sm:h-20 w-full h-32 flex-shrink-0 mb-4 sm:mb-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="sm:ml-4 flex-grow">
                      <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                      <p className="text-blue-600 font-semibold flex items-center">
                         <IndianRupee size={14} className="mr-1" />{item.price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center mt-4 sm:mt-0">
                      <div className="flex items-center border rounded-md mr-4">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-2 py-1 border-r text-gray-600 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-2 py-1 border-l text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="flex items-center"><IndianRupee size={14} className="mr-1" />{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (assuming 28% GST)</span>
                <span className="flex items-center"><IndianRupee size={14} className="mr-1" />{gstAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="flex items-center"><IndianRupee size={16} className="mr-1" />{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Link 
              to="/checkout" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center hover-scale"
            >
              Proceed to Checkout
              <ArrowRight size={18} className="ml-2" />
            </Link>
            
            <div className="mt-6 text-center">
              <Link 
                to="/products" 
                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;